import type { MinigameId } from './types'

export interface CharismaLevelDef {
  name: string
  description: string   // what this level means for the player
  stat: number          // multiplier on BASE_VOLUNTEER_RECRUIT_RATE
  req: {
    totalSupporters: number
    debates: number
    tvAds: number
    stumpSpeeches: number
    fundraisers: number
  }
}

export const CHARISMA_LEVELS: CharismaLevelDef[] = [
  {
    name: 'Tone-Deaf',
    description: 'Voters avoid eye contact at the door. Keep knocking to build your presence.',
    stat: 1,
    // Achievable mid-city_council race from clicking alone
    req: { totalSupporters: 200, debates: 0, tvAds: 0, stumpSpeeches: 0, fundraisers: 0 },
  },
  {
    name: 'Stiff',
    description: 'At least people stop to listen. You recruit volunteers 4x faster than before.',
    stat: 4,
    // Requires TV ads — unlocked after winning city council
    req: { totalSupporters: 600, debates: 0, tvAds: 2, stumpSpeeches: 0, fundraisers: 0 },
  },
  {
    name: 'Rehearsed',
    description: 'Your message lands more often than not. You recruit volunteers 2.5x faster than Stiff.',
    stat: 10,
    // Mid-mayor race: more TV ads + first debate
    req: { totalSupporters: 3000, debates: 1, tvAds: 5, stumpSpeeches: 0, fundraisers: 0 },
  },
  {
    name: 'Polished',
    description: 'Voters remember you after you leave. You recruit volunteers 2.5x faster than Rehearsed.',
    stat: 25,
    // State legislature race: debates and stump speeches
    req: { totalSupporters: 15000, debates: 3, tvAds: 10, stumpSpeeches: 2, fundraisers: 0 },
  },
  {
    name: 'Relatable',
    description: 'People feel like you truly get them. You recruit volunteers 2.4x faster than Polished.',
    stat: 60,
    req: { totalSupporters: 80000, debates: 6, tvAds: 18, stumpSpeeches: 6, fundraisers: 2 },
  },
  {
    name: 'Inspiring',
    description: 'Your speeches move people to action. You recruit volunteers 2.5x faster than Relatable.',
    stat: 150,
    req: { totalSupporters: 400000, debates: 10, tvAds: 30, stumpSpeeches: 12, fundraisers: 5 },
  },
  {
    name: 'Electrifying',
    description: 'Crowds form wherever you speak. You recruit volunteers 2.7x faster than Inspiring.',
    stat: 400,
    req: { totalSupporters: 2000000, debates: 18, tvAds: 50, stumpSpeeches: 22, fundraisers: 10 },
  },
  {
    name: 'Movement-Builder',
    description: 'You\'ve built something bigger than a campaign. You recruit volunteers 2.25x faster than Electrifying.',
    stat: 900,
    req: { totalSupporters: 10000000, debates: 28, tvAds: 75, stumpSpeeches: 38, fundraisers: 18 },
  },
  {
    name: 'Kingmaker',
    description: 'Your endorsement decides elections. You recruit volunteers 2.2x faster than Movement-Builder.',
    stat: 2000,
    req: { totalSupporters: 50000000, debates: 42, tvAds: 110, stumpSpeeches: 60, fundraisers: 30 },
  },
  {
    name: 'Historic',
    description: 'A once-in-a-generation force. You recruit volunteers 2.5x faster than Kingmaker — the movement runs itself.',
    stat: 5000,
    req: { totalSupporters: Infinity, debates: Infinity, tvAds: Infinity, stumpSpeeches: Infinity, fundraisers: Infinity },
  },
]

export function canLevelUpCharisma(
  currentLevel: number,
  totalSupportersEarned: number,
  completions: Record<MinigameId, number>
): boolean {
  if (currentLevel >= CHARISMA_LEVELS.length - 1) return false
  const req = CHARISMA_LEVELS[currentLevel]!.req
  return (
    totalSupportersEarned >= req.totalSupporters &&
    (completions.debate ?? 0) >= req.debates &&
    (completions.tv_ad ?? 0) >= req.tvAds &&
    (completions.stump_speech ?? 0) >= req.stumpSpeeches &&
    (completions.fundraiser ?? 0) >= req.fundraisers
  )
}
