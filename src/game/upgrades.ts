import type { GameState, Upgrade } from './types'

interface UpgradeDef {
  id: string
  name: string
  description: string
  cost: number
  unlockCondition: (s: GameState) => boolean
  effect: {
    type: 'click_multiplier' | 'building_multiplier' | 'click_chance' | 'all_production' | 'charisma_multiplier' | 'cash_rate' | 'fundraise_multiplier' | 'fundraise_chance' | 'court_multiplier' | 'court_chance'
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
    description: 'A refined message that lands at the door.',
    cost: 25,
    unlockCondition: (s) => s.totalSupportersEarned >= 10,
    effect: { type: 'click_chance', value: 0.1 },
  },
  talking_points: {
    id: 'talking_points',
    name: 'Talking Points',
    description: 'You know exactly what to say at the door.',
    cost: 60,
    unlockCondition: (s) => s.totalSupportersEarned >= 30,
    effect: { type: 'click_multiplier', value: 1.3 },
  },
  practiced_smile: {
    id: 'practiced_smile',
    name: 'Practiced Smile',
    description: 'Voters trust a warm face.',
    cost: 300,
    unlockCondition: (s) => s.totalSupportersEarned >= 150,
    effect: { type: 'click_multiplier', value: 1.5 },
  },
  neighbor_endorsements: {
    id: 'neighbor_endorsements',
    name: 'Neighbor Endorsements',
    description: 'Trusted locals vouch for you at every door.',
    cost: 600,
    unlockCondition: (s) => s.totalSupportersEarned >= 350,
    effect: { type: 'click_chance', value: 0.15 },
  },
  community_trust: {
    id: 'community_trust',
    name: 'Community Trust',
    description: 'You\'re a known face in every neighborhood.',
    cost: 2500,
    unlockCondition: (s) => s.totalSupportersEarned >= 800,
    effect: { type: 'click_multiplier', value: 1.5 },
  },
  campaign_slogan: {
    id: 'campaign_slogan',
    name: 'Campaign Slogan',
    description: 'A catchy phrase worth a thousand knocks.',
    cost: 8000,
    unlockCondition: (s) => s.totalSupportersEarned >= 2500,
    effect: { type: 'click_multiplier', value: 1.5 },
  },
  grassroots_surge: {
    id: 'grassroots_surge',
    name: 'Grassroots Surge',
    description: 'Momentum is building. Every knock draws a crowd.',
    cost: 40000,
    unlockCondition: (s) => s.totalSupportersEarned >= 6000,
    effect: { type: 'click_multiplier', value: 1.3 },
  },
  viral_moment: {
    id: 'viral_moment',
    name: 'Viral Moment',
    description: 'One clip makes the rounds.',
    cost: 120000,
    unlockCondition: (s) => s.totalSupportersEarned >= 20000,
    effect: { type: 'click_multiplier', value: 1.5 },
  },
  stump_circuit: {
    id: 'stump_circuit',
    name: 'Stump Circuit',
    description: 'You\'re everywhere at once — every crowd becomes a convert.',
    cost: 3000000,
    unlockCondition: (s) => s.elections.state_legislature.won,
    effect: { type: 'click_multiplier', value: 2 },
  },
  debate_coach: {
    id: 'debate_coach',
    name: 'Debate Coach',
    description: 'A world-class coach sharpens every word you deliver.',
    cost: 60000000,
    unlockCondition: (s) => s.elections.governor.won,
    effect: { type: 'click_multiplier', value: 2 },
  },
  celebrity_endorsements: {
    id: 'celebrity_endorsements',
    name: 'Celebrity Endorsements',
    description: 'Star power turns casual observers into believers.',
    cost: 500000000,
    unlockCondition: (s) => s.elections.senate.won,
    effect: { type: 'click_multiplier', value: 3 },
  },

