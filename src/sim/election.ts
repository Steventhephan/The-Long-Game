import { BAL, PHASE1 } from '../config/balance';
import { GENERATORS } from '../config/generators';
import { UPGRADES } from '../config/upgrades';
import type { GameState, BlocState, RivalState, BlocStaticDef, RivalStaticDef, Era } from '../types';

// TUNING TARGET: passive player auto-conversion rate per bloc (voters/sec).
// Tapping is the primary driver; this is a small trickle.
const BASE_CONV = PHASE1.playerBaseConv;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  return function (): number {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function eraForOffice(officeIndex: number): Era {
  if (officeIndex <= 1) return 'local';
  if (officeIndex <= 3) return 'county';
  if (officeIndex <= 5) return 'state';
  return 'federal';
}

function blocSupportAverage(blocSupport: Record<string, number>): number {
  const values = Object.values(blocSupport);
  if (values.length === 0) return 1.0;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

function rivalTotalVoters(blocs: BlocState[], rivalIndex: number): number {
  let total = 0;
  for (const bloc of blocs) total += bloc.rivals[rivalIndex] ?? 0;
  return total;
}

function sumUndecided(blocs: BlocState[]): number {
  let total = 0;
  for (const bloc of blocs) total += bloc.undecided;
  return total;
}

function cloneBlocs(blocs: BlocState[]): BlocState[] {
  return blocs.map(b => ({ ...b, rivals: [...b.rivals] }));
}

function cloneRivals(rivals: RivalState[]): RivalState[] {
  return rivals.map(r => ({ ...r }));
}

// ---------------------------------------------------------------------------
// Exported helpers
// ---------------------------------------------------------------------------

export function computeStack(state: GameState): number {
  const prestigeMult = 1 + state.prestige * BAL.prestigePerPoint;
  const volunteerFactor = BAL.volunteerMult(state.volunteers);
  const supportAvg = blocSupportAverage(state.blocSupport);
  const raw = supportAvg * volunteerFactor * prestigeMult * state.globalMultiplier;
  const cap = BAL.multiplierCapByEra[eraForOffice(state.officeIndex)];
  return Math.min(raw, cap);
}

export function totalPool(state: GameState): number {
  let total = 0;
  for (const bloc of state.blocs) total += bloc.totalVoters;
  return total;
}

export function playerPct(state: GameState): number {
  const pool = totalPool(state);
  if (pool <= 0) return 0;
  return state.voters / pool;
}

export function timerDisplay(state: GameState): string {
  const remaining = Math.max(0, Math.floor(state.timerRemaining));
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// computeUpgradeEffects — derive multipliers from purchased upgrades
// ---------------------------------------------------------------------------

export interface UpgradeEffects {
  tapMult: number;
  critChance: number;   // total crit chance (base + bonuses, capped)
  fieldMult: number;
  financeMult: number;
}

export function computeUpgradeEffects(state: GameState): UpgradeEffects {
  let tapMult = 1;
  let critBonus = 0;
  let fieldMult = 1;
  let financeMult = 1;

  for (const u of UPGRADES) {
    if (!state.upgrades.includes(u.id)) continue;
    const e = u.effect;
    if (e.kind === 'tapMult')     tapMult     *= e.value;
    if (e.kind === 'critChance')  critBonus   += e.value;
    if (e.kind === 'fieldMult')   fieldMult   *= e.value;
    if (e.kind === 'financeMult') financeMult *= e.value;
  }

  return {
    tapMult,
    critChance: Math.min(BAL.critBaseChance + critBonus, BAL.critChanceCap),
    fieldMult,
    financeMult,
  };
}

// ---------------------------------------------------------------------------
// initElection
// ---------------------------------------------------------------------------

export function initElection(
  state: GameState,
  officeIndex: number,
  phase: 'primary' | 'general',
  blocs: BlocStaticDef[],
  rivals: RivalStaticDef[],
  rivalRate: number,
): GameState {
  const base = BAL.poolBase * BAL.poolGrowth ** officeIndex;
  const pool = phase === 'primary'
    ? Math.round(base * BAL.primaryPoolRatio)
    : Math.round(base);

  const weights = phase === 'primary'
    ? blocs.map(b => b.primaryWeight)
    : blocs.map(b => b.generalWeight);

  const weightSum = weights.reduce((a, w) => a + w, 0);
  const rivalCount = rivals.length;

  const newBlocs: BlocState[] = blocs.map((b, i) => {
    const normalized = weightSum > 0 ? weights[i] / weightSum : 0;
    const totalVoters = Math.round(normalized * pool);
    return {
      groupId: b.groupId,
      lean: b.lean,
      totalVoters,
      undecided: totalVoters,
      player: 0,
      rivals: new Array<number>(rivalCount).fill(0),
    };
  });

  const newRivals: RivalState[] = rivals.map(r => ({
    archetypeId: r.archetypeId,
    lean: r.lean,
    share: 0,
    eliminated: false,
  }));

  const baseTimer = BAL.generalTimerBase * BAL.timerGrowth ** officeIndex;
  const timer = phase === 'primary' ? baseTimer * BAL.primaryTimerRatio : baseTimer;

  return {
    ...state,
    officeIndex,
    rivalRate,
    phase,
    blocs: newBlocs,
    rivals: newRivals,
    timerRemaining: timer,
    voters: 0,
    isRunoff: false,
    electionResult: 'none',
  };
}

// ---------------------------------------------------------------------------
// knockDoors — called on player tap
// ---------------------------------------------------------------------------

export function knockDoors(state: GameState): GameState {
  if (state.electionResult !== 'none') return state;

  const rng = mulberry32(state.rngSeed);
  const rand = rng();
  const newSeed = (rand * 4294967296) | 0;

  const effects = computeUpgradeEffects(state);
  const isCrit = rand < effects.critChance;
  const critMult = isCrit ? BAL.critMultiplier : 1;
  const stack = computeStack(state);

  const tapScale = BAL.timerGrowth ** state.officeIndex;
  const voterGain = Math.round(PHASE1.tapVoters * tapScale) * effects.tapMult * critMult * stack;
  const cashGain  = Math.round(PHASE1.tapCash   * tapScale) * effects.tapMult * critMult * stack;

  const blocs = cloneBlocs(state.blocs);

  if (voterGain > 0) {
    // Phase 1: take from undecided proportionally across blocs.
    const totalUndecided = sumUndecided(blocs);
    let remaining = voterGain;
    if (totalUndecided > 0) {
      for (const bloc of blocs) {
        const portion = (bloc.undecided / totalUndecided) * voterGain;
        const take = Math.min(portion, bloc.undecided);
        bloc.undecided -= take;
        bloc.player += take;
        remaining -= take;
      }
    }
    // Phase 2: steal from rivals proportionally if demand exceeded undecided.
    if (remaining > 0) {
      const totalRival = blocs.reduce(
        (s, b) => s + b.rivals.reduce((r, v) => r + v, 0), 0
      );
      if (totalRival > 0) {
        for (const bloc of blocs) {
          for (let ri = 0; ri < bloc.rivals.length; ri++) {
            const portion = (bloc.rivals[ri] / totalRival) * remaining;
            const steal = Math.min(portion, bloc.rivals[ri]);
            bloc.rivals[ri] -= steal;
            bloc.player += steal;
          }
        }
      }
    }
  }

  let voters = 0;
  for (const bloc of blocs) voters += bloc.player;

  return {
    ...state,
    blocs,
    cash: state.cash + cashGain,
    voters,
    lastCritHit: isCrit,
    rngSeed: newSeed,
  };
}

// ---------------------------------------------------------------------------
// tick — advances election state by dt seconds
// Caller must check document.hidden and gate calls when electionResult !== 'none'.
// ---------------------------------------------------------------------------

export function tick(state: GameState, dt: number): GameState {
  if (state.electionResult !== 'none') return state;
  if (state.blocs.length === 0) return state;

  const pool = totalPool(state);
  if (pool <= 0) return state;

  const stack = computeStack(state);
  const blocs = cloneBlocs(state.blocs);
  const rivals = cloneRivals(state.rivals);
  let cash = state.cash;

  const blocCount = blocs.length;

  // --- Player passive + rival conversion per bloc ---
  // Each candidate drains undecided first; any remaining demand steals from
  // the opponent's decided voters at the same rate (no efficiency penalty).
  for (const bloc of blocs) {
    const support = state.blocSupport[bloc.groupId] ?? 1.0;
    const playerRate = BASE_CONV * support * stack;
    const playerDemand = playerRate * dt;
    const playerFromUndecided = Math.min(playerDemand, bloc.undecided);
    bloc.undecided -= playerFromUndecided;
    bloc.player += playerFromUndecided;
    let playerOverflow = playerDemand - playerFromUndecided;
    for (let ri = 0; ri < rivals.length; ri++) {
      if (rivals[ri].eliminated || playerOverflow <= 0) continue;
      const steal = Math.min(playerOverflow, bloc.rivals[ri]);
      bloc.rivals[ri] -= steal;
      bloc.player += steal;
      playerOverflow -= steal;
    }

    for (let ri = 0; ri < rivals.length; ri++) {
      const rival = rivals[ri];
      if (rival.eliminated) continue;
      const leanMatch = 0.5 + 0.5 * (1 - Math.abs(rival.lean - bloc.lean) / 2);
      const rivalRate = (state.rivalRate / blocCount) * leanMatch;
      const rivalDemand = rivalRate * dt;
      const rivalFromUndecided = Math.min(rivalDemand, bloc.undecided);
      bloc.undecided -= rivalFromUndecided;
      bloc.rivals[ri] += rivalFromUndecided;
      const rivalOverflow = rivalDemand - rivalFromUndecided;
      if (rivalOverflow > 0) {
        const steal = Math.min(rivalOverflow, bloc.player);
        bloc.player -= steal;
        bloc.rivals[ri] += steal;
      }
    }
  }

  // --- Generator passive output (all unlocked generators) ---
  const effects = computeUpgradeEffects(state);
  let fieldVotersPerSec = 0;
  let cashPerSec = 0;
  for (const gen of GENERATORS) {
    const owned = state.generators[gen.id] ?? 0;
    if (owned === 0) continue;
    if (gen.track === 'field')   fieldVotersPerSec += owned * gen.baseOutput * effects.fieldMult;
    if (gen.track === 'finance') cashPerSec        += owned * gen.baseOutput * effects.financeMult;
  }

  const fieldVoters = fieldVotersPerSec * stack * dt;
  if (fieldVoters > 0) {
    // Target the bloc with the most undecided; fall back to most rival voters.
    const bestBloc = blocs.reduce((best, b) => {
      const bVal = b.undecided > 0 ? b.undecided : -(b.rivals.reduce((s, v) => s + v, 0));
      const bestVal = best.undecided > 0 ? best.undecided : -(best.rivals.reduce((s, v) => s + v, 0));
      return bVal > bestVal ? b : best;
    }, blocs[0]);

    const fromUndecided = Math.min(fieldVoters, bestBloc.undecided);
    bestBloc.undecided -= fromUndecided;
    bestBloc.player += fromUndecided;
    let overflow = fieldVoters - fromUndecided;
    for (let ri = 0; ri < rivals.length; ri++) {
      if (rivals[ri].eliminated || overflow <= 0) continue;
      const steal = Math.min(overflow, bestBloc.rivals[ri]);
      bestBloc.rivals[ri] -= steal;
      bestBloc.player += steal;
      overflow -= steal;
    }
  }

  cash += cashPerSec * stack * dt;

  // --- Update tallies ---
  let voters = 0;
  for (const bloc of blocs) voters += bloc.player;
  for (let ri = 0; ri < rivals.length; ri++) {
    rivals[ri].share = rivalTotalVoters(blocs, ri);
  }

  const timerRemaining = state.timerRemaining - dt;
  let result: GameState['electionResult'] = 'none';
  let isRunoff = state.isRunoff;
  let finalTimer = timerRemaining;

  // --- Instant win: someone reached 100% of pool ---
  if (voters / pool >= 1.0) {
    result = 'win';
  } else {
    for (const rival of rivals) {
      if (!rival.eliminated && rival.share / pool >= 1.0) {
        result = 'lose';
        break;
      }
    }
  }

  // --- Elimination: undecided exhausted, nobody > 50% ---
  if (result === 'none') {
    const undecidedLeft = sumUndecided(blocs);
    if (undecidedLeft <= 0) {
      const someoneMajority =
        voters / pool > 0.5 ||
        rivals.some(r => !r.eliminated && r.share / pool > 0.5);

      if (!someoneMajority) {
        let lowestIsPlayer = true;
        let lowestVotes = voters;
        let lowestRivalIndex = -1;
        for (let ri = 0; ri < rivals.length; ri++) {
          if (rivals[ri].eliminated) continue;
          if (rivals[ri].share < lowestVotes) {
            lowestVotes = rivals[ri].share;
            lowestIsPlayer = false;
            lowestRivalIndex = ri;
          }
        }
        if (lowestIsPlayer) {
          result = 'lose';
        } else {
          const rival = rivals[lowestRivalIndex];
          rival.eliminated = true;
          for (const bloc of blocs) {
            const back = bloc.rivals[lowestRivalIndex];
            if (back > 0) {
              bloc.rivals[lowestRivalIndex] = 0;
              bloc.undecided += back;
            }
          }
          rival.share = 0;
        }
      }
    }
  }

  // --- Timer-end check ---
  if (result === 'none' && timerRemaining <= 0) {
    const pPct = voters / pool;
    let highestRivalPct = 0;
    for (const rival of rivals) {
      if (rival.eliminated) continue;
      const pct = rival.share / pool;
      if (pct > highestRivalPct) highestRivalPct = pct;
    }

    if (isRunoff) {
      result = pPct > highestRivalPct ? 'runoff_win' : 'runoff_lose';
    } else if (pPct > 0.5) {
      result = 'win';
    } else if (pPct <= 0.5 && highestRivalPct <= 0.5) {
      // Nobody has majority — enter runoff (top two advance).
      result = 'runoff_start';
      isRunoff = true;
      finalTimer = BAL.runoffSeconds;

      const liveRivals = rivals
        .map((r, i) => ({ i, share: r.share, eliminated: r.eliminated }))
        .filter(r => !r.eliminated)
        .sort((a, b) => b.share - a.share);

      const rivalsAhead = liveRivals.filter(r => r.share > voters).length;
      const playerIsFinalist = rivalsAhead < 2;
      const rivalSlots = playerIsFinalist ? 1 : 2;

      for (let rank = 0; rank < liveRivals.length; rank++) {
        if (rank >= rivalSlots) {
          const idx = liveRivals[rank].i;
          rivals[idx].eliminated = true;
          for (const bloc of blocs) {
            const back = bloc.rivals[idx];
            if (back > 0) {
              bloc.rivals[idx] = 0;
              bloc.undecided += back;
            }
          }
          rivals[idx].share = 0;
        }
      }
    } else {
      result = 'lose';
    }
  }

  let finalVoters = 0;
  for (const bloc of blocs) finalVoters += bloc.player;

  return {
    ...state,
    blocs,
    rivals,
    cash,
    voters: finalVoters,
    timerRemaining: finalTimer,
    isRunoff,
    electionResult: result,
  };
}
