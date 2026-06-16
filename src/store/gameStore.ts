import { create } from 'zustand'
import type { GameState, BuildingId, MinigameId, CharismaLevel, ElectionTier } from '../game/types'
import {
  INITIAL_BUILDINGS,
  ELECTIONS,
  INITIAL_MINIGAMES,
  ELECTION_ORDER,
  TICK_RATE_MS,
  ELECTION_DAYS_BY_TIER,
} from '../game/constants'
import { buildInitialUpgrades } from '../game/upgrades'
import { buildInitialMilestones } from '../game/milestones'
import {
  getTotalSps,
  getClickSupporters,
  getClickCash,
  getClickSuccessChance,
  getNextElection,
  getVolunteerRecruitRate,
  getCashPerSecond,
  getBuildingCost,
  getFundraiseMultiplier,
  getFundraiseChance,
  getCourtMultiplier,
  getCourtChanceBonus,
} from '../game/selectors'
import { CHARISMA_LEVELS } from '../game/charisma'
import {
  getCarryoverRates,
  PRESTIGE_UPGRADES_BY_ID,
} from '../game/prestige'
import { generateCompetitors, getBurstChance, getBurstSize } from '../game/competitors'
import { saveGame, loadSave } from '../game/persistence'
import { CRISES, resolveCrisisOutcome } from '../game/crises'
import { POLICY_ISSUES } from '../game/policy'

interface GameActions {
  knock: () => void
  fundraise: () => boolean  // returns true if successful
  courtInterestGroups: () => void
  buyBuilding: (id: BuildingId) => void
  buyUpgrade: (id: string) => void
  buyPrestigeUpgrade: (id: string) => void
  activateMilestone: (id: string) => void
  levelUpCharisma: () => void
  tick: () => void
  winElection: () => void
  startNextElection: () => void
  resetElectionAfterDefeat: () => void
  prestige: () => void
  triggerMinigame: (id: MinigameId) => void
  cancelMinigame: (id: MinigameId) => void
  completeMinigame: (id: MinigameId, supporterBonus: number) => void
  setPlayerName: (name: string) => void
  startNewGame: (name: string) => void
  saveNow: () => void
  resetGame: () => void
  hardReset: () => void
  devSkipToTier: (tier: ElectionTier) => void
  chooseCrisisOption: (optionIndex: number) => void
  dismissCrisis: () => void
  adoptPolicyStance: (issueId: string, stanceId: string) => void
  holdRally: () => void
  issueStatement: () => void
  nationalFundraiser: () => void
  addressNation: () => void
}

// Module-level activity history for computing live boost display (3-second rolling window)
let clickBuffer: { t: number; supporters: number; cash: number }[] = []
let fundraiseBuffer: { t: number; cash: number }[] = []

function buildInitialState(): GameState {
  return {
    supporters: 0,
    totalSupportersEarned: 0,
    supportersPerClick: 1,
    supportersPerSecond: 0,
    cash: 0,
    totalCashEarned: 0,
    cashPerSecond: 0,
    charismaLevel: 0,
    minigameCompletions: { tv_ad: 0, debate: 0, stump_speech: 0, fundraiser: 0 },
    clickSuccessChance: 0.25,
    electionStartSnapshot: { supporters: 0, cash: 0, volunteerCount: 0, totalSupportersEarned: 0, purchasedUpgradeIds: [] },
    competitorWonElection: false,
    knockBoostSps: 0,
    knockBoostCps: 0,
    fundraiseBoostCps: 0,
    lastClickedForCash: null,
    lastCourtResult: null,
    courtCooldownEndsAt: 0,
    clickMultiplier: 1,
    buildings: structuredClone(INITIAL_BUILDINGS),
    upgrades: buildInitialUpgrades(),
    milestones: buildInitialMilestones(),
    currentTier: 'city_council',
    elections: structuredClone(ELECTIONS),
    electionDaysRemaining: ELECTION_DAYS_BY_TIER.city_council,
    electionDayFraction: 0,
    competitors: generateCompetitors('city_council', ELECTIONS.city_council.supportersRequired),
    awaitingNextElection: false,
    lastWonTier: null,
    prestigeCount: 0,
    prestigePoints: 0,
    purchasedPrestigeUpgrades: {},
    minigames: structuredClone(INITIAL_MINIGAMES),
    playerName: '',
    lastSaved: Date.now(),
    gameStarted: Date.now(),
    lastTick: Date.now(),
    activeCrisis: null,
    crisisFiresAt: 0,
    crisisResolution: null,
    policyStances: {},
    policyStanceSwitchCounts: {},
    abilityCooldowns: {},
    lastAbilityResult: null,
    abilityResults: {},
  }
}

