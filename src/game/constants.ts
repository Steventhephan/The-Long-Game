import type { Building, Election, MinigameState, ElectionTier, BuildingId, MinigameId } from './types'

export const INITIAL_BUILDINGS: Record<BuildingId, Building> = {
  volunteer: {
    id: 'volunteer',
    name: 'Volunteer',
    description: 'A neighbor who knocks doors for you. Recruited automatically via Charisma.',
    baseCost: 0,
    costScaling: 1,
    baseSupportersPerSecond: 0.1,
    count: 0,
    unlockAt: 0,
    currency: 'cash',
    autoRecruit: true,
  },
  door_knocker: {
    id: 'door_knocker',
    name: 'Professional Door Knocker',
    description: 'A paid canvasser — experienced, persuasive, and far more effective than a volunteer.',
    baseCost: 150,
    costScaling: 1.20,
    baseSupportersPerSecond: 0.5,
    count: 0,
    unlockAt: 0,
    currency: 'cash',
  },
  phone_bank: {
    id: 'phone_bank',
    name: 'Phone Bank',
    description: 'A room of callers reaching voters you can\'t visit.',
    baseCost: 800,
    costScaling: 1.17,
    baseSupportersPerSecond: 2,
    count: 0,
    unlockAt: 50,
    currency: 'cash',
  },
  field_office: {
    id: 'field_office',
    name: 'Field Office',
    description: 'A hub coordinating volunteers across a district.',
    baseCost: 12000,
    costScaling: 1.15,
    baseSupportersPerSecond: 10,
    count: 0,
    unlockAt: 500,
    currency: 'cash',
  },
  campaign_bus: {
    id: 'campaign_bus',
    name: 'Campaign Bus',
    description: 'You on the road, rallying crowds across the region.',
    baseCost: 120000,
    costScaling: 1.15,
    baseSupportersPerSecond: 60,
    count: 0,
    unlockAt: 5000,
    currency: 'cash',
  },
  media_team: {
    id: 'media_team',
    name: 'Media Team',
    description: 'PR pros managing your image around the clock.',
    baseCost: 5000000,
    costScaling: 1.15,
    baseSupportersPerSecond: 200,
    count: 0,
    unlockAt: 50000,
    currency: 'cash',
  },
  super_pac: {
    id: 'super_pac',
    name: 'Super PAC',
    description: 'An independent expenditure committee — officially not coordinating with your campaign.',
    baseCost: 60000000,
    costScaling: 1.15,
    baseSupportersPerSecond: 1200,
    count: 0,
    unlockAt: 500000,
    currency: 'cash',
  },
}

export const ELECTIONS: Record<ElectionTier, Election> = {
  city_council: {
    tier: 'city_council',
    name: 'City Council',
    supportersRequired: 500,
    rewardDescription: 'Unlock Phone Banks and TV Ad outreach',
    won: false,
  },
  mayor: {
    tier: 'mayor',
    name: 'Mayoral',
    supportersRequired: 10000,
    rewardDescription: 'Unlock Field Offices and Debate outreach',
    won: false,
  },
  state_legislature: {
    tier: 'state_legislature',
    name: 'State Legislature',
    supportersRequired: 100000,
    rewardDescription: 'Unlock Campaign Bus and Stump Speech outreach',
    won: false,
  },
  governor: {
    tier: 'governor',
    name: 'Gubernatorial',
    supportersRequired: 1000000,
    rewardDescription: 'Unlock Media Team and Fundraiser outreach',
    won: false,
  },
  senate: {
    tier: 'senate',
    name: 'U.S. Senate',
    supportersRequired: 80000000,
    rewardDescription: 'Unlock Super PAC',
    won: false,
  },
  president: {
    tier: 'president',
    name: 'Presidential',
    supportersRequired: 800000000,
    rewardDescription: 'You win The Long Game.',
    won: false,
  },
}

export const ELECTION_ORDER: ElectionTier[] = [
  'city_council',
  'mayor',
  'state_legislature',
  'governor',
  'senate',
  'president',
]

export const INITIAL_MINIGAMES: Record<MinigameId, MinigameState> = {
  tv_ad: { id: 'tv_ad', unlocked: false, active: false, cooldownEndsAt: 0, cooldownSeconds: 60 },
  debate: { id: 'debate', unlocked: false, active: false, cooldownEndsAt: 0, cooldownSeconds: 120 },
  stump_speech: { id: 'stump_speech', unlocked: false, active: false, cooldownEndsAt: 0, cooldownSeconds: 90 },
  fundraiser: { id: 'fundraiser', unlocked: false, active: false, cooldownEndsAt: 0, cooldownSeconds: 180 },
}

// Volunteer recruit rate per second = BASE_VOLUNTEER_RECRUIT_RATE × charisma stat
// At stat=1 (Tone-Deaf): 0.06/sec → ~1 volunteer per 17s
// At stat=60 (Relatable): 3.6/sec
// At stat=5000 (Historic): 300/sec
export const BASE_VOLUNTEER_RECRUIT_RATE = 0.06

// Cash earned per supporter per second
export const BASE_CASH_DONATION_RATE = 0.01

// Election length in in-game days. 1 day = 10 real seconds.
export const ELECTION_DAYS_BY_TIER: Record<ElectionTier, number> = {
  city_council: 30,
  mayor: 90,
  state_legislature: 180,
  governor: 270,
  senate: 365,
  president: 365,
}

export const SAVE_KEY = 'the-long-game-save'
export const TICK_RATE_MS = 100
