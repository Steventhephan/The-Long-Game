import type { GameState, RunHistoryEntry } from '../types';
import { INTEREST_GROUPS } from '../config/blocs';
import { CITY_COUNCIL_RIVALS } from '../config/rivals';
import { ISSUES } from '../config/issues';
import { BAL } from '../config/balance';
import { getOffice, MAX_OFFICE_INDEX } from '../config/offices';
import { PERKS } from '../config/perks';
import { initElection, playerPct } from '../sim/election';
import { computeAllBlocSupport, computePosition, eraForOffice, getIdeology } from '../sim/platform';
import { computePerkEffects, computePrestigeGain, checkAchievements, officeName } from '../sim/prestige';

export const SAVE_VERSION = 5; // Phase 4: prestige perks, run history, highestOfficeCompleted

function officeRivalRate(officeIndex: number, phase: 'primary' | 'general'): number {
  const o = getOffice(officeIndex);
  return phase === 'primary' ? o.rivalRatePrimary : o.rivalRateGeneral;
}

/** Default platform: all issues set to center (first promise is always free). */
function defaultPlatform(): Record<string, string> {
  return Object.fromEntries(ISSUES.map(i => [i.id, 'center']));
}

function freshRunState(meta: Pick<GameState,
  'prestige' | 'perks' | 'achievements' | 'globalMultiplier' |
  'runHistory' | 'runNumber' | 'highestOfficeCompleted' |
  'platform' | 'flipFlopCounts' | 'flipFlopTrustMultipliers' | 'ideologyId' | 'blocSupport' |
  'rngSeed'
>): GameState {
  const officeIndex = 0;
  const startPhase = 'primary' as const;

  const skeleton: GameState = {
    version: SAVE_VERSION,
    rngSeed: meta.rngSeed,

    cash: 0,
    voters: 0,
    generators: {},
    upgrades: [],
    charisma: 0,
    volunteers: 0,
    platform: meta.platform,
    flipFlopCounts: meta.flipFlopCounts,
    flipFlopTrustMultipliers: meta.flipFlopTrustMultipliers,
    ideologyId: meta.ideologyId,
    blocSupport: meta.blocSupport,
    officeIndex,
    rivalRate: getOffice(officeIndex).rivalRatePrimary,
    phase: startPhase,
    timerRemaining: BAL.generalTimerBase * BAL.primaryTimerRatio,
    isRunoff: false,
    blocs: [],
    rivals: [],

    prestige: meta.prestige,
    perks: meta.perks,
    achievements: meta.achievements,
    globalMultiplier: meta.globalMultiplier,
    runHistory: meta.runHistory,
    runNumber: meta.runNumber,
    highestOfficeCompleted: meta.highestOfficeCompleted,

    lastCritHit: false,
    isPaused: false,
    electionResult: 'none',
  };

  // Apply Head Start seed cash from perks.
  const perkEffects = computePerkEffects(skeleton);
  skeleton.cash = perkEffects.headStartCash;

  return initElection(
    skeleton, officeIndex, startPhase,
    INTEREST_GROUPS, CITY_COUNCIL_RIVALS,
    officeRivalRate(officeIndex, startPhase),
  );
}

export function defaultState(): GameState {
  const officeIndex = 0;
  const platform = defaultPlatform();
  const trustMultipliers: Record<string, number> = {};
  const era = eraForOffice(officeIndex);
  const blocSupport = computeAllBlocSupport(platform, trustMultipliers, INTEREST_GROUPS, era);
  const position = computePosition(platform, era);
  const ideology = getIdeology(position);

  return freshRunState({
    prestige: 0,
    perks: [],
    achievements: [],
    globalMultiplier: 1,
    runHistory: [],
    runNumber: 1,
    highestOfficeCompleted: -1,
    platform,
    flipFlopCounts: {},
    flipFlopTrustMultipliers: trustMultipliers,
    ideologyId: ideology.id,
    blocSupport,
    rngSeed: (Date.now() & 0x7fffffff),
  });
}

/**
 * Called when a run ends (loss or presidential victory).
 * isVictory=true when the player just won the presidency general.
 */
