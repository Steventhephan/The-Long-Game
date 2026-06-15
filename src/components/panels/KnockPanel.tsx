import { useState, useRef, useCallback, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import {
  getClickSuccessChance,
  getClickSupporters,
  getClickCash,
  getNextElection,
  getCharismaName,
  getCanLevelUpCharisma,
  getHasWonPresidency,
} from '../../game/selectors'
import { getCarryoverRates } from '../../game/prestige'
import { CHARISMA_LEVELS } from '../../game/charisma'
import { formatNumber, formatCash, formatRate } from '../../game/persistence'
import { ELECTION_DAYS_BY_TIER } from '../../game/constants'

interface FloatParticle { id: number; text: string; color: string }

export function KnockPanel() {
  const knock = useGameStore((s) => s.knock)
  const fundraise = useGameStore((s) => s.fundraise)
  const courtInterestGroups = useGameStore((s) => s.courtInterestGroups)
  const lastCourtResult = useGameStore((s) => s.lastCourtResult)
  const courtCooldownEndsAt = useGameStore((s) => s.courtCooldownEndsAt)
  const startNextElection = useGameStore((s) => s.startNextElection)
  const awaitingNextElection = useGameStore((s) => s.awaitingNextElection)
  const lastWonTier = useGameStore((s) => s.lastWonTier)
  const resetElectionAfterDefeat = useGameStore((s) => s.resetElectionAfterDefeat)
  const levelUpCharisma = useGameStore((s) => s.levelUpCharisma)
  const prestige = useGameStore((s) => s.prestige)
  const supporters = useGameStore((s) => s.supporters)
  const charismaLevel = useGameStore((s) => s.charismaLevel)
  const currentTier = useGameStore((s) => s.currentTier)
  const purchasedPrestigeUpgrades = useGameStore((s) => s.purchasedPrestigeUpgrades)
  const prestigeCount = useGameStore((s) => s.prestigeCount)
  const electionDaysRemaining = useGameStore((s) => s.electionDaysRemaining)
  const competitors = useGameStore((s) => s.competitors)
  const state = useGameStore((s) => s)

  const [courtCooldownLeft, setCourtCooldownLeft] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((courtCooldownEndsAt - Date.now()) / 1000))
      setCourtCooldownLeft(left)
    }, 500)
    return () => clearInterval(id)
  }, [courtCooldownEndsAt])

  const [ripple, setRipple] = useState(false)
  const [missed, setMissed] = useState(false)
  const [showPrestigeConfirm, setShowPrestigeConfirm] = useState(false)
  const [showDefeat, setShowDefeat] = useState(false)
  const [floats, setFloats] = useState<FloatParticle[]>([])
  const floatCounter = useRef(0)

  const chance = getClickSuccessChance(state)
  const clickSupport = getClickSupporters(state)
  const clickCash = getClickCash(state)
  const charismaName = getCharismaName(state)
  const nextElection = getNextElection(state)
  const canLevelUp = getCanLevelUpCharisma(state)
  const showFundraiseButton = state.elections.city_council.won
  const showCourtButton = state.elections.mayor.won
  const fundraiseAmount = Math.max(10, Math.floor(supporters * 0.005))
  const COURT_CHANCE = 0.05
  const nextLevelDef = CHARISMA_LEVELS[charismaLevel + 1]
  const hasWonPresidency = getHasWonPresidency(state)
  const carryover = getCarryoverRates(purchasedPrestigeUpgrades)

  // Detect defeat: timer expired and player doesn't have enough
  const timeExpired = electionDaysRemaining <= 0
  useEffect(() => {
    if (timeExpired && nextElection && supporters < nextElection.supportersRequired && !showDefeat) {
      setShowDefeat(true)
    }
  }, [timeExpired, nextElection, supporters, showDefeat])

  const spawnFloat = useCallback((text: string, color: string) => {
    const id = ++floatCounter.current
    setFloats((f) => [...f, { id, text, color }])
    setTimeout(() => setFloats((f) => f.filter((p) => p.id !== id)), 950)
  }, [])

  function handleKnock() {
    const prev = useGameStore.getState().supporters
    knock()
    const next = useGameStore.getState().supporters
    if (next > prev) {
      setRipple(true)
      setTimeout(() => setRipple(false), 300)
      spawnFloat(
        `+${clickSupport} supporter${clickSupport !== 1 ? 's' : ''} · +${formatCash(clickCash)}`,
        'text-green-300'
      )
    } else {
      setMissed(true)
      setTimeout(() => setMissed(false), 300)
    }
  }

  function handleFundraise() {
    fundraise()
    spawnFloat(`+${formatCash(fundraiseAmount)}`, 'text-yellow-300')
  }

  const prevCourtResult = useRef<typeof lastCourtResult>(null)
  useEffect(() => {
    if (lastCourtResult && lastCourtResult !== prevCourtResult.current) {
      spawnFloat(
        `+${formatNumber(lastCourtResult.supporters)} supporters · +${lastCourtResult.volunteers} volunteers`,
        'text-purple-300'
      )
    }
    prevCourtResult.current = lastCourtResult
  }, [lastCourtResult, spawnFloat])

  function handleCourt() {
    if (courtCooldownLeft > 0) return
    courtInterestGroups()
  }

  const electionTotalDays = ELECTION_DAYS_BY_TIER[currentTier] ?? 365
  const daysDisplay = Math.floor(Math.max(0, electionDaysRemaining))
  const timerPct = Math.max(0, electionDaysRemaining / electionTotalDays)
  const timerColor = timerPct > 0.5 ? 'bg-green-500' : timerPct > 0.25 ? 'bg-yellow-500' : 'bg-red-500'

  const TIER_LABELS: Record<string, string> = {
    city_council: 'City Council', mayor: 'Mayoral', state_legislature: 'State Legislature',
    governor: 'Gubernatorial', senate: 'U.S. Senate', president: 'Presidential',
  }

  // Sort leaderboard: player + competitors by supporters desc
  const leaderboard = [
    { name: 'You', supporters, isPlayer: true, rate: 0 },
    ...competitors.map((c) => ({ name: c.name, supporters: c.supporters, isPlayer: false, rate: c.supportersPerSecond })),
  ].sort((a, b) => b.supporters - a.supporters)

  const leaderMax = Math.max(nextElection?.supportersRequired ?? 1, ...leaderboard.map((e) => e.supporters), 1)

  return (
    <div className="flex flex-col items-center gap-4 p-4">

      {/* Defeat modal */}
      {showDefeat && nextElection && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="text-4xl">📉</div>
            <h2 className="text-xl font-bold text-red-700">Election Lost</h2>
            <p className="text-sm text-gray-600">
              The votes were counted and you fell short of {formatNumber(nextElection.supportersRequired)} supporters.
              You lost 30% of your base. A new campaign begins.
            </p>
            <button
              onClick={() => { resetElectionAfterDefeat(); setShowDefeat(false) }}
              className="w-full py-3 bg-blue-700 text-white font-bold rounded-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Victory screen — game paused, player must advance */}
      {awaitingNextElection && lastWonTier && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="text-5xl">🏆</div>
            <h2 className="text-2xl font-bold text-green-700">
              {TIER_LABELS[lastWonTier]} Won!
            </h2>
            <p className="text-sm text-gray-600">
              Your campaign secured enough supporters to win the {TIER_LABELS[lastWonTier]} race.
              The next campaign awaits.
            </p>
            {nextElection && (
              <button
                onClick={startNextElection}
                className="w-full py-3 bg-blue-700 text-white font-bold rounded-xl text-lg"
              >
                Start {nextElection.name} Campaign →
              </button>
            )}
            {!nextElection && (
              <button
                onClick={startNextElection}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-xl"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action buttons: size scales down as more are added */}
      {(() => {
        const btnCount = showCourtButton ? 3 : showFundraiseButton ? 2 : 1
        const knockSize = btnCount === 1 ? 'w-40 h-40 text-lg' : btnCount === 2 ? 'w-36 h-36 text-base' : 'w-28 h-28 text-sm'
        const otherSize = btnCount === 3 ? 'w-28 h-28' : 'w-28 h-28'
        return (
          <div className="relative flex gap-3 items-center justify-center">
            <button
              onClick={handleKnock}
              className={`
                ${knockSize} rounded-full font-bold shadow-lg
                transition-all duration-150 select-none active:scale-95
                ${ripple ? 'bg-green-600 text-white scale-105' : ''}
                ${missed ? 'bg-red-400 text-white' : ''}
                ${!ripple && !missed ? 'bg-blue-700 text-white hover:bg-blue-600' : ''}
              `}
            >
              <div className={btnCount === 1 ? 'text-3xl mb-1' : 'text-2xl mb-0.5'}>🚪</div>
              <div>Knock</div>
              <div className="text-xs mt-0.5 opacity-80">+{clickSupport} sup.</div>
              <div className="text-xs opacity-60">{(chance * 100).toFixed(0)}% chance</div>
            </button>

            {showFundraiseButton && (
              <button
                onClick={handleFundraise}
                className={`${otherSize} rounded-full font-bold shadow-lg bg-green-600 text-white hover:bg-green-500 transition-all duration-150 select-none active:scale-95`}
              >
                <div className="text-2xl mb-0.5">💰</div>
                <div className="text-sm">Fundraise</div>
                <div className="text-xs mt-0.5 opacity-80">+{formatCash(fundraiseAmount)}</div>
              </button>
            )}

            {showCourtButton && (
              <button
                onClick={handleCourt}
                disabled={courtCooldownLeft > 0}
                className={`${otherSize} rounded-full font-bold shadow-lg transition-all duration-150 select-none active:scale-95 ${courtCooldownLeft > 0 ? 'bg-purple-400 text-white opacity-60' : 'bg-purple-700 text-white hover:bg-purple-600'}`}
              >
                <div className="text-2xl mb-0.5">🤝</div>
                <div className="text-xs leading-tight">Court Interest Group</div>
                <div className="text-xs mt-0.5 opacity-60">{(COURT_CHANCE * 100).toFixed(0)}% chance</div>
                {courtCooldownLeft > 0 && <div className="text-xs mt-0.5 opacity-80">{courtCooldownLeft}s</div>}
              </button>
            )}

            {floats.map((p) => (
              <span
                key={p.id}
                className="pointer-events-none absolute left-1/2 top-2 animate-float-up whitespace-nowrap"
                style={{ zIndex: 20 }}
              >
                <span className={`text-xs font-bold ${p.color}`}>{p.text}</span>
              </span>
            ))}
          </div>
        )
      })()}

      {/* Charisma */}
      <div className="w-full max-w-xs bg-white rounded-xl border border-purple-200 p-2 text-center text-xs">
        <span className="text-gray-500">Charisma: </span>
        <span className="font-bold text-purple-700">{charismaName}</span>
      </div>

      {/* Charisma level-up notification */}
      {canLevelUp && nextLevelDef && (
        <div className="w-full max-w-xs bg-purple-50 border border-purple-300 rounded-xl p-3">
          <div className="text-purple-800 font-bold text-sm">✨ Your Charisma has improved.</div>
          <div className="text-purple-700 font-semibold text-sm mt-0.5">→ {nextLevelDef.name}</div>
          <div className="text-purple-600 text-xs mt-1">{nextLevelDef.description}</div>
          <button
            onClick={levelUpCharisma}
            className="mt-2 w-full py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg"
          >
            Claim {nextLevelDef.name}
          </button>
        </div>
      )}

      {/* Election section */}
      {nextElection && (
        <div className="w-full max-w-xs space-y-3">
          {/* Countdown timer */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-gray-700">🗓 {nextElection.name} Election</span>
              <span className={`text-xs font-bold ${daysDisplay <= 30 ? 'text-red-600 animate-pulse' : 'text-gray-600'}`}>
                {daysDisplay} days left
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${timerColor}`}
                style={{ width: `${timerPct * 100}%` }}
              />
            </div>
          </div>

          {/* Supporter progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="text-xs text-gray-500 mb-1">Supporters needed to win</div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (supporters / nextElection.supportersRequired) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatNumber(supporters)} / {formatNumber(nextElection.supportersRequired)} supporters
            </div>
          </div>

          {/* Leaderboard */}
          {competitors.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
              <div className="text-xs font-bold text-gray-700 mb-1">Candidates</div>
              {leaderboard.map((entry, i) => (
                <div key={entry.name} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={entry.isPlayer ? 'font-bold text-blue-700' : 'text-gray-600'}>
                      {i + 1}. {entry.name}
                    </span>
                    <span className={`font-semibold ${entry.isPlayer ? 'text-blue-700' : 'text-gray-500'}`}>
                      {formatNumber(entry.supporters)}
                      {!entry.isPlayer && (
                        <span className="ml-1 text-red-400 font-normal">
                          +{formatRate(entry.rate)}/s
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${entry.isPlayer ? 'bg-blue-500' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(100, (entry.supporters / leaderMax) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="text-xs text-gray-400 mt-1">
                Win threshold: {formatNumber(nextElection.supportersRequired)}
              </div>
            </div>
          )}

        </div>
      )}

      {!nextElection && (
        <div className="text-center text-yellow-600 font-bold text-lg">
          🎉 You've won The Long Game!
        </div>
      )}

      {/* Prestige — only after winning the Presidency */}
      {hasWonPresidency && !showPrestigeConfirm && (
        <div className="w-full max-w-xs border border-red-200 bg-red-50 rounded-xl p-3">
          <div className="text-red-800 font-bold text-sm">You won the Presidency. Ready to go again?</div>
          <div className="text-red-600 text-xs mt-1">
            Launch a new campaign as {currentTier === 'president' ? 'a returning candidate' : currentTier} and start from scratch.
            {prestigeCount === 0
              ? ' A small percentage of what you\'ve built will carry over.'
              : ` You'll carry over ${Math.round(carryover.supporters * 100)}% of supporters, ${Math.round(carryover.cash * 100)}% of cash, and ${Math.round(carryover.volunteers * 100)}% of volunteers.`}
          </div>
          <button
            onClick={() => setShowPrestigeConfirm(true)}
            className="mt-2 w-full py-2 bg-red-600 text-white text-sm font-bold rounded-lg"
          >
            Launch a New Campaign
          </button>
        </div>
      )}

      {showPrestigeConfirm && (
        <div className="w-full max-w-xs border-2 border-red-400 bg-red-50 rounded-xl p-4">
          <div className="font-bold text-red-900 text-sm text-center mb-2">Are you sure?</div>
          <div className="text-xs text-red-700 text-center mb-3">
            You'll carry over{' '}
            <span className="font-bold">{Math.round(carryover.supporters * 100)}%</span> of supporters,{' '}
            <span className="font-bold">{Math.round(carryover.cash * 100)}%</span> of cash ({formatCash(useGameStore.getState().cash * carryover.cash)}), and{' '}
            <span className="font-bold">{Math.round(carryover.volunteers * 100)}%</span> of volunteers.
            Everything else resets.
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowPrestigeConfirm(false)}
              className="py-2 border-2 border-gray-300 text-gray-700 text-sm font-bold rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => { prestige(); setShowPrestigeConfirm(false) }}
              className="py-2 bg-red-600 text-white text-sm font-bold rounded-lg"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
