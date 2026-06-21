import type { GameState } from '../types';
import { INTEREST_GROUPS } from '../config/blocs';
import { CITY_COUNCIL_RIVALS } from '../config/rivals';
import { ISSUES } from '../config/issues';
import { BAL } from '../config/balance';
import { getOffice, MAX_OFFICE_INDEX } from '../config/offices';
import { initElection } from '../sim/election';
import { computeAllBlocSupport, computePosition, eraForOffice, getIdeology } from '../sim/platform';

export const SAVE_VERSION = 4; // Phase 3 v2: 5-stance platform, trust multipliers, isPaused

function officeRivalRate(officeIndex: number, phase: 'primary' | 'general'): number {
  const o = getOffice(officeIndex);
  return phase === 'primary' ? o.rivalRatePrimary : o.rivalRateGeneral;
}

/** Default platform: all issues set to center (first promise is always free). */
function defaultPlatform(): Record<string, string> {
  return Object.fromEntries(ISSUES.map(i => [i.id, 'center']));
}

function freshRunState(): GameState {
  const officeIndex = 0;
  const phase = 'primary' as const;
  const era = eraForOffice(officeIndex);
  const platform = defaultPlatform();
  const trustMultipliers: Record<string, number> = {};
  const blocSupport = computeAllBlocSupport(platform, trustMultipliers, INTEREST_GROUPS, era);
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
    flipFlopTrustMultipliers: trustMultipliers,
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
    isPaused: false,
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
    // Platform carries over across runs (dynasty continuity).
    platform: state.platform,
    flipFlopCounts: state.flipFlopCounts,
    flipFlopTrustMultipliers: state.flipFlopTrustMultipliers,
    ideologyId: state.ideologyId,
    blocSupport: state.blocSupport,
  };

  return initElection(
    fresh, 0, 'primary',
    INTEREST_GROUPS, CITY_COUNCIL_RIVALS,
    officeRivalRate(0, 'primary'),
  );
}

export function advanceElection(state: GameState): GameState {
  const nextPhase: 'primary' | 'general' =
    state.phase === 'primary' ? 'general' : 'primary';
  const nextOffice = state.phase === 'general' ? state.officeIndex + 1 : state.officeIndex;

  if (nextOffice > MAX_OFFICE_INDEX) return resetRun(state);

  const era = eraForOffice(nextOffice);
  const newBlocSupport = computeAllBlocSupport(
    state.platform, state.flipFlopTrustMultipliers, INTEREST_GROUPS, era
  );
  const position = computePosition(state.platform, era);
  const ideology = getIdeology(position);

  return initElection(
    {
      ...state,
      officeIndex: nextOffice,
      phase: nextPhase,
      electionResult: 'none',
      isPaused: false,
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
