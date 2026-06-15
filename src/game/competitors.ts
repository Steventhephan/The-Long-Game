import type { Competitor, ElectionTier } from './types'
import { ELECTION_DAYS_BY_TIER } from './constants'

const FIRST_NAMES = [
  'Chester', 'Biff', 'Wendell', 'Cornelius', 'Reginald', 'Barnaby', 'Montgomery',
  'Thaddeus', 'Archibald', 'Mortimer', 'Horatio', 'Percival', 'Phineas', 'Wellington',
  'Sylvester', 'Beauregard', 'Ignatius', 'Humphrey', 'Millicent', 'Prudence',
  'Mildred', 'Gertrude', 'Arabella', 'Lavinia', 'Eugenia', 'Dorothea', 'Aldous',
]

const LAST_NAMES = [
  'Wigglesworth', 'Bumbleworth', 'Snodgrass', 'Shufflebottom', 'Puddington',
  'Gobsmack', 'Noodleman', 'Blunderbuss', 'Crumplehorn', 'Tootlewick',
  'Drizzleback', 'Fiddlebottom', 'Squiggleston', 'Muffintop', 'Whimple',
  'Snickerdoodle', 'Balderdash', 'Crankshaw', 'Doodleburg', 'Flibbertigibbet',
  'Ramshackle', 'Tweedleton', 'Bumblethwaite', 'Splodge', 'Wonksworth',
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function randomName(usedNames: Set<string>): string {
  let name: string
  let attempts = 0
  do {
    name = `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`
    attempts++
  } while (usedNames.has(name) && attempts < 50)
  usedNames.add(name)
  return name
}

// How many opponents face the player per election
export const COMPETITORS_PER_TIER: Record<ElectionTier, number> = {
  city_council: 1,
  mayor: 1,
  state_legislature: 2,
  governor: 3,
  senate: 4,
  president: 5,
}

// Target fraction of the threshold each competitor aims to reach by election day
// Lead competitor targets 90% — a real threat; others taper down
const TARGET_FRACTIONS = [0.90, 0.75, 0.62, 0.50, 0.42]

// Fraction of the threshold competitors start with at each tier (simulating established profiles)
const HEAD_START_FRACTION: Record<ElectionTier, number> = {
  city_council: 0,
  mayor: 0.08,
  state_legislature: 0.15,
  governor: 0.20,
  senate: 0.25,
  president: 0.30,
}

export function generateCompetitors(tier: ElectionTier, supportersRequired: number): Competitor[] {
  const count = COMPETITORS_PER_TIER[tier]
  const usedNames = new Set<string>()
  const electionDays = ELECTION_DAYS_BY_TIER[tier] ?? 365
  const totalSeconds = electionDays * 10  // 1 in-game day = 10 real seconds
  const headStart = Math.floor(supportersRequired * HEAD_START_FRACTION[tier])

  return Array.from({ length: count }, (_, i) => {
    const fraction = TARGET_FRACTIONS[i] ?? 0.40
    const targetSupporters = supportersRequired * fraction
    const baseRate = targetSupporters / totalSeconds
    return {
      id: `competitor_${i}`,
      name: randomName(usedNames),
      supporters: headStart,
      supportersPerSecond: baseRate * 0.5,  // starts at 50%, accelerates to 200% by end
      baseRate,
    }
  })
}
