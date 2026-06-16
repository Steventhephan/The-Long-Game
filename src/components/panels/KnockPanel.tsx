import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useGameStore } from '../../store/gameStore'
import {
  getClickSuccessChance,
  getClickSupporters,
  getClickCash,
  getNextElection,
  getCharismaName,
  getCanLevelUpCharisma,
  getHasWonPresidency,
  getFundraiseChance,
  getCourtMultiplier,

} from '../../game/selectors'
import { getCarryoverRates } from '../../game/prestige'
import { CHARISMA_LEVELS } from '../../game/charisma'
import { formatNumber, formatCash, formatRate } from '../../game/persistence'
import { ELECTION_DAYS_BY_TIER } from '../../game/constants'
import type { ElectionTier } from '../../game/types'
import { CRISES } from '../../game/crises'
import { POLICY_ISSUES, isPolicyStanceConflicted } from '../../game/policy'
import { getIdeology } from '../../game/ideology'

interface CarryoverRates { supporters: number; cash: number; volunteers: number }

function PrestigeBox({ carryover, ppToEarn, onLaunch }: { carryover: CarryoverRates; ppToEarn: number; onLaunch: () => void }) {
  return (
    <div className="w-full border border-red-200 bg-red-50 rounded-xl p-3">
      <div className="text-red-800 font-bold text-sm">You won the Presidency. Ready to go again?</div>
      <div className="text-red-600 text-xs mt-1">
        {carryover.supporters === 0 && carryover.cash === 0 && carryover.volunteers === 0
          ? 'Everything resets. Spend prestige points on carryover upgrades to bring resources into your next run.'
          : `You'll carry over ${Math.round(carryover.supporters * 100)}% of supporters, ${Math.round(carryover.cash * 100)}% of cash, and ${Math.round(carryover.volunteers * 100)}% of volunteers.`}
      </div>
      <div className="text-red-700 text-xs mt-1 font-semibold">⭐ You'll earn {ppToEarn} prestige point{ppToEarn !== 1 ? 's' : ''} for this run.</div>
      <button onClick={onLaunch} className="mt-2 w-full py-2 bg-red-600 text-white text-sm font-bold rounded-lg">
        Launch a New Campaign
      </button>
    </div>
  )
}

function PrestigeConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="w-full border-2 border-red-400 bg-red-50 rounded-xl p-4">
      <div className="font-bold text-red-900 text-sm text-center mb-2">Are you sure?</div>
      <div className="text-xs text-red-700 text-center mb-3">Trek The Long Game again with some wisdom from this life.</div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onCancel} className="py-2 border-2 border-gray-300 text-gray-700 text-sm font-bold rounded-lg">Cancel</button>
        <button onClick={onConfirm} className="py-2 bg-red-600 text-white text-sm font-bold rounded-lg">Start Fresh</button>
      </div>
    </div>
  )
}

