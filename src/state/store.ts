import { writable, derived } from 'svelte/store';
import type { GameState } from '../types';
import { defaultState } from './gameState';
import { loadSave } from '../persist/autosave';
import { playerPct, totalPool } from '../sim/election';

function createGameStore() {
  const { subscribe, set, update } = writable<GameState>(defaultState());

  return {
    subscribe,
    set,
    update,
    reset: (state: GameState) => set(state),
  };
}

export const gameStore = createGameStore();

// Derived display values — recomputed reactively, no extra subscriptions needed.
export const displayPct = derived(gameStore, $s =>
  (playerPct($s) * 100).toFixed(1) + '%'
);

// Thematic timer: 1 second = 1 campaign day.
export const displayTimer = derived(gameStore, $s => {
  const days = Math.ceil(Math.max(0, $s.timerRemaining));
  if ($s.isRunoff) return days <= 1 ? 'Final day!' : `${days} days`;
  if (days <= 0) return 'Election Day!';
  return `${days} days`;
});

export const displayTimerLabel = derived(gameStore, $s => {
  if ($s.isRunoff) return 'Runoff';
  return 'Days to Election';
});

export const displayCash = derived(gameStore, $s => formatNum($s.cash));

export const displayPool = derived(gameStore, $s => formatNum(totalPool($s)));

export const displayVoters = derived(gameStore, $s => Math.floor($s.voters));

// K/M/B suffix formatter — reused across UI.
export function formatNum(n: number): string {
  if (n < 1000) return Math.floor(n).toString();
  if (n < 1_000_000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  if (n < 1_000_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
}

// Initialize store from saved state on first load.
export function initStore(): void {
  const saved = loadSave();
  if (saved) gameStore.set(saved);
}
