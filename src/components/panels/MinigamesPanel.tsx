import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { TvAdMinigame } from '../minigames/TvAdMinigame'
import { DebateMinigame } from '../minigames/DebateMinigame'
import { StumpSpeechMinigame } from '../minigames/StumpSpeechMinigame'
import { FundraiserMinigame } from '../minigames/FundraiserMinigame'
import type { MinigameId } from '../../game/types'

const MINIGAME_INFO: Record<MinigameId, { name: string; emoji: string; description: string }> = {
  tv_ad: { name: 'TV Ad', emoji: '📺', description: 'Choose an ad strategy for prime-time. Also builds toward Charisma.' },
  debate: { name: 'Debate', emoji: '🎙️', description: 'Answer tough questions under pressure. Counts toward Charisma levels.' },
  stump_speech: { name: 'Stump Speech', emoji: '🎤', description: 'Energize a live crowd. Builds Charisma over time.' },
  fundraiser: { name: 'Fundraiser', emoji: '💰', description: 'Negotiate with deep-pocketed donors. Required for high Charisma.' },
}

export function MinigamesPanel() {
  const minigames = useGameStore((s) => s.minigames)
  const completions = useGameStore((s) => s.minigameCompletions)
  const triggerMinigame = useGameStore((s) => s.triggerMinigame)
  const cancelMinigame = useGameStore((s) => s.cancelMinigame)
  const [active, setActive] = useState<MinigameId | null>(null)

  const unlocked = (Object.keys(minigames) as MinigameId[]).filter((id) => minigames[id].unlocked)

  if (unlocked.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        Win your first election to unlock outreach activities.
      </div>
    )
  }

  function openMinigame(id: MinigameId) {
    triggerMinigame(id)
    setActive(id)
  }

  function closeMinigame() {
    setActive(null)
  }

  function cancelCurrentMinigame() {
    if (active) cancelMinigame(active)
    setActive(null)
  }

  return (
    <>
      <div className="p-3 space-y-2">
        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Outreach Activities</h2>
        {unlocked.map((id) => {
          const mg = minigames[id]
          const info = MINIGAME_INFO[id]
          const now = Date.now()
          const onCooldown = now < mg.cooldownEndsAt
          const cooldownLeft = Math.ceil((mg.cooldownEndsAt - now) / 1000)
          const count = completions[id] ?? 0

          return (
            <div key={id} className="flex items-start gap-3 p-3 rounded-lg border border-purple-200 bg-purple-50">
              <div className="text-2xl flex-shrink-0">{info.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{info.name}</span>
                  {count > 0 && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">
                      ×{count}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{info.description}</div>
                {onCooldown && (
                  <div className="text-xs text-orange-500 mt-0.5">Ready in {cooldownLeft}s</div>
                )}
              </div>
              <button
                onClick={() => openMinigame(id)}
                disabled={onCooldown || mg.active}
                className={`
                  flex-shrink-0 self-center px-3 py-2 rounded-lg text-xs font-bold
                  ${!onCooldown && !mg.active
                    ? 'bg-purple-600 text-white active:bg-purple-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                `}
              >
                {mg.active ? 'Active' : onCooldown ? 'Cooldown' : 'Go'}
              </button>
            </div>
          )
        })}
      </div>

      {active === 'tv_ad' && <TvAdMinigame onClose={closeMinigame} onCancel={cancelCurrentMinigame} />}
      {active === 'debate' && <DebateMinigame onClose={closeMinigame} onCancel={cancelCurrentMinigame} />}
      {active === 'stump_speech' && <StumpSpeechMinigame onClose={closeMinigame} onCancel={cancelCurrentMinigame} />}
      {active === 'fundraiser' && <FundraiserMinigame onClose={closeMinigame} onCancel={cancelCurrentMinigame} />}
    </>
  )
}
