import type { GameState } from '../types';
import { INTEREST_GROUPS } from '../config/blocs';
import { CITY_COUNCIL_RIVALS } from '../config/rivals';
import { ISSUES } from '../config/issues';
import { BAL } from '../config/balance';
import { getOffice, MAX_OFFICE_INDEX } from '../config/offices';
import { initElection } from '../sim/election';
import { computeAllBlocSupport, computePosition, eraForOffice, getIdeology } from '../sim/platform';

export const SAVE_VERSION = 3; // Phase 3: platform, flipFlopCounts, ideologyId

function officeRivalRate(officeIndex: number, phase: 'primary' | 'general'): number {
  const o = getOffice(officeIndex);
  return phase === 'primary' ? o.rivalRatePrimary : o.rivalRateGeneral;
}

/** Default platform: all issues set to center. */
function defaultPlatform(): Record<string, string> {
  return Object.fromEntries(ISSUES.map(i => [i.id, 'center']));
}

function freshRunState(): GameState {
  const officeIndex = 0;
  const phase = 'primary' as const;
  const era = eraForOffice(officeIndex);
  const platform = defaultPlatform();
  const blocSupport = computeAllBlocSupport(platform, INTEREST_GROUPS, era);
  const position = computePosition(platform, era);
  const ideology = getIdeology(position);

  const skeleton: GameState = {
    version: SAVE_VERSION,
    rngSeed: (Date.now() & 0x7fffffff),

    cash: 0,
    voters: 0,
    generators: {},
    upgrades: [],
    charisma: 0,
    volunteers: 0,
    platform,
    flipFlopCounts: {},
    ideologyId: ideology.id,
    blocSupport,
    officeIndex,
    rivalRate: getOffice(officeIndex).rivalRatePrimary,
    phase,
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
    skeleton, officeIndex, phase,
    INTEREST_GROUPS, CITY_COUNCIL_RIVALS,
    officeRivalRate(officeIndex, phase),
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

  const fresh: GameState = {
    ...defaultState(),
    prestige: newPrestige,
    perks: state.perks,
    achievements: state.achievements,
    globalMultiplier: state.globalMultiplier,
    rngSeed: (state.rngSeed + 1) | 0,
    // Platform and ideology carry over (dynasty: new candidate, same family values)
    platform: state.platform,
    flipFlopCounts: state.flipFlopCounts,
    ideologyId: state.ideologyId,
    blocSupport: state.blocSupport,
  };

  return initElection(
    fresh, 0, 'primary',
    INTEREST_GROUPS, CITY_COUNCIL_RIVALS,
    officeRivalRate(0, 'primary'),
  );
}

/** Called on a win: advance phase or office. */
export function advanceElection(state: GameState): GameState {
  const nextPhase: 'primary' | 'general' =
    state.phase === 'primary' ? 'general' : 'primary';
  const nextOffice = state.phase === 'general' ? state.officeIndex + 1 : state.officeIndex;

  if (nextOffice > MAX_OFFICE_INDEX) {
    return resetRun(state);
  }

  // Recompute bloc support for the new office's era (new issues may unlock).
  const era = eraForOffice(nextOffice);
  const newBlocSupport = computeAllBlocSupport(state.platform, INTEREST_GROUPS, era);
  const position = computePosition(state.platform, era);
  const ideology = getIdeology(position);

  return initElection(
    {
      ...state,
      officeIndex: nextOffice,
      phase: nextPhase,
      electionResult: 'none',
      blocSupport: newBlocSupport,
      ideologyId: ideology.id,
    },
    nextOffice,
    nextPhase,
    INTEREST_GROUPS,
    CITY_COUNCIL_RIVALS,
    officeRivalRate(nextOffice, nextPhase),
  );
}