export function resetRun(state: GameState, isVictory = false): GameState {
  const prestigeGain = computePrestigeGain(state, isVictory);
  const newPrestige = state.prestige + prestigeGain;

  // Record this run in history.
  const electionsWon = state.officeIndex * 2
    + (state.phase === 'general' ? 1 : 0)
    + (isVictory ? 1 : 0);
  const entry: RunHistoryEntry = {
    runNumber: state.runNumber ?? 1,
    officeName: officeName(state.officeIndex),
    electionsWon,
    prestigeEarned: prestigeGain,
    outcome: isVictory ? 'victory' : 'loss',
  };

  // Update highestOfficeCompleted for Fast-Forward.
  const newHighest = isVictory
    ? Math.max(state.highestOfficeCompleted ?? -1, state.officeIndex)
    : (state.highestOfficeCompleted ?? -1);

  // Check achievements: dynasty_begins on first reset, and electionWin for presidential victory.
  const newAchievements = [...state.achievements];
  const resetAchieves = checkAchievements(state, 'runReset');
  for (const a of resetAchieves) {
    if (!newAchievements.includes(a)) newAchievements.push(a);
  }
  if (isVictory) {
    const winAchieves = checkAchievements(state, 'electionWin', {
      playerPct: 1.0, electionsThisRun: electionsWon, isVictory: true,
    });
    for (const a of winAchieves) {
      if (!newAchievements.includes(a)) newAchievements.push(a);
    }
  }

  // Platform carries over across runs (dynasty continuity).
  const era = eraForOffice(0);
  const newBlocSupport = computeAllBlocSupport(
    state.platform, state.flipFlopTrustMultipliers, INTEREST_GROUPS, era,
  );
  const position = computePosition(state.platform, era);
  const ideology = getIdeology(position);

  // Update globalMultiplier from Kingmaker perk (additive to base 1.0).
  let globalMultiplier = 1.0;
  if (state.perks.includes('kingmaker')) globalMultiplier += 1.0;

  return freshRunState({
    prestige: newPrestige,
    perks: state.perks,
    achievements: newAchievements,
    globalMultiplier,
    runHistory: [...(state.runHistory ?? []), entry],
    runNumber: (state.runNumber ?? 1) + 1,
    highestOfficeCompleted: newHighest,
    platform: state.platform,
    flipFlopCounts: state.flipFlopCounts,
    flipFlopTrustMultipliers: state.flipFlopTrustMultipliers,
    ideologyId: ideology.id,
    blocSupport: newBlocSupport,
    rngSeed: (state.rngSeed + 1) | 0,
  });
}

export function advanceElection(state: GameState): GameState {
  const nextPhase: 'primary' | 'general' =
    state.phase === 'primary' ? 'general' : 'primary';
  const nextOffice = state.phase === 'general' ? state.officeIndex + 1 : state.officeIndex;

  if (nextOffice > MAX_OFFICE_INDEX) return resetRun(state, true);

  // Track highest office with completed general.
  const highestOfficeCompleted = state.phase === 'general'
    ? Math.max(state.highestOfficeCompleted ?? -1, state.officeIndex)
    : (state.highestOfficeCompleted ?? -1);

  const era = eraForOffice(nextOffice);
  const newBlocSupport = computeAllBlocSupport(
    state.platform, state.flipFlopTrustMultipliers, INTEREST_GROUPS, era
  );
  const position = computePosition(state.platform, era);
  const ideology = getIdeology(position);

  // Check election-win achievements.
  const electionsThisRun = nextOffice * 2 + (nextPhase === 'general' ? 1 : 0);
  const pct = playerPct(state);
  const newAchieves = checkAchievements(
    { ...state, highestOfficeCompleted, achievements: state.achievements },
    'electionWin',
    { playerPct: pct, electionsThisRun, isVictory: false },
  );
  const achievements = [...state.achievements];
  for (const a of newAchieves) {
    if (!achievements.includes(a)) achievements.push(a);
  }

  return initElection(
    {
      ...state,
      officeIndex: nextOffice,
      phase: nextPhase,
      electionResult: 'none',
      isPaused: false,
      blocSupport: newBlocSupport,
      ideologyId: ideology.id,
      highestOfficeCompleted,
      achievements,
    },
    nextOffice,
    nextPhase,
    INTEREST_GROUPS,
    CITY_COUNCIL_RIVALS,
    officeRivalRate(nextOffice, nextPhase),
  );
}

/** Buy a prestige perk. Returns new state or null if prerequisites unmet or unaffordable. */
export function buyPerk(state: GameState, perkId: string): GameState | null {
  const perk = PERKS.find(p => p.id === perkId);
  if (!perk) return null;
  if (state.perks.includes(perkId)) return null;
  if (state.prestige < perk.cost) return null;
  for (const prereq of perk.prereqs) {
    if (!state.perks.includes(prereq)) return null;
  }

  const newPerks = [...state.perks, perkId];

  // Update globalMultiplier if Kingmaker was just bought.
  let globalMultiplier = state.globalMultiplier;
  if (perkId === 'kingmaker') {
    const e = perk.effect as { kind: 'kingmaker'; globalMult: number };
    globalMultiplier += e.globalMult;
  }

  const newState: GameState = {
    ...state,
    prestige: state.prestige - perk.cost,
    perks: newPerks,
    globalMultiplier,
  };

  // Check perk-bought achievements.
  const newAchieves = checkAchievements(newState, 'perkBought');
  const achievements = [...newState.achievements];
  for (const a of newAchieves) {
    if (!achievements.includes(a)) achievements.push(a);
  }

  return { ...newState, achievements };
}
