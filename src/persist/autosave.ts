import type { GameState } from '../types';
import { SAVE_VERSION, defaultState } from '../state/gameState';

const SAVE_KEY = 'tlg_save_v1';
const AUTOSAVE_INTERVAL_MS = 3000;

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

export function saveGame(state: GameState): void {
  try {
    // Strip transient UI signals before persisting.
    const toSave: GameState = {
      ...state,
      lastCritHit: false,
      electionResult: state.electionResult === 'none' ? 'none' : state.electionResult,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
  } catch {
    // localStorage full or unavailable — silently ignore.
  }
}

export function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return migrate(parsed);
  } catch {
    return null;
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function exportSave(state: GameState): string {
  return btoa(JSON.stringify(state));
}

export function importSave(encoded: string): GameState | null {
  try {
    const parsed = JSON.parse(atob(encoded)) as Partial<GameState>;
    return migrate(parsed);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

function migrate(raw: Partial<GameState>): GameState {
  const version = raw.version ?? 0;

  if (version < 1) {
    // v0 → v1: no old saves exist yet; return defaults.
    return defaultState();
  }

  // Ensure all fields exist (forward-compat: new fields get defaults).
  const defaults = defaultState();
  const merged: GameState = { ...defaults, ...raw, version: SAVE_VERSION };

  // Sanitize transient fields so a mid-election save doesn't soft-lock.
  if (merged.electionResult !== 'none') {
    merged.electionResult = 'none';
    merged.timerRemaining = Math.max(merged.timerRemaining, 1);
  }

  return merged;
}

// ---------------------------------------------------------------------------
// Autosave subscription helper (called from main.ts)
// ---------------------------------------------------------------------------

let autosaveTimer: ReturnType<typeof setInterval> | null = null;

export function startAutosave(getState: () => GameState): void {
  if (autosaveTimer !== null) return;

  autosaveTimer = setInterval(() => {
    saveGame(getState());
  }, AUTOSAVE_INTERVAL_MS);

  document.addEventListener('visibilitychange', () => {
    saveGame(getState());
  });
}