  // ── Volunteer upgrades ───────────────────────────────────────────────
  volunteer_shirts: {
    id: 'volunteer_shirts',
    name: 'Campaign T-Shirts',
    description: 'Walking billboards for the campaign.',
    cost: 1500,
    unlockCondition: (s) => s.buildings.volunteer.count >= 10,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'volunteer' },
  },
  neighborhood_captains: {
    id: 'neighborhood_captains',
    name: 'Neighborhood Captains',
    description: 'Organized local leads who keep the ground game running.',
    cost: 25000,
    unlockCondition: (s) => s.buildings.volunteer.count >= 30,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'volunteer' },
  },
  volunteer_coordination_app: {
    id: 'volunteer_coordination_app',
    name: 'Volunteer Coordination App',
    description: 'A scheduling app turns scattered volunteers into a unified machine — boosting all outreach.',
    cost: 200000,
    unlockCondition: (s) => s.buildings.volunteer.count >= 75,
    effect: { type: 'all_production', value: 1.5 },
  },
  volunteer_ground_game: {
    id: 'volunteer_ground_game',
    name: 'Ground Game HQ',
    description: 'A war room dedicated to volunteer operations supercharges every arm of the campaign.',
    cost: 2000000,
    unlockCondition: (s) => s.buildings.volunteer.count >= 150,
    effect: { type: 'all_production', value: 2 },
  },

  // ── Door knocker upgrades ─────────────────────────────────────────────
  persuasion_training: {
    id: 'persuasion_training',
    name: 'Persuasion Training',
    description: 'Trained canvassers who close twice as many doors.',
    cost: 400,
    unlockCondition: (s) => s.buildings.door_knocker.count >= 1,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'door_knocker' },
  },
  voter_data: {
    id: 'voter_data',
    name: 'Voter Data Lists',
    description: 'Target likely supporters with precision outreach.',
    cost: 3000,
    unlockCondition: (s) => s.buildings.door_knocker.count >= 5,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'door_knocker' },
  },
  canvassing_app: {
    id: 'canvassing_app',
    name: 'Canvassing App',
    description: 'GPS-optimized routes for every canvasser.',
    cost: 20000,
    unlockCondition: (s) => s.buildings.door_knocker.count >= 15,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'door_knocker' },
  },

  // ── Phone bank upgrades ───────────────────────────────────────────────
  better_scripts: {
    id: 'better_scripts',
    name: 'Better Scripts',
    description: 'A tested script that converts more calls.',
    cost: 4000,
    unlockCondition: (s) => s.buildings.phone_bank.count >= 1,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'phone_bank' },
  },
  robocall: {
    id: 'robocall',
    name: 'Robocall System',
    description: 'Automated calls that scale your reach overnight.',
    cost: 30000,
    unlockCondition: (s) => s.buildings.phone_bank.count >= 10,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'phone_bank' },
  },

  // ── Donation / cash upgrades ─────────────────────────────────────────
  grassroots_fundraising: {
    id: 'grassroots_fundraising',
    name: 'Grassroots Fundraising',
    description: 'Ask supporters to give $5 — small dollars add up.',
    cost: 200,
    unlockCondition: (s) => s.totalSupportersEarned >= 200,
    effect: { type: 'cash_rate', value: 1.3 },
  },
  recurring_donors: {
    id: 'recurring_donors',
    name: 'Recurring Donors',
    description: 'Monthly pledge drives that keep the money flowing.',
    cost: 8000,
    unlockCondition: (s) => s.totalCashEarned >= 1000,
    effect: { type: 'cash_rate', value: 1.5 },
  },
  bundlers: {
    id: 'bundlers',
    name: 'Bundlers',
    description: 'High-rollers pooling contributions from their networks.',
    cost: 100000,
    unlockCondition: (s) => s.totalCashEarned >= 20000 && s.elections.city_council.won,
    effect: { type: 'cash_rate', value: 2 },
  },

  // ── Global production ─────────────────────────────────────────────────
  grassroots_energy: {
    id: 'grassroots_energy',
    name: 'Grassroots Energy',
    description: 'The movement has momentum — everyone feels it.',
    cost: 20000,
    unlockCondition: (s) => s.totalSupportersEarned >= 5000,
    effect: { type: 'all_production', value: 1.2 },
  },
  election_momentum: {
    id: 'election_momentum',
    name: 'Election Momentum',
    description: 'Polls show you winning — and supporters can feel it.',
    cost: 200000,
    unlockCondition: (s) => s.elections.mayor.won,
    effect: { type: 'all_production', value: 1.2 },
  },
  national_attention: {
    id: 'national_attention',
    name: 'National Attention',
    description: 'You\'re on the news — and everyone wants a piece.',
    cost: 2500000,
    unlockCondition: (s) => s.elections.mayor.won,
    effect: { type: 'all_production', value: 1.2 },
  },
  state_machine: {
    id: 'state_machine',
    name: 'State Machine',
    description: 'A disciplined statewide operation running on all cylinders.',
    cost: 25000000,
    unlockCondition: (s) => s.elections.state_legislature.won,
    effect: { type: 'all_production', value: 1.3 },
  },
  gubernatorial_wave: {
    id: 'gubernatorial_wave',
    name: 'Gubernatorial Wave',
    description: 'The whole state is watching — and joining.',
    cost: 200000000,
    unlockCondition: (s) => s.elections.governor.won,
    effect: { type: 'all_production', value: 1.3 },
  },
  national_movement: {
    id: 'national_movement',
    name: 'National Movement',
    description: 'This isn\'t a campaign anymore. It\'s a movement.',
    cost: 2000000000,
    unlockCondition: (s) => s.elections.senate.won,
    effect: { type: 'all_production', value: 1.5 },
  },

  // ── Fundraise upgrades ────────────────────────────────────────────────
  donor_network: {
    id: 'donor_network',
    name: 'Donor Network',
    description: 'Established relationships with major donors.',
    cost: 10000,
    unlockCondition: (s) => s.elections.city_council.won,
    effect: { type: 'fundraise_multiplier', value: 2 },
  },
  bundled_giving: {
    id: 'bundled_giving',
    name: 'Bundled Giving',
    description: 'Bundlers pool contributions from their entire networks.',
    cost: 300000,
    unlockCondition: (s) => s.elections.mayor.won,
    effect: { type: 'fundraise_multiplier', value: 2 },
  },
  senate_war_chest: {
    id: 'senate_war_chest',
    name: 'Senate War Chest',
    description: 'Massive reserves that draw even bigger donors.',
    cost: 100000000,
    unlockCondition: (s) => s.elections.governor.won,
    effect: { type: 'fundraise_multiplier', value: 2 },
  },
  billionaire_network: {
    id: 'billionaire_network',
    name: 'Billionaire Network',
    description: 'Silicon Valley and Wall Street are all in.',
    cost: 2500000000,
    unlockCondition: (s) => s.elections.senate.won,
    effect: { type: 'fundraise_multiplier', value: 3 },
  },

  // ── Fundraise chance upgrades ─────────────────────────────────────────
  fundraise_connections: {
    id: 'fundraise_connections',
    name: 'Fundraising Connections',
    description: 'Your network knows who to call.',
    cost: 50000,
    unlockCondition: (s) => s.elections.city_council.won,
    effect: { type: 'fundraise_chance', value: 0.2 },
  },
  fundraise_events: {
    id: 'fundraise_events',
    name: 'Gala Circuit',
    description: 'High-end events attract reliable donors.',
    cost: 500000,
    unlockCondition: (s) => s.elections.mayor.won,
    effect: { type: 'fundraise_chance', value: 0.25 },
  },

  // ── Field office upgrades ─────────────────────────────────────────────
  field_office_ops: {
    id: 'field_office_ops',
    name: 'Field Office Operations',
    description: 'Optimized staffing and scheduling across every office.',
    cost: 1500000,
    unlockCondition: (s) => s.buildings.field_office.count >= 3,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'field_office' },
  },
  regional_directors: {
    id: 'regional_directors',
    name: 'Regional Directors',
    description: 'Senior organizers who supercharge every regional hub.',
    cost: 40000000,
    unlockCondition: (s) => s.buildings.field_office.count >= 10,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'field_office' },
  },

  // ── Campaign bus upgrades ─────────────────────────────────────────────
  chartered_fleet: {
    id: 'chartered_fleet',
    name: 'Chartered Fleet',
    description: 'A full coach fleet covers the whole state in a day.',
    cost: 8000000,
    unlockCondition: (s) => s.buildings.campaign_bus.count >= 3,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'campaign_bus' },
  },

  // ── Media team upgrades ───────────────────────────────────────────────
  cable_buys: {
    id: 'cable_buys',
    name: 'Cable Ad Buys',
    description: 'Saturating local markets with your message.',
    cost: 50000000,
    unlockCondition: (s) => s.buildings.media_team.count >= 3,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'media_team' },
  },
  network_prime_time: {
    id: 'network_prime_time',
    name: 'Network Prime Time',
    description: 'National airtime during peak viewing hours.',
    cost: 800000000,
    unlockCondition: (s) => s.buildings.media_team.count >= 8,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'media_team' },
  },

  // ── Super PAC upgrades ────────────────────────────────────────────────
  dark_money: {
    id: 'dark_money',
    name: 'Dark Money Channels',
    description: 'Unlimited outside spending through non-profit vehicles.',
    cost: 400000000,
    unlockCondition: (s) => s.buildings.super_pac.count >= 3,
    effect: { type: 'building_multiplier', value: 2, targetBuilding: 'super_pac' },
  },

  // ── Cash rate upgrades ────────────────────────────────────────────────
  digital_fundraising: {
    id: 'digital_fundraising',
    name: 'Digital Fundraising',
    description: 'Online donation portals that never sleep.',
    cost: 5000000,
    unlockCondition: (s) => s.elections.state_legislature.won,
    effect: { type: 'cash_rate', value: 1.3 },
  },
  small_dollar_surge: {
    id: 'small_dollar_surge',
    name: 'Small Dollar Surge',
    description: 'Millions of $5 donations flooding in after a viral moment.',
    cost: 500000000,
    unlockCondition: (s) => s.elections.governor.won,
    effect: { type: 'cash_rate', value: 1.5 },
  },

  // ── Court Interest Group upgrades ─────────────────────────────────────
  policy_positioning: {
    id: 'policy_positioning',
    name: 'Policy Positioning',
    description: 'Strategic policy stances that attract organized groups.',
    cost: 60000,
    unlockCondition: (s) => s.elections.mayor.won,
    effect: { type: 'court_chance', value: 0.05 },
  },
  coalition_building: {
    id: 'coalition_building',
    name: 'Coalition Building',
    description: 'A broad coalition that multiplies interest group reach.',
    cost: 800000,
    unlockCondition: (s) => s.elections.state_legislature.won,
    effect: { type: 'court_multiplier', value: 2 },
  },
  oppo_research: {
    id: 'oppo_research',
    name: 'Opposition Research',
    description: 'Leverage your opponents\' records to court interest groups.',
    cost: 20000000,
    unlockCondition: (s) => s.elections.governor.won,
    effect: { type: 'court_chance', value: 0.08 },
  },
  senate_arm_twisting: {
    id: 'senate_arm_twisting',
    name: 'Senate Arm-Twisting',
    description: 'You know where every group\'s bread is buttered.',
    cost: 300000000,
    unlockCondition: (s) => s.elections.senate.won,
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
