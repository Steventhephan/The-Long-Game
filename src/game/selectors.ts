import type { GameState, BuildingId } from './types'
import { ELECTION_ORDER, BASE_VOLUNTEER_RECRUIT_RATE, BASE_CASH_DONATION_RATE } from './constants'
import { UPGRADES } from './upgrades'
import { MILESTONES_BY_ID, MILESTONES } from './milestones'
import { CHARISMA_LEVELS, canLevelUpCharisma } from './charisma'
import {
  getPrestigeProductionMult,
  getPrestigeCashRateMult,
  getPrestigeClickMult,
} from './prestige'

function productEffects(
  state: GameState,
  match: (effect: { type: string; value: number; targetBuilding?: BuildingId }) => number | null
): number {
  let product = 1
  for (const upgrade of Object.values(state.upgrades)) {
    if (upgrade.purchased) {
      const v = match(upgrade.effect)
      if (v !== null) product *= v
    }
  }
  for (const ms of Object.values(state.milestones)) {
    if (!ms.activated) continue
    const def = MILESTONES_BY_ID[ms.id]
    if (def) {
      const v = match(def.effect)
      if (v !== null) product *= v
    }
  }
  return product
}

function sumEffects(
  state: GameState,
  match: (effect: { type: string; value: number; targetBuilding?: BuildingId }) => number
): number {
  let total = 0
  for (const upgrade of Object.values(state.upgrades)) {
    if (upgrade.purchased) total += match(upgrade.effect)
  }
  for (const ms of Object.values(state.milestones)) {
    if (!ms.activated) continue
    const def = MILESTONES_BY_ID[ms.id]
    if (def) total += match(def.effect)
  }
  return total
}

export function getBuildingCost(state: GameState, id: BuildingId): number {
  const b = state.buildings[id]
  return Math.floor(b.baseCost * Math.pow(b.costScaling, b.count))
}

export function getBuildingSps(state: GameState, id: BuildingId): number {
  const b = state.buildings[id]
  if (b.count === 0) return 0
  const buildingMult = productEffects(state, (e) =>
    e.type === 'building_multiplier' && e.targetBuilding === id ? e.value : null
  )
  const globalMult = productEffects(state, (e) =>
    e.type === 'all_production' ? e.value : null
  )
  const prestigeMult = getPrestigeProductionMult(state.purchasedPrestigeUpgrades)
  return b.baseSupportersPerSecond * b.count * buildingMult * globalMult * prestigeMult
}

export function getTotalSps(state: GameState): number {
  let total = 0
  for (const id of Object.keys(state.buildings) as BuildingId[]) {
    total += getBuildingSps(state, id)
  }
  return total
}

export function getClickSupporters(state: GameState): number {
  const regularMult = productEffects(state, (e) =>
    e.type === 'click_multiplier' ? e.value : null
  )
  const prestigeMult = getPrestigeClickMult(state.purchasedPrestigeUpgrades)
  return state.supportersPerClick * regularMult * prestigeMult
}

// Each successful knock also earns cash directly — scales with click multiplier.
// Base: $2 per knock. Ensures early game has a cash source before passive income kicks in.
export function getClickCash(state: GameState): number {
  const regularMult = productEffects(state, (e) =>
    e.type === 'click_multiplier' ? e.value : null
  )
  const prestigeMult = getPrestigeClickMult(state.purchasedPrestigeUpgrades)
  return Math.ceil(2 * regularMult * prestigeMult)
}

export function getClickSuccessChance(state: GameState): number {
  const bonus = sumEffects(state, (e) => (e.type === 'click_chance' ? e.value : 0))
  return Math.min(1, state.clickSuccessChance + bonus)
}

export function getCharismaStat(state: GameState): number {
  return CHARISMA_LEVELS[state.charismaLevel]?.stat ?? 1
}

export function getCharismaName(state: GameState): string {
  return CHARISMA_LEVELS[state.charismaLevel]?.name ?? 'Tone-Deaf'
}

export function getVolunteerRecruitRate(state: GameState): number {
  return BASE_VOLUNTEER_RECRUIT_RATE * getCharismaStat(state)
}

export function getCashPerSecond(state: GameState): number {
  const regularMult = productEffects(state, (e) => (e.type === 'cash_rate' ? e.value : null))
  const prestigeMult = getPrestigeCashRateMult(state.purchasedPrestigeUpgrades)
  return state.supporters * BASE_CASH_DONATION_RATE * regularMult * prestigeMult
}

export function getFundraiseMultiplier(state: GameState): number {
  return productEffects(state, (e) => e.type === 'fundraise_multiplier' ? e.value : null)
}

export function getCourtMultiplier(state: GameState): number {
  return productEffects(state, (e) => e.type === 'court_multiplier' ? e.value : null)
}

export function getCourtChanceBonus(state: GameState): number {
  return sumEffects(state, (e) => e.type === 'court_chance' ? e.value : 0)
}

export function getCanLevelUpCharisma(state: GameState): boolean {
  return canLevelUpCharisma(state.charismaLevel, state.totalSupportersEarned, state.minigameCompletions)
}

export function getNextElection(state: GameState) {
  for (const tier of ELECTION_ORDER) {
    if (!state.elections[tier].won) return state.elections[tier]
  }
  return null
}

export function getHasWonAnyElection(state: GameState): boolean {
  return ELECTION_ORDER.some((tier) => state.elections[tier].won)
}

export function getHasWonPresidency(state: GameState): boolean {
  return state.elections.president.won
}

export function getAvailableUpgrades(state: GameState) {
  return Object.values(state.upgrades).filter((u) => {
    if (u.purchased) return false
    return UPGRADES[u.id]?.unlockCondition(state) ?? false
  })
}

// All milestones sorted by supporter requirement, annotated with status
export type MilestoneStatus = 'activated' | 'pending' | 'locked'

export function getAllMilestonesAnnotated(state: GameState): {
  def: (typeof MILESTONES)[number]
  status: MilestoneStatus
}[] {
  return MILESTONES.map((def) => {
    const ms = state.milestones[def.id]
    if (ms?.activated) return { def, status: 'activated' as const }
    if (state.totalSupportersEarned >= def.supportersRequired) return { def, status: 'pending' as const }
    return { def, status: 'locked' as const }
  })
}

export function getPendingMilestones(state: GameState) {
  return getAllMilestonesAnnotated(state)
    .filter((m) => m.status === 'pending')
    .map((m) => m.def)
}

export function getRewardsBadgeCount(state: GameState): number {
  const availableUpgrades = getAvailableUpgrades(state).length
  const pendingMilestones = getPendingMilestones(state).length
  return availableUpgrades + pendingMilestones
}
