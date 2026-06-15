import type { GameState } from './types'
import { SAVE_KEY } from './constants'

export function saveGame(state: GameState): void {
  try {
    const serializable = {
      ...state,
      // Strip to only the fields that serialize cleanly
      upgrades: Object.fromEntries(
        Object.entries(state.upgrades).map(([id, u]) => [
          id,
          { id: u.id, purchased: u.purchased },
        ])
      ),
      lastSaved: Date.now(),
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(serializable))
  } catch {
    // localStorage unavailable or full
  }
}

export function loadSave(): Partial<GameState> | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    // Migrate: votes → supporters
    if ('votes' in parsed && !('supporters' in parsed)) {
      parsed.supporters = parsed.votes
      parsed.totalSupportersEarned = parsed.totalVotesEarned ?? parsed.votes
      delete parsed.votes
      delete parsed.totalVotesEarned
    }
    // Migrate: numeric charisma → charismaLevel 0
    if ('charisma' in parsed && !('charismaLevel' in parsed)) {
      parsed.charismaLevel = 0
      delete parsed.charisma
    }
    return parsed as Partial<GameState>
  } catch {
    return null
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY)
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`
  return Math.floor(n).toLocaleString()
}

export function formatCash(n: number): string {
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}$${Math.round(abs / 1_000_000)}M`
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`
  return `${sign}$${Math.round(abs).toLocaleString()}`
}

export function formatRate(n: number): string {
  if (n < 1) return n.toFixed(2)
  return formatNumber(n)
}

// Cash rate formatter — shows cents for small rates so "$0.04/s" isn't swallowed by whole-number rounding
export function formatCashRate(n: number): string {
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}$${Math.round(abs / 1_000_000)}M`
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`
  if (abs >= 1) return `${sign}$${Math.round(abs)}`
  return `${sign}$${abs.toFixed(2)}`
}