function mergeWithSave(base: GameState, saved: Partial<GameState>): GameState {
  const state = structuredClone(base)

  if (saved.supporters !== undefined) state.supporters = saved.supporters
  if (saved.totalSupportersEarned !== undefined) state.totalSupportersEarned = saved.totalSupportersEarned
  if (saved.cash !== undefined) state.cash = saved.cash
  if (saved.totalCashEarned !== undefined) state.totalCashEarned = saved.totalCashEarned
  if (saved.charismaLevel !== undefined) state.charismaLevel = saved.charismaLevel
  if (saved.minigameCompletions) state.minigameCompletions = { ...state.minigameCompletions, ...saved.minigameCompletions }
  if (saved.clickSuccessChance !== undefined) state.clickSuccessChance = saved.clickSuccessChance
  if (saved.prestigeCount !== undefined) state.prestigeCount = saved.prestigeCount
  if (saved.prestigePoints !== undefined) state.prestigePoints = saved.prestigePoints
  if (saved.purchasedPrestigeUpgrades) state.purchasedPrestigeUpgrades = saved.purchasedPrestigeUpgrades
  if (saved.playerName !== undefined) state.playerName = saved.playerName
  if (saved.electionStartSnapshot) state.electionStartSnapshot = saved.electionStartSnapshot
  if (saved.gameStarted !== undefined) state.gameStarted = saved.gameStarted
  if (saved.currentTier !== undefined) state.currentTier = saved.currentTier
  if (saved.electionDaysRemaining !== undefined) {
    const maxDays = ELECTION_DAYS_BY_TIER[state.currentTier] ?? 365
    state.electionDaysRemaining = Math.min(Math.max(1, saved.electionDaysRemaining), maxDays)
  }
  if (saved.electionDayFraction !== undefined) state.electionDayFraction = saved.electionDayFraction
  if (saved.awaitingNextElection !== undefined) state.awaitingNextElection = saved.awaitingNextElection
  if (saved.lastWonTier !== undefined) state.lastWonTier = saved.lastWonTier
  if (saved.competitors && saved.competitors.length > 0) {
    // Regenerate rates from current formula, but preserve names and supporter counts
    const freshComps = generateCompetitors(state.currentTier, getNextElection(state)?.supportersRequired ?? 0)
    state.competitors = freshComps.map((fresh, i) => ({
      ...fresh,
      name: saved.competitors![i]?.name ?? fresh.name,
      supporters: saved.competitors![i]?.supporters ?? 0,
    }))
  }

  if (saved.buildings) {
    for (const [id, b] of Object.entries(saved.buildings)) {
      const bid = id as BuildingId
      if (state.buildings[bid]) state.buildings[bid].count = (b as { count: number }).count ?? 0
    }
  }
  if (saved.upgrades) {
    for (const [id, u] of Object.entries(saved.upgrades)) {
      if (state.upgrades[id]) state.upgrades[id].purchased = (u as { purchased: boolean }).purchased ?? false
    }
  }
  if (saved.milestones) {
    for (const [id, ms] of Object.entries(saved.milestones)) {
      if (state.milestones[id]) state.milestones[id].activated = (ms as { activated: boolean }).activated ?? false
    }
  }
  if (saved.elections) {
    for (const [tier, election] of Object.entries(saved.elections)) {
      const t = tier as keyof typeof state.elections
      if (state.elections[t]) state.elections[t].won = (election as { won: boolean }).won ?? false
    }
  }
  if (saved.minigames) {
    for (const [id, mg] of Object.entries(saved.minigames)) {
      const mid = id as MinigameId
      if (state.minigames[mid]) Object.assign(state.minigames[mid], mg)
    }
  }
  if (saved.policyStances) state.policyStances = saved.policyStances as Record<string, string | null>
  if (saved.crisisFiresAt !== undefined) state.crisisFiresAt = saved.crisisFiresAt as number
  // activeCrisis is intentionally not restored (don't resume a mid-crisis state after reload)

  const offlineSec = saved.lastSaved ? Math.min((Date.now() - saved.lastSaved) / 1000, 8 * 3600) : 0
  if (offlineSec > 0) {
    const sps = getTotalSps(state)
    state.supporters += sps * offlineSec
    state.totalSupportersEarned += sps * offlineSec
    state.cash += getCashPerSecond(state) * offlineSec
    state.totalCashEarned += getCashPerSecond(state) * offlineSec
    // Advance competitor supporters offline too
    for (const c of state.competitors) {
      c.supporters = Math.min(c.supporters + c.supportersPerSecond * offlineSec, c.supporters * 2)
    }
    // Advance election timer offline (capped so it doesn't go below 0 silently)
    const daysElapsed = offlineSec / 10
    state.electionDaysRemaining = Math.max(0, state.electionDaysRemaining - daysElapsed)
  }

  state.lastTick = Date.now()
  state.lastSaved = Date.now()
  return state
}

