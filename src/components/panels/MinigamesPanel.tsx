import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { TvAdMinigame } from '../minigames/TvAdMinigame'
import { DebateMinigame } from '../minigames/DebateMinigame'
import { StumpSpeechMinigame } from '../minigames/StumpSpeechMinigame'
import { FundraiserMinigame } from '../minigames/FundraiserMinigame'
import type { MinigameId } from '../../game/types'
import { CHARISMA_LEVELS } from '../../game/charisma'
import { formatNumber } from '../../game/persistence'

const MINIGAME_INFO: Record<MinigameId, { name: string; emoji: string; description: string }> = {
  tv_ad: { name: 'TV Ad', emoji: '📺', description: 'Choose an ad strategy for prime-time.' },
  debate: { name: 'Debate', emoji: '🎙️', description: 'Answer tough questions under pressure.' },
  stump_speech: { name: 'Stump Speech', emoji: '🎤', description: 'Energize a live crowd.' },
  fundraiser: { name: 'Fundraiser', emoji: '💰', description: 'Negotiate with deep-pocketed donors.' },
}

export function MinigamesPanel() {
  const minigames = useGameStore((s) => s.minigames)
  const completions = useGameStore((s) => s.minigameCompletions)
  const charismaLevel = useGameStore((s) => s.charismaLevel)
  const totalSupportersEarned = useGameStore((s) => s.totalSupportersEarned)
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
        {/* Charisma progress toward next level */}
        {charismaLevel < CHARISMA_LEVELS.length - 1 && (() => {
          const req = CHARISMA_LEVELS[charismaLevel]!.req
          const nextName = CHARISMA_LEVELS[charismaLevel + 1]?.name ?? ''
          const items: { label: string; cur: number; req: number }[] = [
            { label: 'Supporters', cur: Math.min(totalSupportersEarned, req.totalSupporters), req: req.totalSupporters },
            ...(req.tvAds > 0 ? [{ label: 'TV Ads', cur: Math.min(completions.tv_ad, req.tvAds), req: req.tvAds }] : []),
            ...(req.debates > 0 ? [{ label: 'Debates', cur: Math.min(completions.debate, req.debates), req: req.debates }] : []),
            ...(req.stumpSpeeches > 0 ? [{ label: 'Speeches', cur: Math.min(completions.stump_speech, req.stumpSpeeches), req: req.stumpSpeeches }] : []),
            ...(req.fundraisers > 0 ? [{ label: 'Fundraisers', cur: Math.min(completions.fundraiser, req.fundraisers), req: req.fundraisers }] : []),
          ]
          return (
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-2 text-xs">
              <div className="text-purple-600 font-semibold mb-1.5">Charisma progress → {nextName}</div>
              {items.map((item) => {
                const pct = Math.min(1, item.cur / item.req)
                const done = pct >= 1
                return (
                  <div key={item.label} className="mb-1">
                    <div className="flex justify-between text-purple-700 mb-0.5">
                      <span>{item.label}</span>
                      <span className={done ? 'text-green-600 font-bold' : ''}>{done ? '✓' : `${formatNumber(item.cur)} / ${formatNumber(item.req)}`}</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-1">
                      <div className={`h-full rounded-full ${done ? 'bg-green-500' : 'bg-purple-500'}`} style={{ width: `${pct * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
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
