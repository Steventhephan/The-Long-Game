import type { MilestoneState, UpgradeEffect } from './types'

export interface MilestoneDef {
  id: string
  name: string
  flavour: string       // thematic description of the event
  effectLabel: string   // human-readable effect ("All production ×1.1")
  supportersRequired: number
  effect: UpgradeEffect
}

export const MILESTONES: MilestoneDef[] = [
  {
    id: 'ms_100',
    name: 'Word of Mouth',
    flavour: 'Neighbors are talking about you. People you\'ve never met are curious.',
    effectLabel: '+5% door knock success chance',
    supportersRequired: 100,
    effect: { type: 'click_chance', value: 0.05 },
  },
  {
    id: 'ms_500',
    name: 'Local Voice',
    flavour: 'You\'re a recognizable name at town events and coffee shops.',
    effectLabel: 'All canvassing 10% more effective',
    supportersRequired: 500,
    effect: { type: 'all_production', value: 1.1 },
  },
  {
    id: 'ms_1000',
    name: 'Small Dollar Donors',
    flavour: 'Ordinary people are chipping in $5 and $10 to see you win.',
    effectLabel: 'Donation rate 1.1x',
    supportersRequired: 1000,
    effect: { type: 'cash_rate', value: 1.1 },
  },
  {
    id: 'ms_5000',
    name: 'Rising Profile',
    flavour: 'The local paper ran a front-page story. Your face is everywhere.',
    effectLabel: '+10% door knock success chance',
    supportersRequired: 5000,
    effect: { type: 'click_chance', value: 0.10 },
  },
  {
    id: 'ms_10000',
    name: 'Trusted Name',
    flavour: 'Doors open before you knock. Your canvassers are welcomed.',
    effectLabel: 'Door knockers 50% more effective',
    supportersRequired: 10000,
    effect: { type: 'building_multiplier', value: 1.5, targetBuilding: 'door_knocker' },
  },
  {
    id: 'ms_25000',
    name: 'Credible Contender',
    flavour: 'The establishment is nervous. Your coalition is serious.',
    effectLabel: 'All production +25%',
    supportersRequired: 25000,
    effect: { type: 'all_production', value: 1.25 },
  },
  {
    id: 'ms_50000',
    name: 'Major Donor Network',
    flavour: 'Bundlers are calling. The money is starting to flow.',
    effectLabel: 'Donation rate 1.4x',
    supportersRequired: 50000,
    effect: { type: 'cash_rate', value: 1.4 },
  },
  {
    id: 'ms_100000',
    name: 'Frontrunner',
    flavour: 'Every poll puts you ahead. Opponents are rattled.',
    effectLabel: 'All production +50%',
    supportersRequired: 100000,
    effect: { type: 'all_production', value: 1.5 },
  },
  {
    id: 'ms_500000',
    name: 'National Figure',
    flavour: 'Cable news calls for comment. You set the agenda.',
    effectLabel: '+15% door knock success chance',
    supportersRequired: 500000,
    effect: { type: 'click_chance', value: 0.15 },
  },
  {
    id: 'ms_1000000',
    name: 'The Movement',
    flavour: 'This is bigger than a campaign — it\'s a political movement.',
    effectLabel: 'All production 1.5x',
    supportersRequired: 1000000,
    effect: { type: 'all_production', value: 1.5 },
  },
  {
    id: 'ms_10000000',
    name: 'Historic Candidacy',
    flavour: 'Win or lose, they\'ll be writing books about this campaign.',
    effectLabel: 'All production 2x',
    supportersRequired: 10000000,
    effect: { type: 'all_production', value: 2 },
  },
]

export const MILESTONES_BY_ID: Record<string, MilestoneDef> = Object.fromEntries(
  MILESTONES.map((m) => [m.id, m])
)

export function buildInitialMilestones(): Record<string, MilestoneState> {
  return Object.fromEntries(MILESTONES.map((m) => [m.id, { id: m.id, activated: false }]))
}
