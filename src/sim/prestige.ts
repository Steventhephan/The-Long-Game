import { PERKS } from '../config/perks';
import { BAL } from '../config/balance';
import { getOffice } from '../config/offices';
import type { GameState, PerkEffects } from '../types';

// ---------------------------------------------------------------------------
// Perk effects — aggregate all active perk bonuses into one flat object
// ---------------------------------------------------------------------------

export function computePerkEffects(state: GameState): PerkEffects {
  let tapMult = 1.0;
  let critBonus = 0;
  let fieldCostMult = 1.0;
  let financeCostMult = 1.0;
  let mediaDarlingMult = 1.0;
  let flipCostMult = 1.0;
  let headStartCash = 0;
  let fastForwardSeconds = 0;

  for (const perk of PERKS) {
    if (!state.perks.includes(perk.id)) continue;
    const e = perk.effect;
    if (e.kind === 'groundGame')        tapMult          *= e.tapMult;
    if (e.kind === 'critMastery')       critBonus        += e.critBonus;
    if (e.kind === 'fieldEfficiency')   fieldCostMult    *= e.costMult;
    if (e.kind === 'financeEfficiency') financeCostMult  *= e.costMult;
    if (e.kind === 'mediaDarling')      mediaDarlingMult *= e.passiveMult;
    if (e.kind === 'ironReputation')    flipCostMult     *= e.flipCostMult;
    if (e.kind === 'headStart')         headStartCash    += e.cashBonus;
    if (e.kind === 'fastForward')       fastForwardSeconds = e.timerSeconds;
  }

  return { tapMult, critBonus, fieldCostMult, financeCostMult, mediaDarlingMult, flipCostMult, headStartCash, fastForwardSeconds };
}

// ---------------------------------------------------------------------------
// Prestige gain — how much prestige would be banked if reset right now
// ---------------------------------------------------------------------------

export function computePrestigeGain(state: GameState, isVictory = false): number {
  const electionsBanked = state.officeIndex * 2
    + (state.phase === 'general' ? 1 : 0)
    + (isVictory ? 1 : 0);
  let gain = 0;
  for (let i = 0; i < electionsBanked; i++) {
    gain += BAL.officeWeight(Math.floor(i / 2));
  }
  return gain;
}

// ---------------------------------------------------------------------------
// Achievement checking — returns ids of newly unlocked achievements
// ---------------------------------------------------------------------------

export function checkAchievements(
  state: GameState,
  event: 'electionWin' | 'runReset' | 'perkBought',
  extra: { playerPct?: number; electionsThisRun?: number; isVictory?: boolean } = {},
): string[] {
  const unlocked: string[] = [];
  const has = (id: string) => state.achievements.includes(id);

  if (event === 'electionWin') {
    if (!has('first_win')) unlocked.push('first_win');

    const wins = (extra.electionsThisRun ?? 0);
    if (wins >= 3 && !has('hat_trick')) unlocked.push('hat_trick');

    const pct = extra.playerPct ?? 0;
    if (pct > 0.75 && !has('landslide')) unlocked.push('landslide');

    if (state.officeIndex >= 3 && !has('iron_will')) unlocked.push('iron_will');
    if (state.officeIndex >= 4 && !has('statesman')) unlocked.push('statesman');

    if (extra.isVictory && !has('the_long_game')) unlocked.push('the_long_game');
  }

  if (event === 'runReset') {
    if (!has('dynasty_begins')) unlocked.push('dynasty_begins');
  }

  if (event === 'perkBought') {
    if (!has('perk_up')) unlocked.push('perk_up');
    if (state.perks.length >= 5 && !has('power_broker')) unlocked.push('power_broker');
    if (state.perks.includes('kingmaker') && !has('the_kingmaker')) unlocked.push('the_kingmaker');
  }

  return unlocked;
}

// ---------------------------------------------------------------------------
// Prestige threshold label for display
// ---------------------------------------------------------------------------

export function prestigeLabel(prestige: number): string {
  if (prestige === 0) return 'Newcomer';
  if (prestige < 5) return 'Activist';
  if (prestige < 15) return 'Organizer';
  if (prestige < 40) return 'Politician';
  if (prestige < 100) return 'Statesman';
  if (prestige < 250) return 'Power Broker';
  return 'Kingmaker';
}

// ---------------------------------------------------------------------------
// Office name helper (safe — no throw)
// ---------------------------------------------------------------------------

export function officeName(officeIndex: number): string {
  try { return getOffice(officeIndex).name; }
  catch { return 'Unknown'; }
}
