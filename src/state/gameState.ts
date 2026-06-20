import type { GameState } from '../types';
import { CITY_COUNCIL_BLOCS } from '../config/blocs';
import { CITY_COUNCIL_RIVALS } from '../config/rivals';
import { BAL } from '../config/balance';
import { getOffice, MAX_OFFICE_INDEX } from '../config/offices';
import { initElection } from '../sim/election';

export const SAVE_VERSION = 2;

// Phase 2: all offices use the same 2 blocs. Phase 3 will introduce per-office bloc sets.
function blocsForOffice(_officeIndex: number) {
  return CITY_COUNCIL_BLOCS;
}

function rivalsForOffice(_officeIndex: number) {
  return CITY_COUNCIL_RIVALS;
}

function officeRivalRate(officeIndex: number, phase: 'primary' | 'general'): number {
  const o = getOffice(officeIndex);
  return phase === 'primary' ? o.rivalRatePrimary : o.rivalRateGeneral;
}

function freshRunState(): GameState {
  const office = getOffice(0);
  const skeleton: GameState = {
    version: SAVE_VERSION,
    rngSeed: (Date.now() & 0x7fffffff),

    cash: 0,
    voters: 0,
    generators: {},
    upgrades: [],
    charisma: 0,
    volunteers: 0,
    platform: {},
    blocSupport: Object.fromEntries(
      CITY_COUNCIL_BLOCS.map(b => [b.groupId, 1.0])
    ),
    officeIndex: 0,
    rivalRate: office.rivalRatePrimary,
    phase: 'primary',
    timerRemaining: BAL.generalTimerBase * BAL.primaryTimerRatio,
    isRunoff: false,
    blocs: [],
    rivals: [],

    prestige: 0,
    perks: [],
    achievements: [],
    globalMultiplier: 1,

    lastCritHit: false,
    electionResult: 'none',
  };

  return initElection(
    skeleton, 0, 'primary',
    blocsForOffice(0), rivalsForOffice(0),
    office.rivalRatePrimary,
  );
}

export function defaultState(): GameState {
  return freshRunState();
}

/** Called on a run loss: bank prestige, reset run, keep meta. */
export function resetRun(state: GameState): GameState {
  const electionsBanked = state.officeIndex * 2 + (state.phase === 'general' ? 1 : 0);
  let newPrestige = state.prestige;
  for (let i = 0; i < electionsBanked; i++) {
    newPrestige += BAL.officeWeight(Math.floor(i / 2));
  }

  const office = getOffice(0);
  const fresh: GameState = {
    ...defaultState(),
    prestige: newPrestige,
    perks: state.perks,
    achievements: state.achievements,
    globalMultiplier: state.globalMultiplier,
    rngSeed: (state.rngSeed + 1) | 0,
  };

  return initElection(
    fresh, 0, 'primary',
    blocsForOffice(0), rivalsForOffice(0),
    office.rivalRatePrimary,
  );
}

/** Called on a win: advance phase or office. */
export function advanceElection(state: GameState): GameState {
  const nextPhase: 'primary' | 'general' =
    state.phase === 'primary' ? 'general' : 'primary';
  const nextOffice = state.phase === 'general' ? state.officeIndex + 1 : state.officeIndex;

  // Won the Presidency — game complete, start a new dynasty.
  if (nextOffice > MAX_OFFICE_INDEX) {
    return resetRun(state);
  }

  return initElection(
    { ...state, officeIndex: nextOffice, phase: nextPhase, electionResult: 'none' },
    nextOffice,
    nextPhase,
    blocsForOffice(nextOffice),
    rivalsForOffice(nextOffice),
    officeRivalRate(nextOffice, nextPhase),
  );
}
