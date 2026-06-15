import { create } from 'zustand'
import type { GameState, BuildingId, MinigameId, CharismaLevel } from '../game/types'
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
  getCourtMultiplier,
  getCourtChanceBonus,
} from '../game/selectors'
import { CHARISMA_LEVELS } from '../game/charisma'
import {
  getCarryoverRates,
  PRESTIGE_UPGRADES_BY_ID,
} from '../game/prestige'
import { generateCompetitors } from '../game/competitors'
import { saveGame, loadSave } from '../game/persistence'

interface GameActions {
  knock: () => void
  fundraise: () => void
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
  saveNow: () => void
  resetGame: () => void
  hardReset: () => void
}

// Module-level click history for computing live click SPS/CPS display
let clickBuffer: { t: number; supporters: number; cash: number }[] = []

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
    knockBoostSps: 0,
    knockBoostCps: 0,
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
    lastSaved: Date.now(),
    gameStarted: Date.now(),
    lastTick: Date.now(),
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
      }))
    },

    fundraise() {
      const state = get()
      const mult = getFundraiseMultiplier(state)
      const amount = Math.max(10, Math.floor(state.supporters * 0.005 * mult))
      set((s) => ({
        cash: s.cash + amount,
        totalCashEarned: s.totalCashEarned + amount,
      }))
    },

    courtInterestGroups() {
      const state = get()
      if (Date.now() < state.courtCooldownEndsAt) return
      const BASE_COURT_CHANCE = 0.05
      const courtChance = Math.min(0.25, BASE_COURT_CHANCE + getCourtChanceBonus(state))
      if (Math.random() > courtChance) {
        set({ lastCourtResult: null })
        return
      }
      const nextElection = getNextElection(state)
      const required = nextElection?.supportersRequired ?? 10000
      const mult = getCourtMultiplier(state)
      const supporterBonus = Math.floor(required * 0.025 * mult)
      const volunteerBonus = Math.max(5, Math.floor(state.buildings.volunteer.count * 0.15) + 5)
      set((s) => ({
        supporters: s.supporters + supporterBonus,
        totalSupportersEarned: s.totalSupportersEarned + supporterBonus,
        buildings: {
          ...s.buildings,
          volunteer: { ...s.buildings.volunteer, count: s.buildings.volunteer.count + volunteerBonus },
        },
        lastCourtResult: { supporters: supporterBonus, volunteers: volunteerBonus },
        courtCooldownEndsAt: Date.now() + 20000,
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

      // Pause everything while player is viewing victory screen
      if (state.awaitingNextElection) {
        set({ lastTick: now })
        return
      }

      const delta = (now - state.lastTick) / 1000

      const sps = getTotalSps(state)
      const earnedSupport = sps * delta
      const cps = getCashPerSecond(state)
      const earnedCash = cps * delta

      const recruitRate = getVolunteerRecruitRate(state)
      const newVolunteer = Math.random() < recruitRate * delta ? 1 : 0

      // Advance election timer: 1 in-game day = 10 real seconds
      let newDayFraction = state.electionDayFraction + delta / 10
      let newDaysRemaining = state.electionDaysRemaining
      while (newDayFraction >= 1 && newDaysRemaining > 0) {
        newDayFraction -= 1
        newDaysRemaining -= 1
      }
      newDaysRemaining = Math.max(0, newDaysRemaining)

      // Advance competitor supporters — rate accelerates from 50% to 200% of baseRate
      const electionTotalDays = ELECTION_DAYS_BY_TIER[state.currentTier] ?? 365
      const elapsedFraction = Math.max(0, Math.min(1, 1 - (state.electionDaysRemaining / electionTotalDays)))
      const newCompetitors = state.competitors.map((c) => {
        const currentRate = c.baseRate * (0.5 + 1.5 * elapsedFraction)
        return {
          ...c,
          supportersPerSecond: currentRate,
          supporters: c.supporters + currentRate * delta,
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

      // Compute live click boost from recent knocks (3-second rolling window)
      const clickCutoff = now - 3000
      clickBuffer = clickBuffer.filter((h) => h.t > clickCutoff)
      const knockBoostSps = clickBuffer.reduce((acc, h) => acc + h.supporters, 0) / 3
      const knockBoostCps = clickBuffer.reduce((acc, h) => acc + h.cash, 0) / 3

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
        electionDaysRemaining: newDaysRemaining,
        electionDayFraction: newDayFraction,
        competitors: newCompetitors,
        buildings: newVolunteer > 0
          ? { ...s.buildings, volunteer: { ...s.buildings.volunteer, count: s.buildings.volunteer.count + 1 } }
          : s.buildings,
      }))

      // Auto-win as soon as player reaches the threshold (or when time runs out)
      const updated = get()
      const nextElection = getNextElection(updated)
      if (nextElection && updated.supporters >= nextElection.supportersRequired) {
        get().winElection()
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
      }))
    },

    startNextElection() {
      set({ awaitingNextElection: false, lastTick: Date.now() })
    },

    resetElectionAfterDefeat() {
      const state = get()
      const next = getNextElection(state)
      const tier = next?.tier ?? state.currentTier
      const required = next?.supportersRequired ?? 0
      set((s) => ({
        supporters: Math.floor(s.supporters * 0.7),
        electionDaysRemaining: ELECTION_DAYS_BY_TIER[tier] ?? 365,
        electionDayFraction: 0,
        competitors: generateCompetitors(tier, required),
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
