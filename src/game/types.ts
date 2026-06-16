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
    | 'fundraise_chance'
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

  playerName: string

  lastSaved: number
  gameStarted: number
  lastTick: number

  // Snapshot of resources at the start of the current election (for defeat reset)
  electionStartSnapshot: {
    supporters: number
    cash: number
    volunteerCount: number
    totalSupportersEarned: number
    purchasedUpgradeIds: string[]
  }

  // Set true when a competitor reaches the threshold first
  competitorWonElection: boolean

  // Crisis management
  activeCrisis: string | null   // id of the currently-displaying crisis, or null
  crisisFiresAt: number         // ms timestamp when next crisis will fire (0 = not yet scheduled)
  crisisResolution: { optionIndex: number; outcomeType: string; outcomeDelta: number } | null

  // Ability cooldowns — maps ability id → timestamp when cooldown ends
  abilityCooldowns: Record<string, number>
  // Transient: last ability result for float display (not saved)
  lastAbilityResult: { abilityId: string; supporterDelta: number; cashDelta: number; good: boolean } | null
  // Per-ability hit/miss result — persists for the full cooldown duration
  abilityResults: Record<string, 'hit' | 'miss'>

  // Policy platform — maps issueId → active stanceId (null = no stance adopted)
  policyStances: Record<string, string | null>
  // How many times each issue's stance has been switched (used for escalating penalty)
  policyStanceSwitchCounts: Record<string, number>

  // Transient activity-boost display (not saved — resets on load)
  knockBoostSps: number
  knockBoostCps: number
  fundraiseBoostCps: number
  lastClickedForCash: 'knock' | 'fundraise' | null
  lastCourtResult: { supporters: number } | null
  courtCooldownEndsAt: number
}
