import type { GameState, Upgrade } from './types'

interface UpgradeDef {
  id: string
  name: string
  description: string
  cost: number
  unlockCondition: (s: GameState) => boolean
  effect: {
    type: 'click_multiplier' | 'building_multiplier' | 'click_chance' | 'all_production' | 'charisma_multiplier' | 'cash_rate' | 'fundraise_multiplier' | 'court_multiplier' | 'court_chance'
    value: number
    targetBuilding?: import('./types').BuildingId
  }
}

// All upgrades cost cash. unlockCondition lives here (never serialized into state).
export const UPGRADES: Record<string, UpgradeDef> = {
  // ── Click upgrades ───────────────────────────────────────────────────
  better_pitch: {
    id: 'better_pitch',
    name: 'Better Pitch',
    description: 'Refined message. +10% door knock success chance.',
    cost: 25,
    unlockCondition: (s) => s.totalSupportersEarned >= 10,
    effect: { type: 'click_chance', value: 0.1 },
  },
  talking_points: {
    id: 'talking_points',
    name: 'Talking Points',
    description: 'You know exactly what to say at the door. 1.5x supporters per knock.',
    cost: 60,
    unlockCondition: (s) => s.totalSupportersEarned >= 30,
    effect: { type: 'click_multiplier', value: 1.5 },
  },
  practiced_smile: {
    id: 'practiced_smile',
    name: 'Practiced Smile',
    description: 'Voters trust a warm face. 2x supporters per knock.',
    cost: 300,
    unlockCondition: (s) => s.totalSupportersEarned >= 150,
    effect: { type: 'click_multiplier', value: 2 },
  },
  neighbor_endorsements: {
    id: 'neighbor_endorsements',
    name: 'Neighbor Endorsements',
    description: 'Trusted locals vouch for you at every door. +15% knock success chance.',
    cost: 600,
    unlockCondition: (s) => s.totalSupportersEarned >= 350,
    effect: { type: 'click_chance', value: 0.15 },
  },
  community_trust: {
    id: 'community_trust',
    name: 'Community Trust',
    description: 'You\'re a known face in every neighborhood. 2x supporters per knock.',
    cost: 2500,
    unlockCondition: (s) => s.totalSupportersEarned >= 800,
    effect: { type: 'click_multiplier', value: 2 },
  },
  campaign_slogan: {
    id: 'campaign_slogan',
    name: 'Campaign Slogan',
    description: 'A catchy phrase worth a thousand knocks. 3x click supporters.',
    cost: 8000,
    unlockCondition: (s) => s.totalSupportersEarned >= 2500,
    effect: { type: 'click_multiplier', value: 3 },
  },
  grassroots_surge: {
    id: 'grassroots_surge',
    name: 'Grassroots Surge',
    description: 'Momentum is building. Every knock draws a crowd. 2x supporters per knock.',
    cost: 40000,
    unlockCondition: (s) => s.totalSupportersEarned >= 6000,
    effect: { type: 'click_multiplier', value: 2 },
  },
  viral_moment: {
    id: 'viral_moment',
    name: 'Viral Moment',
    description: 'One clip makes the rounds. 5x click supporters.',
    cost: 120000,
    unlockCondition: (s) => s.totalSupportersEarned >= 20000,
    effect: { type: 'click_multiplier', value: 5 },
  },

  // ── Volunteer upgrades ───────────────────────────────────────────────
  volunteer_shirts: {
    id: 'volunteer_shirts',
    name: 'Campaign T-Shirts',
    description: 'Walking billboards. Volunteers 2x more effective.',
    cost: 1500,
    unlockCondition: (s) => s.buildings.volunteer.count >= 10,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'volunteer' },
  },
  neighborhood_captains: {
    id: 'neighborhood_captains',
    name: 'Neighborhood Captains',
    description: 'Organized volunteers do 3x more work.',
    cost: 25000,
    unlockCondition: (s) => s.buildings.volunteer.count >= 30,
    effect: { type: 'building_multiplier', value: 3, targetBuilding: 'volunteer' },
  },

  // ── Door knocker upgrades ─────────────────────────────────────────────
  persuasion_training: {
    id: 'persuasion_training',
    name: 'Persuasion Training',
    description: 'Trained canvassers close twice as many doors. 2x door knocker output.',
    cost: 400,
    unlockCondition: (s) => s.buildings.door_knocker.count >= 1,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'door_knocker' },
  },
  voter_data: {
    id: 'voter_data',
    name: 'Voter Data Lists',
    description: 'Target likely supporters. Door knockers 2x more effective.',
    cost: 3000,
    unlockCondition: (s) => s.buildings.door_knocker.count >= 5,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'door_knocker' },
  },
  canvassing_app: {
    id: 'canvassing_app',
    name: 'Canvassing App',
    description: 'GPS-optimized routes. Door knockers 3x more effective.',
    cost: 20000,
    unlockCondition: (s) => s.buildings.door_knocker.count >= 15,
    effect: { type: 'building_multiplier', value: 3, targetBuilding: 'door_knocker' },
  },

  // ── Phone bank upgrades ───────────────────────────────────────────────
  better_scripts: {
    id: 'better_scripts',
    name: 'Better Scripts',
    description: 'A tested script doubles phone bank output. 2x phone bank output.',
    cost: 4000,
    unlockCondition: (s) => s.buildings.phone_bank.count >= 1,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'phone_bank' },
  },
  robocall: {
    id: 'robocall',
    name: 'Robocall System',
    description: 'Automated calls scale your reach. Phone banks 2x more effective.',
    cost: 30000,
    unlockCondition: (s) => s.buildings.phone_bank.count >= 10,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'phone_bank' },
  },

  // ── Donation / cash upgrades ─────────────────────────────────────────
  grassroots_fundraising: {
    id: 'grassroots_fundraising',
    name: 'Grassroots Fundraising',
    description: 'Ask supporters to give $5. Donation rate 1.3x.',
    cost: 200,
    unlockCondition: (s) => s.totalSupportersEarned >= 200,
    effect: { type: 'cash_rate', value: 1.3 },
  },
  recurring_donors: {
    id: 'recurring_donors',
    name: 'Recurring Donors',
    description: 'Monthly pledge drives. Donation rate 1.5x.',
    cost: 8000,
    unlockCondition: (s) => s.totalCashEarned >= 1000,
    effect: { type: 'cash_rate', value: 1.5 },
  },
  bundlers: {
    id: 'bundlers',
    name: 'Bundlers',
    description: 'High-rollers bundle donations. Cash rate 2x.',
    cost: 100000,
    unlockCondition: (s) => s.totalCashEarned >= 20000 && s.elections.city_council.won,
    effect: { type: 'cash_rate', value: 2 },
  },

  // ── Global production ─────────────────────────────────────────────────
  grassroots_energy: {
    id: 'grassroots_energy',
    name: 'Grassroots Energy',
    description: 'The movement has momentum. All production 1.3x.',
    cost: 20000,
    unlockCondition: (s) => s.totalSupportersEarned >= 5000,
    effect: { type: 'all_production', value: 1.3 },
  },
  election_momentum: {
    id: 'election_momentum',
    name: 'Election Momentum',
    description: 'Polls show you winning. All production 1.5x.',
    cost: 200000,
    unlockCondition: (s) => s.elections.city_council.won,
    effect: { type: 'all_production', value: 1.5 },
  },
  national_attention: {
    id: 'national_attention',
    name: 'National Attention',
    description: 'You\'re on the news. All production 1.5x.',
    cost: 2500000,
    unlockCondition: (s) => s.elections.mayor.won,
    effect: { type: 'all_production', value: 1.5 },
  },

  // ── Fundraise upgrades ────────────────────────────────────────────────
  donor_network: {
    id: 'donor_network',
    name: 'Donor Network',
    description: 'Established relationships with major donors. Fundraise yields 2x more cash.',
    cost: 10000,
    unlockCondition: (s) => s.elections.city_council.won,
    effect: { type: 'fundraise_multiplier', value: 2 },
  },
  bundled_giving: {
    id: 'bundled_giving',
    name: 'Bundled Giving',
    description: 'Bundlers pool contributions. Fundraise yields 3x more cash.',
    cost: 300000,
    unlockCondition: (s) => s.elections.mayor.won,
    effect: { type: 'fundraise_multiplier', value: 3 },
  },

  // ── Court Interest Group upgrades ─────────────────────────────────────
  policy_positioning: {
    id: 'policy_positioning',
    name: 'Policy Positioning',
    description: 'Strategic policy stances attract organized groups. Court success +5% chance.',
    cost: 60000,
    unlockCondition: (s) => s.elections.mayor.won,
    effect: { type: 'court_chance', value: 0.05 },
  },
  coalition_building: {
    id: 'coalition_building',
    name: 'Coalition Building',
    description: 'A broad coalition multiplies interest group reach. Court gains 2x.',
    cost: 800000,
    unlockCondition: (s) => s.elections.state_legislature.won,
    effect: { type: 'court_multiplier', value: 2 },
  },
}

export function buildInitialUpgrades(): Record<string, Upgrade> {
  const result: Record<string, Upgrade> = {}
  for (const [id, def] of Object.entries(UPGRADES)) {
    result[id] = {
      id: def.id,
      name: def.name,
      description: def.description,
      cost: def.cost,
      purchased: false,
      effect: def.effect,
    }
  }
  return result
}
