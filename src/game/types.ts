export type ElectionTier =
  | 'city_council'
  | 'mayor'
  | 'state_legislature'
  | 'governor'
  | 'senate'
  | 'president'

export type BuildingId =
  | 'volunteer'
  | 'door_knocker'
  | 'phone_bank'
  | 'field_office'
  | 'campaign_bus'
  | 'media_team'
  | 'super_pac'

export type UpgradeId = string

export type MinigameId = 'tv_ad' | 'debate' | 'stump_speech' | 'fundraiser'

export type Currency = 'cash'

export type CharismaLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface Building {
  id: BuildingId
  name: string
  description: string
  baseCost: number
  costScaling: number
  baseSupportersPerSecond: number
  count: number
  unlockAt: number
  currency: Currency
  autoRecruit?: boolean
}

export interface Upgrade {
  id: UpgradeId
  name: string
  description: string
  cost: number
  purchased: boolean
  effect: UpgradeEffect
}

export interface UpgradeEffect {
  type:
    | 'click_multiplier'
    | 'building_multiplier'
    | 'click_chance'
    | 'all_production'
    | 'charisma_multiplier'
    | 'cash_rate'
    | 'fundraise_multiplier'
    | 'court_multiplier'
    | 'court_chance'
  value: number
  targetBuilding?: BuildingId
}

export interface MilestoneState {
  id: string
  activated: boolean
}

export interface Election {
  tier: ElectionTier
  name: string
  supportersRequired: number
  rewardDescription: string
  won: boolean
}

export interface MinigameState {
  id: MinigameId
  unlocked: boolean
  active: boolean
  cooldownEndsAt: number
  cooldownSeconds: number
}

export interface Competitor {
  id: string
  name: string
  supporters: number
  supportersPerSecond: number  // current (live) rate, accelerates over election
  baseRate: number             // rate at election start, used to compute acceleration
}

export interface GameState {
  supporters: number
  totalSupportersEarned: number
  supportersPerClick: number
  supportersPerSecond: number

  cash: number
  totalCashEarned: number
  cashPerSecond: number

  charismaLevel: CharismaLevel
  minigameCompletions: Record<MinigameId, number>

  clickSuccessChance: number
  clickMultiplier: number

  buildings: Record<BuildingId, Building>
  upgrades: Record<UpgradeId, Upgrade>
  milestones: Record<string, MilestoneState>

  currentTier: ElectionTier
  elections: Record<ElectionTier, Election>

  // Election timer & competitors
  electionDaysRemaining: number
  electionDayFraction: number  // 0-1 accumulator; when it hits 1, a day passes
  competitors: Competitor[]
  awaitingNextElection: boolean  // true after winning; game is paused until player advances
  lastWonTier: ElectionTier | null

  // Prestige
  prestigeCount: number
  prestigePoints: number
  purchasedPrestigeUpgrades: Record<string, boolean>

  minigames: Record<MinigameId, MinigameState>

  lastSaved: number
  gameStarted: number
  lastTick: number

  // Transient click-boost display (not saved — resets on load)
  knockBoostSps: number
  knockBoostCps: number
  lastCourtResult: { supporters: number; volunteers: number } | null
  courtCooldownEndsAt: number
}