const WIN_MESSAGES: Record<ElectionTier, string> = {
  city_council: 'City Council Seat Secured!',
  mayor: 'Mayorship Secured!',
  state_legislature: 'State Legislature Seat Secured!',
  governor: 'Governorship Secured!',
  senate: 'Senate Seat Secured!',
  president: 'Presidency Secured!',
}

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
  const electionDaysRemaining = useGameStore((s) => s.electionDaysRemaining)
  const competitors = useGameStore((s) => s.competitors)
  const competitorWonElection = useGameStore((s) => s.competitorWonElection)
  const state = useGameStore((s) => s)

  const [courtCooldownLeft, setCourtCooldownLeft] = useState(
    () => Math.max(0, Math.ceil((useGameStore.getState().courtCooldownEndsAt - Date.now()) / 1000))
  )
  const [abilityCooldownsLeft, setAbilityCooldownsLeft] = useState<Record<string, number>>(() => {
    const now = Date.now()
    const cd = useGameStore.getState().abilityCooldowns
    return {
      rally: Math.max(0, Math.ceil(((cd.rally ?? 0) - now) / 1000)),
      statement: Math.max(0, Math.ceil(((cd.statement ?? 0) - now) / 1000)),
      natfundraiser: Math.max(0, Math.ceil(((cd.natfundraiser ?? 0) - now) / 1000)),
      address: Math.max(0, Math.ceil(((cd.address ?? 0) - now) / 1000)),
    }
  })
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      const left = Math.max(0, Math.ceil((courtCooldownEndsAt - Date.now()) / 1000))
      setCourtCooldownLeft(left)
      const cd = useGameStore.getState().abilityCooldowns
      setAbilityCooldownsLeft({
        rally: Math.max(0, Math.ceil(((cd.rally ?? 0) - now) / 1000)),
        statement: Math.max(0, Math.ceil(((cd.statement ?? 0) - now) / 1000)),
        natfundraiser: Math.max(0, Math.ceil(((cd.natfundraiser ?? 0) - now) / 1000)),
        address: Math.max(0, Math.ceil(((cd.address ?? 0) - now) / 1000)),
      })
    }, 500)
    return () => clearInterval(id)
  }, [courtCooldownEndsAt])

  const activeCrisis = useGameStore((s) => s.activeCrisis)
  const crisisResolution = useGameStore((s) => s.crisisResolution)
  const chooseCrisisOption = useGameStore((s) => s.chooseCrisisOption)
  const dismissCrisis = useGameStore((s) => s.dismissCrisis)
  const policyStances = useGameStore((s) => s.policyStances)
  const adoptPolicyStance = useGameStore((s) => s.adoptPolicyStance)
  const cash = useGameStore((s) => s.cash)
  const elections = useGameStore((s) => s.elections)
  const lastAbilityResult = useGameStore((s) => s.lastAbilityResult)
  const abilityResults = useGameStore((s) => s.abilityResults)
  const policyStanceSwitchCounts = useGameStore((s) => s.policyStanceSwitchCounts)
  const holdRally = useGameStore((s) => s.holdRally)
  const issueStatement = useGameStore((s) => s.issueStatement)
  const nationalFundraiser = useGameStore((s) => s.nationalFundraiser)
  const addressNation = useGameStore((s) => s.addressNation)

  const [ripple, setRipple] = useState(false)
  const [missed, setMissed] = useState(false)
  const [fundraiseMissed, setFundraiseMissed] = useState(false)
  const [abilityFlash, setAbilityFlash] = useState<Record<string, 'hit' | 'miss' | null>>({})
  const [rivalDamageId, setRivalDamageId] = useState<string | null>(null)
  const [showPrestigeConfirm, setShowPrestigeConfirm] = useState(false)
  const [showFinalVictoryModal, setShowFinalVictoryModal] = useState(true)
  const [showDefeat, setShowDefeat] = useState(false)
  const [floats, setFloats] = useState<FloatParticle[]>([])
  const floatCounter = useRef(0)

  const playerName = useGameStore((s) => s.playerName)
  const totalSupportersEarned = useGameStore((s) => s.totalSupportersEarned)
  const minigameCompletions = useGameStore((s) => s.minigameCompletions)
  const chance = getClickSuccessChance(state)
  const fundraiseChance = getFundraiseChance(state)
  const clickSupport = Math.floor(getClickSupporters(state))
  const clickCash = getClickCash(state)
  const charismaName = getCharismaName(state)
  const nextElection = getNextElection(state)
  const canLevelUp = getCanLevelUpCharisma(state)
  const showFundraiseButton = state.elections.city_council.won
  const showCourtButton = state.elections.mayor.won
  const fundraiseAmount = Math.max(10, Math.floor(supporters * 0.005))
  const courtMult = getCourtMultiplier(state)
  const COURT_FRACTION: Record<string, number> = {
    city_council: 0.08, mayor: 0.06, state_legislature: 0.04,
    governor: 0.02, senate: 0.008, president: 0.003,
  }
  const courtFraction = COURT_FRACTION[currentTier] ?? 0.01
  const courtSupporterGain = Math.floor((nextElection?.supportersRequired ?? 10000) * courtFraction * courtMult)
  const nextLevelDef = CHARISMA_LEVELS[charismaLevel + 1]
  const hasWonPresidency = getHasWonPresidency(state)
  const carryover = getCarryoverRates(purchasedPrestigeUpgrades)
  const ppToEarn = Math.max(1, Object.values(state.elections).filter(e => e.won).length)
  const crisisDef = useMemo(() => activeCrisis ? CRISES.find(c => c.id === activeCrisis) ?? null : null, [activeCrisis])

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
    const success = fundraise()
    if (success) {
      spawnFloat(`+${formatCash(fundraiseAmount)}`, 'text-yellow-300')
    } else {
      setFundraiseMissed(true)
      setTimeout(() => setFundraiseMissed(false), 300)
    }
  }

  function flashAbility(id: string, result: 'hit' | 'miss') {
    setAbilityFlash((f) => ({ ...f, [id]: result }))
    setTimeout(() => setAbilityFlash((f) => ({ ...f, [id]: null })), 400)
  }

  const prevCourtResult = useRef<typeof lastCourtResult>(useGameStore.getState().lastCourtResult)
  const courtResultSeenOnce = useRef(true)
  useEffect(() => {
    if (lastCourtResult && lastCourtResult !== prevCourtResult.current) {
      if (courtResultSeenOnce.current) {
        if (lastCourtResult.supporters > 0) {
          flashAbility('court', 'hit')
          spawnFloat(`+${formatNumber(lastCourtResult.supporters)} supporters`, 'text-purple-300')
        } else {
          flashAbility('court', 'miss')
        }
      }
      courtResultSeenOnce.current = true
    }
    prevCourtResult.current = lastCourtResult
  }, [lastCourtResult, spawnFloat])

  const prevAbilityResult = useRef<typeof lastAbilityResult>(useGameStore.getState().lastAbilityResult)
  useEffect(() => {
    if (lastAbilityResult && lastAbilityResult !== prevAbilityResult.current) {
      const { abilityId, supporterDelta, cashDelta, good } = lastAbilityResult
      flashAbility(abilityId, good ? 'hit' : 'miss')

      if (!good) {
        const missMessages: Record<string, string> = {
          rally: '📣 Crowd didn\'t show',
          statement: '📰 Hitpiece backfired',
          natfundraiser: '🏛️ Donors passed',
          address: '📺 Story didn\'t land',
        }
        spawnFloat(missMessages[abilityId] ?? 'No effect', 'text-red-300')
        if (supporterDelta < 0) spawnFloat(`${formatNumber(supporterDelta)} supporters`, 'text-red-400')
      } else {
        if (abilityId === 'rally') {
          spawnFloat(`📣 +${formatNumber(supporterDelta)} supporters`, 'text-orange-300')
        } else if (abilityId === 'statement') {
          const rivals = useGameStore.getState().competitors
          const top = rivals.reduce((best, c) => c.supporters > best.supporters ? c : best, rivals[0])
          if (top) {
            setRivalDamageId(top.id)
            setTimeout(() => setRivalDamageId(null), 1500)
          }
          spawnFloat(`📰 Rival −${formatNumber(Math.abs(supporterDelta))} sup`, 'text-blue-300')
        } else if (abilityId === 'natfundraiser') {
          spawnFloat(`🏛️ +${formatCash(cashDelta)} raised`, 'text-yellow-300')
        } else if (abilityId === 'address') {
          spawnFloat(`📺 +${formatNumber(supporterDelta)} supporters`, 'text-green-300')
        }
      }
    }
    prevAbilityResult.current = lastAbilityResult
  }, [lastAbilityResult, spawnFloat])

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
    { id: 'player', name: playerName ? `${playerName} (You)` : 'You', supporters, isPlayer: true, rate: 0 },
    ...competitors.map((c) => ({ id: c.id, name: c.name, supporters: c.supporters, isPlayer: false, rate: c.supportersPerSecond })),
  ].sort((a, b) => b.supporters - a.supporters)

  const leaderMax = Math.max(nextElection?.supportersRequired ?? 1, ...leaderboard.map((e) => e.supporters), 1)

  return (
    <div className="flex flex-col items-center gap-4 p-4">

      {/* Defeat modal — timer expired */}
      {showDefeat && nextElection && !competitorWonElection && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="text-4xl">📉</div>
            <h2 className="text-xl font-bold text-red-700">Election Lost</h2>
            <p className="text-sm text-gray-600">
              Time ran out before you reached {formatNumber(nextElection.supportersRequired)} supporters.
              Your campaign resets to where it was at the start of this race.
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

      {/* Defeat modal — competitor won */}
      {competitorWonElection && nextElection && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="text-4xl">😤</div>
            <h2 className="text-xl font-bold text-red-700">Outpaced</h2>
            <p className="text-sm text-gray-600">
              A rival candidate reached {formatNumber(nextElection.supportersRequired)} supporters before you.
              Your campaign resets to where it was at the start of this race.
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
      {awaitingNextElection && lastWonTier && (nextElection || showFinalVictoryModal) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="text-5xl">🏆</div>
            <h2 className="text-2xl font-bold text-green-700">
              {WIN_MESSAGES[lastWonTier]}
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
                onClick={() => setShowFinalVictoryModal(false)}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-xl"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      )}

      {/* Crisis modal */}
      {crisisDef && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-3">
            <div className="text-center">
              <div className="text-3xl mb-1">🚨</div>
              <h2 className="text-base font-bold text-red-700">{crisisDef.headline}</h2>
              <p className="text-xs text-gray-600 mt-1">{crisisDef.description}</p>
            </div>

            {!crisisResolution ? (
              <div className="space-y-2">
                {crisisDef.options.map((opt, i) => {
                  const threshold = nextElection?.supportersRequired ?? 500
                  const cost = Math.floor(opt.costFraction * threshold)
                  const canAfford = cash >= cost
                  return (
                    <button
                      key={opt.label}
                      disabled={!canAfford}
                      onClick={() => chooseCrisisOption(i)}
                      className={`w-full rounded-xl border-2 p-3 text-left transition-all ${
                        canAfford
                          ? 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                          : 'border-gray-100 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-sm">{opt.emoji} {opt.label}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          opt.riskLabel === 'Safe' ? 'bg-green-100 text-green-700' :
                          opt.riskLabel === 'Bold' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>{opt.riskLabel}</span>
                      </div>
                      <p className="text-xs text-gray-600">{opt.description}</p>
                      {cost > 0 && (
                        <p className={`text-xs font-semibold mt-1 ${canAfford ? 'text-gray-500' : 'text-red-500'}`}>
                          Cost: {formatCash(cost)}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {(() => {
                  const opt = crisisDef.options[crisisResolution.optionIndex]!
                  const threshold = nextElection?.supportersRequired ?? 500
                  const cost = Math.floor(opt.costFraction * threshold)
                  let resultText = ''
                  let resultColor = 'text-gray-600'
                  if (crisisResolution.outcomeType === 'supporters_pct') {
                    const delta = crisisResolution.outcomeDelta
                    resultText = delta >= 0 ? `+${formatNumber(delta)} supporters` : `${formatNumber(delta)} supporters`
                    resultColor = delta >= 0 ? 'text-green-600' : 'text-red-600'
                  } else if (crisisResolution.outcomeType === 'competitor_pct') {
                    const delta = Math.abs(crisisResolution.outcomeDelta)
                    resultText = `Lead rival loses ${formatNumber(delta)} supporters`
                    resultColor = 'text-blue-600'
                  } else {
                    resultText = 'No lasting damage. Crisis contained.'
                    resultColor = 'text-green-600'
                  }
                  return (
                    <>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-xs text-gray-500 mb-1">You chose: {opt.emoji} {opt.label}</div>
                        {cost > 0 && <div className="text-xs text-gray-500 mb-1">Spent: {formatCash(cost)}</div>}
                        <div className={`font-bold text-sm ${resultColor}`}>{resultText}</div>
                      </div>
                      <button
                        onClick={dismissCrisis}
                        className="w-full py-2.5 bg-blue-700 text-white font-bold rounded-xl text-sm"
                      >
                        Continue Campaign
                      </button>
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prestige box at top — shown prominently after winning the Presidency */}
      {hasWonPresidency && !nextElection && !showPrestigeConfirm && (
        <PrestigeBox carryover={carryover} ppToEarn={ppToEarn} onLaunch={() => setShowPrestigeConfirm(true)} />
      )}
      {hasWonPresidency && !nextElection && showPrestigeConfirm && (
        <PrestigeConfirm onCancel={() => setShowPrestigeConfirm(false)} onConfirm={() => { prestige(); setShowPrestigeConfirm(false); setShowFinalVictoryModal(true) }} />
      )}

      {/* Action area */}
      {(() => {
        const showRally = elections.state_legislature?.won
        const showStatement = elections.governor?.won
        const showNatFundraiser = elections.senate?.won
        const showAddress = elections.senate?.won
        const threshold = nextElection?.supportersRequired ?? 500

        type AbilityDef = { id: string; emoji: string; label: string; stat: string; chance: string; cooldownLeft: number; cooldownTotal: number; disabled: boolean; onClick: () => void }
        const abilities: AbilityDef[] = [
          ...(showCourtButton ? [{
            id: 'court', emoji: '🤝', label: 'Court Interest Group',
            stat: `+${formatNumber(courtSupporterGain)} sup`,
            chance: '30%',
            cooldownLeft: courtCooldownLeft, cooldownTotal: 30,
            disabled: courtCooldownLeft > 0, onClick: handleCourt,
          }] : []),
          ...(showRally ? [{
            id: 'rally', emoji: '📣', label: 'Hold a Rally',
            stat: `+${formatNumber(Math.floor(threshold * 0.06))} sup`,
            chance: '70%',
            cooldownLeft: abilityCooldownsLeft.rally ?? 0, cooldownTotal: 60,
            disabled: (abilityCooldownsLeft.rally ?? 0) > 0 || cash < Math.floor(threshold * 0.025), onClick: holdRally,
          }] : []),
          ...(showStatement ? [{
            id: 'statement', emoji: '📰', label: 'Launch Hitpiece',
            stat: `#1 Rival −${formatNumber(Math.floor(threshold * 0.05))} sup`,
            chance: '60%',
            cooldownLeft: abilityCooldownsLeft.statement ?? 0, cooldownTotal: 90,
            disabled: (abilityCooldownsLeft.statement ?? 0) > 0, onClick: issueStatement,
          }] : []),
          ...(showNatFundraiser ? [{
            id: 'natfundraiser', emoji: '🏛️', label: 'Big Donor Fundraiser',
            stat: `+${formatCash(Math.floor(threshold * 0.12))}`,
            chance: '65%',
            cooldownLeft: abilityCooldownsLeft.natfundraiser ?? 0, cooldownTotal: 120,
            disabled: (abilityCooldownsLeft.natfundraiser ?? 0) > 0, onClick: nationalFundraiser,
          }] : []),
          ...(showAddress ? [{
            id: 'address', emoji: '📺', label: 'Major Press Release',
            stat: `+${formatNumber(Math.floor(threshold * 0.15))} sup`,
            chance: '45%',
            cooldownLeft: abilityCooldownsLeft.address ?? 0, cooldownTotal: 300,
            disabled: (abilityCooldownsLeft.address ?? 0) > 0, onClick: addressNation,
          }] : []),
        ]

        return (
          <div className="relative w-full flex flex-col items-center gap-3">
            {/* Top row: big primary circles */}
            <div className="flex gap-4 items-center justify-center">
              <button
                onClick={handleKnock}
                className={`w-32 h-32 rounded-full font-bold shadow-lg transition-all duration-150 select-none active:scale-95 flex flex-col items-center justify-center
                  ${ripple ? 'bg-green-600 text-white scale-105' : ''}
                  ${missed ? 'bg-red-400 text-white' : ''}
                  ${!ripple && !missed ? 'bg-blue-700 text-white hover:bg-blue-600' : ''}
                `}
              >
                <div className="text-3xl mb-0.5">🚪</div>
                <div className="font-bold text-sm">Knock</div>
                <div className="text-xs mt-0.5 opacity-80">+{clickSupport} sup.</div>
                <div className="text-xs opacity-60">{(chance * 100).toFixed(0)}% chance</div>
              </button>

              {showFundraiseButton && (
                <button
                  onClick={handleFundraise}
                  className={`w-32 h-32 rounded-full font-bold shadow-lg transition-all duration-150 select-none active:scale-95 flex flex-col items-center justify-center ${fundraiseMissed ? 'bg-red-400 text-white' : 'bg-green-600 text-white hover:bg-green-500'}`}
                >
                  <div className="text-3xl mb-0.5">💰</div>
                  <div className="font-bold text-sm">Fundraise</div>
                  <div className="text-xs mt-0.5 opacity-80">+{formatCash(fundraiseAmount)}</div>
                  <div className="text-xs opacity-60">{(fundraiseChance * 100).toFixed(0)}% chance</div>
                </button>
              )}
            </div>

            {/* Bottom row: smaller ability circles with labels beneath */}
            {abilities.length > 0 && (
              <div className="flex gap-3 flex-wrap justify-center">
                {abilities.map((ab) => {
                  const flash = abilityFlash[ab.id]
                  const onCooldown = ab.cooldownLeft > 0
                  const lastResult = abilityResults[ab.id]
                  let cls = 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                  if (flash === 'hit') cls = 'bg-green-500 border-green-500 text-white scale-105'
                  else if (flash === 'miss') cls = 'bg-red-400 border-red-400 text-white'
                  else if (onCooldown && lastResult === 'hit') cls = 'bg-green-100 border-2 border-green-300 text-green-800'
                  else if (onCooldown && lastResult === 'miss') cls = 'bg-red-100 border-2 border-red-300 text-red-800'
                  else if (onCooldown || ab.disabled) cls = 'bg-gray-100 border-2 border-gray-200 text-gray-400'
                  return (
                    <div key={ab.id} className="flex flex-col items-center gap-1">
                      <button
                        onClick={ab.onClick}
                        disabled={ab.disabled}
                        className={`w-16 h-16 rounded-full font-bold shadow transition-all duration-150 select-none active:scale-95 flex flex-col items-center justify-center ${ab.disabled && !flash ? 'cursor-not-allowed' : 'cursor-pointer'} ${cls}`}
                      >
                        <div className="text-xl leading-none">{ab.emoji}</div>
                        <div className="text-[10px] font-bold mt-0.5">{onCooldown ? `${ab.cooldownLeft}s` : ab.chance}</div>
                      </button>
                      <div className="text-center w-16">
                        <div className="text-[10px] font-bold text-gray-700 leading-tight">{ab.label}</div>
                        <div className="text-[9px] text-gray-500 leading-tight mt-0.5">{ab.stat}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Float particles */}
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

      {/* Two-column info row: Charisma (left) + Election status (right) */}
      <div className="w-full grid grid-cols-2 gap-2">

        {/* Left: Charisma */}
        {(() => {
          const atMax = charismaLevel >= CHARISMA_LEVELS.length - 1
          if (atMax) {
            return (
              <div className="bg-purple-50 rounded-xl border border-purple-200 p-2.5 flex flex-col justify-center">
                <div className="text-[10px] text-purple-500 mb-0.5">Charisma</div>
                <div className="font-bold text-purple-700 text-xs">{charismaName}</div>
                <div className="text-[10px] text-purple-400 mt-0.5">Max level</div>
              </div>
            )
          }
          const req = CHARISMA_LEVELS[charismaLevel]!.req
          const nextName = CHARISMA_LEVELS[charismaLevel + 1]?.name ?? ''
          const items: { label: string; cur: number; req: number }[] = [
            { label: 'Supporters', cur: Math.min(totalSupportersEarned, req.totalSupporters), req: req.totalSupporters },
            ...(req.tvAds > 0 ? [{ label: 'TV Ads', cur: Math.min(minigameCompletions.tv_ad, req.tvAds), req: req.tvAds }] : []),
            ...(req.debates > 0 ? [{ label: 'Debates', cur: Math.min(minigameCompletions.debate, req.debates), req: req.debates }] : []),
            ...(req.stumpSpeeches > 0 ? [{ label: 'Speeches', cur: Math.min(minigameCompletions.stump_speech, req.stumpSpeeches), req: req.stumpSpeeches }] : []),
            ...(req.fundraisers > 0 ? [{ label: 'Fundraisers', cur: Math.min(minigameCompletions.fundraiser, req.fundraisers), req: req.fundraisers }] : []),
          ]
          return (
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-2.5 text-xs">
              <div className="text-[10px] text-purple-500 mb-0.5">Charisma</div>
              <div className="font-bold text-purple-700 text-xs mb-2">{charismaName} → {nextName}</div>
              {items.map((item) => {
                const pct = Math.min(1, item.cur / item.req)
                const done = pct >= 1
                return (
                  <div key={item.label} className="mb-1.5">
                    <div className="flex justify-between text-purple-700 mb-0.5 text-[10px]">
                      <span>{item.label}</span>
                      <span className={done ? 'text-green-600 font-bold' : ''}>{done ? '✓' : `${formatNumber(item.cur)}/${formatNumber(item.req)}`}</span>
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

        {/* Right: Election timer + supporter progress */}
        {nextElection ? (
          <div className="bg-white rounded-xl border border-gray-200 p-2.5 text-xs flex flex-col gap-2">
            <div>
              <div className="text-[10px] text-gray-500 mb-0.5">🗓 {nextElection.name}</div>
              <div className={`font-bold text-xs mb-1 ${daysDisplay <= 30 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
                {daysDisplay} days left
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${timerColor}`} style={{ width: `${timerPct * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 mb-0.5">Supporters to win</div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (supporters / nextElection.supportersRequired) * 100)}%` }} />
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                {formatNumber(supporters)} / {formatNumber(nextElection.supportersRequired)}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-2.5 flex items-center justify-center">
            <div className="text-center text-yellow-700 font-bold text-xs">🎉 You won!</div>
          </div>
        )}
      </div>

      {/* Charisma level-up notification */}
      {canLevelUp && nextLevelDef && (
        <div className="w-full bg-purple-50 border border-purple-300 rounded-xl p-3">
          <div className="text-purple-800 font-bold text-sm">✨ Your Charisma has improved.</div>
          <div className="text-purple-700 font-semibold text-sm mt-0.5">→ {nextLevelDef.name}</div>
          <div className="text-purple-600 text-xs mt-1">{nextLevelDef.description}</div>
          <button
            onClick={levelUpCharisma}
            className="mt-2 w-full py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg"
          >
            You become {nextLevelDef.name}
          </button>
        </div>
      )}

      {/* Leaderboard — full width */}
      {nextElection && competitors.length > 0 && (
        <div className="w-full bg-white rounded-xl border border-gray-200 p-3 space-y-2">
          <div className="text-xs font-bold text-gray-700 mb-1">Candidates</div>
          {leaderboard.map((entry, i) => {
            const isDamaged = !entry.isPlayer && rivalDamageId === entry.id
            return (
              <div key={entry.name} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={entry.isPlayer ? 'font-bold text-blue-700' : isDamaged ? 'font-semibold text-red-600' : 'text-gray-600'}>
                    {i + 1}. {entry.name}
                    {isDamaged && <span className="ml-1 animate-pulse">📰</span>}
                  </span>
                  <span className={`font-semibold ${entry.isPlayer ? 'text-blue-700' : isDamaged ? 'text-red-600' : 'text-gray-500'}`}>
                    {formatNumber(entry.supporters)}
                    {!entry.isPlayer && (
                      <span className="ml-1 text-red-400 font-normal">
                        +{formatRate(entry.rate)}/s
                      </span>
                    )}
                  </span>
                </div>
                <div className={`w-full bg-gray-100 rounded-full h-1.5 ${isDamaged ? 'animate-bar-damage' : ''}`}>
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ${entry.isPlayer ? 'bg-blue-500' : isDamaged ? 'bg-red-600' : 'bg-red-400'}`}
                    style={{ width: `${Math.min(100, (entry.supporters / leaderMax) * 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
          <div className="text-xs text-gray-400 mt-1">
            Win threshold: {formatNumber(nextElection.supportersRequired)}
          </div>
        </div>
      )}


      {/* Policy Platform — unlocks after city council */}
      {elections.city_council.won && (
        <div className="w-full bg-white rounded-xl border border-gray-200 p-3">
          {(() => {
            const ideologyResult = getIdeology(policyStances)
            return (
              <div className="flex items-start justify-between mb-2">
                <div className="text-xs font-bold text-gray-700">📋 Policy Platform</div>
                {ideologyResult ? (
                  <div className="text-right ml-2">
                    <div className="text-[10px] font-bold text-indigo-700 leading-tight">{ideologyResult.ideology.name}</div>
                    <div className="text-[9px] text-indigo-500 leading-tight mt-0.5">{ideologyResult.ideology.effectLabel}</div>
                  </div>
                ) : (
                  <div className="text-[9px] text-gray-400 italic">Set 2+ stances for an ideology</div>
                )}
              </div>
            )
          })()}
          <div className="space-y-3">
            {POLICY_ISSUES.map((issue) => {
              const isUnlocked = elections[issue.unlocksAfter]?.won
              const activeStanceId = policyStances[issue.id] ?? null
              return (
                <div key={issue.id} className={`rounded-lg border p-2 ${isUnlocked ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-xs font-bold text-gray-700">{issue.emoji} {issue.name}</div>
                    {!isUnlocked && <div className="text-[10px] text-gray-400">Win {issue.unlocksAfter.replace(/_/g, ' ')} to unlock</div>}
                  </div>
                  {isUnlocked && (
                    <>
                      {activeStanceId && (() => {
                        const switchCount = policyStanceSwitchCounts[issue.id] ?? 0
                        const SWITCH_PCTS = [3, 6, 10, 15, 20]
                        const pct = SWITCH_PCTS[Math.min(switchCount, SWITCH_PCTS.length - 1)] ?? 20
                        return (
                          <div className="text-[9px] text-orange-600 mb-1">
                            ⚠ Switching costs {pct}% of current supporters{switchCount > 0 ? ` (switched ${switchCount}×)` : ''}.
                          </div>
                        )
                      })()}
                      <div className="grid grid-cols-3 gap-1">
                        {issue.stances.map((stance) => {
                          const isActive = activeStanceId === stance.id
                          const isConflicted = isActive && isPolicyStanceConflicted(policyStances, issue.id, stance.id)
                          const canAfford = cash >= issue.adoptionCost
                          return (
                            <button
                              key={stance.id}
                              disabled={isActive || !canAfford}
                              onClick={() => adoptPolicyStance(issue.id, stance.id)}
                              className={`rounded-lg p-1.5 border-2 text-left transition-all ${
                                isActive && isConflicted
                                  ? 'border-orange-400 bg-orange-50'
                                  : isActive
                                  ? 'border-blue-500 bg-blue-50'
                                  : canAfford
                                  ? 'border-gray-200 bg-white hover:border-blue-300 cursor-pointer'
                                  : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              <div className="text-[10px] font-bold text-gray-700 leading-tight mb-0.5">{stance.label}</div>
                              <div className="text-[9px] text-gray-500 leading-tight mb-1">{stance.effectLabel}</div>
                              {isActive && isConflicted && (
                                <div className="text-[9px] text-orange-600 font-bold">⚠ Conflict</div>
                              )}
                              {isActive && !isConflicted && (
                                <div className="text-[9px] text-blue-600 font-bold">✓ Active</div>
                              )}
                              {!isActive && (
                                <div className={`text-[9px] font-semibold ${canAfford ? 'text-gray-500' : 'text-red-400'}`}>
                                  {formatCash(issue.adoptionCost)}
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Prestige — only after winning the Presidency; rendered inline here for non-won state.
          When game is won (awaitingNextElection && !nextElection), it's rendered at the TOP of the component. */}
      {hasWonPresidency && nextElection && !showPrestigeConfirm && (
        <PrestigeBox carryover={carryover} ppToEarn={ppToEarn} onLaunch={() => setShowPrestigeConfirm(true)} />
      )}
      {hasWonPresidency && nextElection && showPrestigeConfirm && (
        <PrestigeConfirm onCancel={() => setShowPrestigeConfirm(false)} onConfirm={() => { prestige(); setShowPrestigeConfirm(false); setShowFinalVictoryModal(true) }} />
      )}
    </div>
  )
}
