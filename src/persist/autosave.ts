import type { GameState } from '../types';
import { SAVE_VERSION, defaultState } from '../state/gameState';
import { getOffice } from '../config/offices';

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
      isPaused: false,
      pendingMinigame: state.pendingMinigame,  // preserve so modal re-shows on reload
      activeEvent: null,                        // don't save mid-dilemma; re-trigger on load
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
  let version = raw.version ?? 0;

  if (version < 1) {
    // v0 → v1: no old saves exist; return defaults.
    return defaultState();
  }

  if (version < 2) {
    // v1 → v2: rivalRate added.
    const officeIndex = (raw.officeIndex ?? 0);
    const phase = (raw.phase ?? 'primary') as 'primary' | 'general';
    try {
      const o = getOffice(officeIndex);
      raw = { ...raw, rivalRate: phase === 'primary' ? o.rivalRatePrimary : o.rivalRateGeneral };
    } catch {
      raw = { ...raw, rivalRate: 18 };
    }
    version = 2;
  }

  if (version < 3) {
    if (!raw.platform || Object.keys(raw.platform).length === 0) {
      raw = { ...raw, platform: {} };
    }
    raw = {
      ...raw,
      flipFlopCounts: raw.flipFlopCounts ?? {},
      ideologyId: raw.ideologyId ?? 'moderate',
    };
    version = 3;
  }

  if (version < 4) {
    // v3 → v4: 5-stance platform (map old L/C/R → CL/C/CR), trust multipliers, isPaused.
    const stanceMap: Record<string, string> = {
      left: 'center_left', center: 'center', right: 'center_right',
    };
    const oldPlatform = raw.platform ?? {};
    const newPlatform: Record<string, string> = {};
    for (const [k, v] of Object.entries(oldPlatform)) {
      newPlatform[k] = stanceMap[v as string] ?? 'center';
    }
    raw = {
      ...raw,
      platform: newPlatform,
      flipFlopTrustMultipliers: raw.flipFlopTrustMultipliers ?? {},
      isPaused: false,
    };
    version = 4;
  }

  if (version < 5) {
    // v4 → v5: run history, run number, highestOfficeCompleted.
    raw = {
      ...raw,
      runHistory: (raw as any).runHistory ?? [],
      runNumber: (raw as any).runNumber ?? 1,
      highestOfficeCompleted: (raw as any).highestOfficeCompleted ?? -1,
    };
    version = 5;
  }

  if (version < 6) {
    // v5 → v6: minigames, abilities, events, volunteers (all defaults; run-level fields reset safely).
    // Also patch existing RivalState objects with new archetype fields.
    const patchedRivals = ((raw as any).rivals ?? []).map((r: any) => ({
      name: r.name ?? r.archetypeId ?? 'Opponent',
      conversionMod: r.conversionMod ?? 1.0,
      strongBlocs: r.strongBlocs ?? [],
      weakBlocs: r.weakBlocs ?? [],
      ...r,
    }));
    raw = {
      ...raw,
      rivals: patchedRivals,
      pendingMinigame: null,
      minigameCooldowns: {},
      abilityCooldowns: {},
      activeEvent: null,
      eventModifiers: [],
      eventCooldown: 0,
    };
    version = 6;
  }

  // Merge with defaults so any future new fields get safe initial values.
  const defaults = defaultState();
  const merged: GameState = { ...defaults, ...raw, version: SAVE_VERSION };

  // Sanitize transient fields so a mid-election save doesn't soft-lock.
  if (merged.electionResult !== 'none') {
    merged.electionResult = 'none';
    merged.timerRemaining = Math.max(merged.timerRemaining, 1);
  }
  // Re-pause if a minigame is queued (isPaused was cleared on save).
  if (merged.pendingMinigame !== null) {
    merged.isPaused = true;
  }

  // Patch any rivals that are missing Phase 5 archetype fields.
  // This can happen if a v6 save was written during HMR before initElection was updated.
  merged.rivals = merged.rivals.map((r: any) => ({
    name: r.name ?? r.archetypeId ?? 'Opponent',
    conversionMod: r.conversionMod ?? 1.0,
    strongBlocs: r.strongBlocs ?? [],
    weakBlocs: r.weakBlocs ?? [],
    ...r,
  }));

  // Ensure Phase 5 cooldown/modifier fields are never undefined.
  if (!Array.isArray(merged.eventModifiers))    merged.eventModifiers    = [];
  if (typeof merged.eventCooldown !== 'number') merged.eventCooldown     = 0;
  if (typeof merged.abilityCooldowns  !== 'object' || merged.abilityCooldowns  === null) merged.abilityCooldowns  = {};
  if (typeof merged.minigameCooldowns !== 'object' || merged.minigameCooldowns === null) merged.minigameCooldowns = {};

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