export const useGameStore = create<GameState & GameActions>((set, get) => {
  const saved = loadSave()
  const base = buildInitialState()
  const initial = saved ? mergeWithSave(base, saved) : base

  return {
    ...initial,

    knock() {
      const state = get()
      if (Math.random() > getClickSuccessChance(state)) return
      const earned = getClickSupporters(state)
      const cashEarned = getClickCash(state)
      clickBuffer.push({ t: Date.now(), supporters: earned, cash: cashEarned })
      set((s) => ({
        supporters: s.supporters + earned,
        totalSupportersEarned: s.totalSupportersEarned + earned,
        cash: s.cash + cashEarned,
        totalCashEarned: s.totalCashEarned + cashEarned,
        lastClickedForCash: 'knock',
      }))
    },

    fundraise() {
      const state = get()
      const chance = getFundraiseChance(state)
      if (Math.random() > chance) return false
      const mult = getFundraiseMultiplier(state)
      const amount = Math.max(10, Math.floor(state.supporters * 0.005 * mult))
      fundraiseBuffer.push({ t: Date.now(), cash: amount })
      set((s) => ({
        cash: s.cash + amount,
        totalCashEarned: s.totalCashEarned + amount,
        lastClickedForCash: 'fundraise',
      }))
      return true
    },

    courtInterestGroups() {
      const state = get()
      if (Date.now() < state.courtCooldownEndsAt) return
      const BASE_COURT_CHANCE = 0.05
      const courtChance = Math.min(0.25, BASE_COURT_CHANCE + getCourtChanceBonus(state))
      const hit = Math.random() <= courtChance
      if (!hit) {
        set((s) => ({
          lastCourtResult: { supporters: 0 },
          courtCooldownEndsAt: Date.now() + 30000,
          abilityResults: { ...s.abilityResults, court: 'miss' },
        }))
        return
      }
      const nextElection = getNextElection(state)
      const required = nextElection?.supportersRequired ?? 10000
      const mult = getCourtMultiplier(state)
      const COURT_FRACTION: Record<string, number> = {
        city_council: 0.08, mayor: 0.06, state_legislature: 0.04,
        governor: 0.02, senate: 0.008, president: 0.003,
      }
      const fraction = COURT_FRACTION[state.currentTier] ?? 0.01
      const supporterBonus = Math.floor(required * fraction * mult)
      set((s) => ({
        supporters: s.supporters + supporterBonus,
        totalSupportersEarned: s.totalSupportersEarned + supporterBonus,
        lastCourtResult: { supporters: supporterBonus },
        courtCooldownEndsAt: Date.now() + 30000,
        abilityResults: { ...s.abilityResults, court: 'hit' },
      }))
    },

    buyBuilding(id) {
      const state = get()
      const b = state.buildings[id]
      if (b.autoRecruit) return
      const cost = getBuildingCost(state, id)
      if (state.cash < cost) return
      set((s) => ({
        cash: s.cash - cost,
        buildings: { ...s.buildings, [id]: { ...s.buildings[id], count: s.buildings[id].count + 1 } },
      }))
    },

    buyUpgrade(id) {
      const state = get()
      const upgrade = state.upgrades[id]
      if (!upgrade || upgrade.purchased || state.cash < upgrade.cost) return
      set((s) => ({
        cash: s.cash - upgrade.cost,
        upgrades: { ...s.upgrades, [id]: { ...s.upgrades[id], purchased: true } },
      }))
    },

    buyPrestigeUpgrade(id) {
      const state = get()
      const def = PRESTIGE_UPGRADES_BY_ID[id]
      if (!def) return
      if (state.purchasedPrestigeUpgrades[id]) return
      if (state.prestigePoints < def.cost) return
      if (state.prestigeCount < def.unlockAfterPrestiges) return
      set((s) => ({
        prestigePoints: s.prestigePoints - def.cost,
        purchasedPrestigeUpgrades: { ...s.purchasedPrestigeUpgrades, [id]: true },
      }))
    },

    activateMilestone(id) {
      const state = get()
      const ms = state.milestones[id]
      if (!ms || ms.activated) return
      set((s) => ({
        milestones: { ...s.milestones, [id]: { ...s.milestones[id], activated: true } },
      }))
    },

    levelUpCharisma() {
      const state = get()
      const nextLevel = (state.charismaLevel + 1) as CharismaLevel
      if (nextLevel >= CHARISMA_LEVELS.length) return
      set({ charismaLevel: nextLevel })
    },

    tick() {
      const state = get()
      const now = Date.now()

      // Pause everything while player is viewing victory screen or handling a crisis
      if (state.awaitingNextElection || state.activeCrisis) {
        set({ lastTick: now })
        return
      }

      // Fire a crisis once the player has won the mayor election
      if (state.elections.mayor.won) {
        if (state.crisisFiresAt === 0) {
          // Schedule first crisis: 10-20 in-game days from now (100-200 real seconds)
          set({ crisisFiresAt: now + 100000 + Math.random() * 100000 })
        } else if (now >= state.crisisFiresAt) {
          const crisis = CRISES[Math.floor(Math.random() * CRISES.length)]!
          set({ activeCrisis: crisis.id })
          return
        }
      }

      const delta = (now - state.lastTick) / 1000

      const sps = getTotalSps(state)
      const earnedSupport = sps * delta
      const cps = getCashPerSecond(state)
      const earnedCash = cps * delta

      const recruitRate = getVolunteerRecruitRate(state)
      const newVolunteer = Math.random() < recruitRate * delta ? 1 : 0

      // Advance election timer: 1 in-game day = 7 real seconds
      let newDayFraction = state.electionDayFraction + delta / 7
      let newDaysRemaining = state.electionDaysRemaining
      while (newDayFraction >= 1 && newDaysRemaining > 0) {
        newDayFraction -= 1
        newDaysRemaining -= 1
      }
      newDaysRemaining = Math.max(0, newDaysRemaining)

      // Advance competitor supporters — rate accelerates from 30% to 300% of baseRate
      const electionTotalDays = ELECTION_DAYS_BY_TIER[state.currentTier] ?? 365
      const elapsedFraction = Math.max(0, Math.min(1, 1 - (state.electionDaysRemaining / electionTotalDays)))
      const burstChance = getBurstChance(state.currentTier)
      const nextElectionForBurst = getNextElection(state)
      const burstThreshold = nextElectionForBurst?.supportersRequired ?? 0
      const newCompetitors = state.competitors.map((c, i) => {
        const currentRate = c.baseRate * (0.3 + 2.7 * elapsedFraction)
        const burst = burstThreshold > 0 && Math.random() < burstChance * delta
          ? getBurstSize(burstThreshold, i === 0)
          : 0
        return {
          ...c,
          supportersPerSecond: currentRate,
          supporters: c.supporters + currentRate * delta + burst,
        }
      })

      const elections = state.elections
      const minigames = { ...state.minigames }
      if (elections.city_council.won && !minigames.tv_ad.unlocked)
        minigames.tv_ad = { ...minigames.tv_ad, unlocked: true }
      if (elections.mayor.won && !minigames.debate.unlocked)
        minigames.debate = { ...minigames.debate, unlocked: true }
      if (elections.state_legislature.won && !minigames.stump_speech.unlocked)
        minigames.stump_speech = { ...minigames.stump_speech, unlocked: true }
      if (elections.governor.won && !minigames.fundraiser.unlocked)
        minigames.fundraiser = { ...minigames.fundraiser, unlocked: true }

      // Compute live activity boosts from recent clicks (3-second rolling window)
      const clickCutoff = now - 3000
      clickBuffer = clickBuffer.filter((h) => h.t > clickCutoff)
      const knockBoostSps = clickBuffer.reduce((acc, h) => acc + h.supporters, 0) / 3
      const knockBoostCps = clickBuffer.reduce((acc, h) => acc + h.cash, 0) / 3
      fundraiseBuffer = fundraiseBuffer.filter((h) => h.t > clickCutoff)
      const fundraiseBoostCps = fundraiseBuffer.reduce((acc, h) => acc + h.cash, 0) / 3

      set((s) => ({
        supporters: s.supporters + earnedSupport,
        totalSupportersEarned: s.totalSupportersEarned + earnedSupport,
        supportersPerSecond: sps,
        cash: s.cash + earnedCash,
        totalCashEarned: s.totalCashEarned + earnedCash,
        cashPerSecond: cps,
        lastTick: now,
        minigames,
        knockBoostSps,
        knockBoostCps,
        fundraiseBoostCps,
        electionDaysRemaining: newDaysRemaining,
        electionDayFraction: newDayFraction,
        competitors: newCompetitors,
        buildings: newVolunteer > 0
          ? { ...s.buildings, volunteer: { ...s.buildings.volunteer, count: s.buildings.volunteer.count + 1 } }
          : s.buildings,
      }))

      // Auto-win as soon as player reaches the threshold
      const updated = get()
      const nextElection = getNextElection(updated)
      if (nextElection && updated.supporters >= nextElection.supportersRequired) {
        get().winElection()
        return
      }

      // Competitor wins if they reach the threshold first
      if (nextElection && !updated.competitorWonElection) {
        const competitorWon = updated.competitors.some((c) => c.supporters >= nextElection.supportersRequired)
        if (competitorWon) {
          set({ competitorWonElection: true })
        }
      }

      if (now - state.lastSaved > 30000) {
        saveGame(get())
        set({ lastSaved: now })
      }
    },

    winElection() {
      const state = get()
      const next = getNextElection(state)
      if (!next || state.supporters < next.supportersRequired) return
      const tierIndex = ELECTION_ORDER.indexOf(next.tier)
      const nextTier = ELECTION_ORDER[tierIndex + 1] ?? next.tier
      const newCompetitors = nextTier !== next.tier
        ? generateCompetitors(nextTier, state.elections[nextTier]?.supportersRequired ?? 0)
        : []
      set((s) => ({
        elections: { ...s.elections, [next.tier]: { ...s.elections[next.tier], won: true } },
        currentTier: nextTier,
        electionDaysRemaining: ELECTION_DAYS_BY_TIER[nextTier] ?? 365,
        electionDayFraction: 0,
        competitors: newCompetitors,
        awaitingNextElection: true,
        lastWonTier: next.tier,
        activeCrisis: null,
        crisisResolution: null,
      }))
    },

    startNextElection() {
      const state = get()
      set({
        awaitingNextElection: false,
        competitorWonElection: false,
        lastTick: Date.now(),
        electionStartSnapshot: {
          supporters: state.supporters,
          cash: state.cash,
          volunteerCount: state.buildings.volunteer.count,
          totalSupportersEarned: state.totalSupportersEarned,
          purchasedUpgradeIds: Object.values(state.upgrades).filter((u) => u.purchased).map((u) => u.id),
        },
      })
    },

    resetElectionAfterDefeat() {
      const state = get()
      const next = getNextElection(state)
      const tier = next?.tier ?? state.currentTier
      const required = next?.supportersRequired ?? 0
      const snap = state.electionStartSnapshot
      const purchasedSet = new Set(snap.purchasedUpgradeIds)
      set((s) => ({
        supporters: snap.supporters,
        cash: snap.cash,
        totalSupportersEarned: snap.totalSupportersEarned,
        buildings: { ...s.buildings, volunteer: { ...s.buildings.volunteer, count: snap.volunteerCount } },
        upgrades: Object.fromEntries(
          Object.entries(s.upgrades).map(([id, u]) => [id, { ...u, purchased: purchasedSet.has(id) }])
        ),
        electionDaysRemaining: ELECTION_DAYS_BY_TIER[tier] ?? 365,
        electionDayFraction: 0,
        competitors: generateCompetitors(tier, required),
        competitorWonElection: false,
      }))
    },

    prestige() {
      const state = get()
      // Only available after winning the presidency
      if (!state.elections.president.won) return

      const carryover = getCarryoverRates(state.purchasedPrestigeUpgrades)
      const carriedSupporters = Math.floor(state.supporters * carryover.supporters)
      const carriedCash = state.cash * carryover.cash
      const carriedVolunteers = Math.floor(state.buildings.volunteer.count * carryover.volunteers)

      const electionsWon = ELECTION_ORDER.filter((t) => state.elections[t].won).length
      const ppEarned = Math.max(1, electionsWon)

      const fresh = buildInitialState()
      const carriedMinigames = { ...fresh.minigames }
      for (const id of Object.keys(carriedMinigames) as MinigameId[]) {
        if (state.minigames[id].unlocked) {
          carriedMinigames[id] = { ...carriedMinigames[id], unlocked: true }
        }
      }
      set({
        ...fresh,
        playerName: state.playerName,
        supporters: carriedSupporters,
        totalSupportersEarned: carriedSupporters,
        cash: carriedCash,
        buildings: {
          ...fresh.buildings,
          volunteer: { ...fresh.buildings.volunteer, count: carriedVolunteers },
        },
        minigames: carriedMinigames,
        charismaLevel: state.charismaLevel,
        minigameCompletions: state.minigameCompletions,
        prestigeCount: state.prestigeCount + 1,
        prestigePoints: state.prestigePoints + ppEarned,
        purchasedPrestigeUpgrades: state.purchasedPrestigeUpgrades,
        gameStarted: state.gameStarted,
        lastTick: Date.now(),
        lastSaved: Date.now(),
      })
    },

    triggerMinigame(id) {
      const state = get()
      const mg = state.minigames[id]
      if (!mg.unlocked || mg.active || Date.now() < mg.cooldownEndsAt) return
      set((s) => ({
        minigames: { ...s.minigames, [id]: { ...s.minigames[id], active: true } },
      }))
    },

    cancelMinigame(id) {
      set((s) => ({
        minigames: { ...s.minigames, [id]: { ...s.minigames[id], active: false } },
      }))
    },

    completeMinigame(id, supporterBonus) {
      const state = get()
      const mg = state.minigames[id]
      set((s) => ({
        supporters: s.supporters + supporterBonus,
        totalSupportersEarned: s.totalSupportersEarned + supporterBonus,
        minigameCompletions: {
          ...s.minigameCompletions,
          [id]: (s.minigameCompletions[id] ?? 0) + 1,
        },
        minigames: {
          ...s.minigames,
          [id]: { ...s.minigames[id], active: false, cooldownEndsAt: Date.now() + mg.cooldownSeconds * 1000 },
        },
      }))
    },

    setPlayerName(name) {
      set({ playerName: name.slice(0, 20) })
      saveGame(get())
    },

    startNewGame(name) {
      clickBuffer = []
      fundraiseBuffer = []
      try { localStorage.clear() } catch { /* ignore */ }
      const fresh = buildInitialState()
      fresh.playerName = name.slice(0, 20)
      set(fresh)
      saveGame(fresh)
    },

    saveNow() {
      saveGame(get())
      set({ lastSaved: Date.now() })
    },

    resetGame() {
      set(buildInitialState())
    },

    hardReset() {
      try { localStorage.clear() } catch { /* ignore */ }
      set(buildInitialState())
    },

    devSkipToTier(tier: ElectionTier) {
      const state = get()
      const tierIndex = ELECTION_ORDER.indexOf(tier)
      // Mark all prior elections won
      const elections = { ...state.elections }
      for (let i = 0; i < tierIndex; i++) {
        const t = ELECTION_ORDER[i]!
        elections[t] = { ...elections[t], won: true }
      }
      const required = elections[tier].supportersRequired
      const supporters = Math.floor(required * 0.1)
      const cash = Math.floor(required * 0.5)
      const competitors = generateCompetitors(tier, required)
      set({
        elections,
        currentTier: tier,
        supporters,
        totalSupportersEarned: supporters,
        cash,
        electionDaysRemaining: ELECTION_DAYS_BY_TIER[tier] ?? 365,
        electionDayFraction: 0,
        competitors,
        awaitingNextElection: false,
        competitorWonElection: false,
        activeCrisis: null,
        crisisResolution: null,
        electionStartSnapshot: {
          supporters,
          cash,
          volunteerCount: state.buildings.volunteer.count,
          totalSupportersEarned: supporters,
          purchasedUpgradeIds: Object.values(state.upgrades).filter((u) => u.purchased).map((u) => u.id),
        },
      })
    },

    chooseCrisisOption(optionIndex: number) {
      const state = get()
      if (!state.activeCrisis || state.crisisResolution !== null) return
      const crisisDef = CRISES.find((c) => c.id === state.activeCrisis)
      if (!crisisDef) { set({ activeCrisis: null }); return }
      const option = crisisDef.options[optionIndex]
      if (!option) return

      const nextElection = getNextElection(state)
      const required = nextElection?.supportersRequired ?? 10000
      const cashCost = Math.floor(required * option.costFraction)
      if (cashCost > 0 && state.cash < cashCost) return

      const outcome = resolveCrisisOutcome(option.outcome)
      let supporterDelta = 0
      let competitorSupporterDelta = 0
      if (outcome.type === 'supporters_pct') supporterDelta = Math.floor(required * outcome.value)
      if (outcome.type === 'competitor_pct') competitorSupporterDelta = Math.floor(required * outcome.value)

      const outcomeDelta = outcome.type === 'competitor_pct' ? competitorSupporterDelta : supporterDelta

      set((s) => ({
        cash: s.cash - cashCost,
        supporters: Math.max(0, s.supporters + supporterDelta),
        totalSupportersEarned: supporterDelta > 0
          ? s.totalSupportersEarned + supporterDelta
          : s.totalSupportersEarned,
        competitors: competitorSupporterDelta !== 0
          ? s.competitors.map((c, i) =>
              i === 0 ? { ...c, supporters: Math.max(0, c.supporters + competitorSupporterDelta) } : c
            )
          : s.competitors,
        crisisResolution: { optionIndex, outcomeType: outcome.type, outcomeDelta },
      }))
    },
    dismissCrisis() {
      const now = Date.now()
      // Next crisis fires in 10-20 in-game days (100-200 real seconds)
      const nextCrisisAt = now + 100000 + Math.random() * 100000
      set({ activeCrisis: null, crisisResolution: null, crisisFiresAt: nextCrisisAt, lastTick: now })
    },

    adoptPolicyStance(issueId: string, stanceId: string) {
      const state = get()
      const issue = POLICY_ISSUES.find((i) => i.id === issueId)
      if (!issue) return
      if (!state.elections[issue.unlocksAfter]?.won) return
      if (state.cash < issue.adoptionCost) return
      if (state.policyStances[issueId] === stanceId) return

      const isSwitching = !!state.policyStances[issueId]
      const switchCount = state.policyStanceSwitchCounts[issueId] ?? 0
      // Escalating penalty: 3%, 6%, 10%, 15%, 20% (capped)
      const SWITCH_PCTS = [0.03, 0.06, 0.10, 0.15, 0.20]
      const pct = isSwitching ? (SWITCH_PCTS[Math.min(switchCount, SWITCH_PCTS.length - 1)] ?? 0.20) : 0
      const switchPenalty = Math.floor(state.supporters * pct)

      set((s) => ({
        cash: s.cash - issue.adoptionCost,
        supporters: Math.max(0, s.supporters - switchPenalty),
        policyStances: { ...s.policyStances, [issueId]: stanceId },
        policyStanceSwitchCounts: isSwitching
          ? { ...s.policyStanceSwitchCounts, [issueId]: switchCount + 1 }
          : s.policyStanceSwitchCounts,
      }))
    },

    holdRally() {
      const state = get()
      if (!state.elections.state_legislature.won) return
      const now = Date.now()
      if ((state.abilityCooldowns.rally ?? 0) > now) return
      const nextElection = getNextElection(state)
      const threshold = nextElection?.supportersRequired ?? 10000
      const cost = Math.floor(threshold * 0.025)
      if (state.cash < cost) return
      const hit = Math.random() < 0.70
      const gain = hit ? Math.floor(threshold * 0.06) : 0
      set((s) => ({
        cash: s.cash - cost,
        supporters: s.supporters + gain,
        totalSupportersEarned: s.totalSupportersEarned + gain,
        abilityCooldowns: { ...s.abilityCooldowns, rally: now + 60000 },
        abilityResults: { ...s.abilityResults, rally: hit ? 'hit' : 'miss' },
        lastAbilityResult: { abilityId: 'rally', supporterDelta: gain, cashDelta: -cost, good: hit },
      }))
    },

    issueStatement() {
      const state = get()
      if (!state.elections.governor.won) return
      const now = Date.now()
      if ((state.abilityCooldowns.statement ?? 0) > now) return
      const nextElection = getNextElection(state)
      const threshold = nextElection?.supportersRequired ?? 100000
      const hit = Math.random() < 0.60
      if (hit) {
        const delta = Math.floor(threshold * 0.05)
        set((s) => {
          const topIdx = s.competitors.reduce((best, c, i, arr) =>
            c.supporters > arr[best].supporters ? i : best, 0)
          return {
            competitors: s.competitors.map((c, i) =>
              i === topIdx ? { ...c, supporters: Math.max(0, c.supporters - delta) } : c
            ),
            abilityCooldowns: { ...s.abilityCooldowns, statement: now + 90000 },
            abilityResults: { ...s.abilityResults, statement: 'hit' },
            lastAbilityResult: { abilityId: 'statement', supporterDelta: -delta, cashDelta: 0, good: true },
          }
        })
      } else {
        const penalty = Math.floor(threshold * 0.03)
        set((s) => ({
          supporters: Math.max(0, s.supporters - penalty),
          abilityCooldowns: { ...s.abilityCooldowns, statement: now + 90000 },
          abilityResults: { ...s.abilityResults, statement: 'miss' },
          lastAbilityResult: { abilityId: 'statement', supporterDelta: -penalty, cashDelta: 0, good: false },
        }))
      }
    },

    nationalFundraiser() {
      const state = get()
      if (!state.elections.senate.won) return
      const now = Date.now()
      if ((state.abilityCooldowns.natfundraiser ?? 0) > now) return
      const nextElection = getNextElection(state)
      const threshold = nextElection?.supportersRequired ?? 1000000
      const hit = Math.random() < 0.65
      const cashGain = hit ? Math.floor(threshold * 0.12) : 0
      set((s) => ({
        cash: s.cash + cashGain,
        totalCashEarned: s.totalCashEarned + cashGain,
        abilityCooldowns: { ...s.abilityCooldowns, natfundraiser: now + 120000 },
        abilityResults: { ...s.abilityResults, natfundraiser: hit ? 'hit' : 'miss' },
        lastAbilityResult: { abilityId: 'natfundraiser', supporterDelta: 0, cashDelta: cashGain, good: hit },
      }))
    },

    addressNation() {
      const state = get()
      if (!state.elections.senate.won) return
      const now = Date.now()
      if ((state.abilityCooldowns.address ?? 0) > now) return
      const nextElection = getNextElection(state)
      const threshold = nextElection?.supportersRequired ?? 1000000
      const hit = Math.random() < 0.45
      const gain = hit ? Math.floor(threshold * 0.15) : 0
      set((s) => ({
        supporters: s.supporters + gain,
        totalSupportersEarned: s.totalSupportersEarned + gain,
        abilityCooldowns: { ...s.abilityCooldowns, address: now + 300000 },
        abilityResults: { ...s.abilityResults, address: hit ? 'hit' : 'miss' },
        lastAbilityResult: { abilityId: 'address', supporterDelta: gain, cashDelta: 0, good: hit },
      }))
    },
  }
})

let tickInterval: ReturnType<typeof setInterval> | null = null

export function startGameLoop() {
  if (tickInterval) return
  tickInterval = setInterval(() => {
    useGameStore.getState().tick()
  }, TICK_RATE_MS)
}

export function stopGameLoop() {
  if (tickInterval) {
    clearInterval(tickInterval)
    tickInterval = null
  }
}
