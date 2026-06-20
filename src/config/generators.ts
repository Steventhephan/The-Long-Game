import type { GeneratorDef } from '../types';
import { BAL } from './balance';

// Full 8-rung ladders authored in Generators.md; Phase 1 exposes rungs 0 only.
// Costs and outputs are TUNING TARGETs beyond the 1.15× growth rate (spec-locked).

export const GENERATORS: GeneratorDef[] = [
  // ── Field track (voters/sec) ──────────────────────────────────────────────
  {
    id: 'canvasser',
    name: 'Canvasser',
    track: 'field',
    rung: 0,
    baseCost: 75,          // TUNING TARGET: ~10 taps to afford first unit
    baseOutput: 2.0,       // voters/sec per owned — TUNING TARGET: 3 units = +6/s tiebreaker
    unlockOffice: 'city_council',
    flavor: 'Going door to door, one conversation at a time.',
  },
  {
    id: 'phone_bank',
    name: 'Phone Bank',
    track: 'field',
    rung: 1,
    baseCost: 80,          // TUNING TARGET (baseCost[0] × rungCostMultiplier)
    baseOutput: 1.4,       // TUNING TARGET (baseOutput[0] × rungOutputMultiplier)
    unlockOffice: 'mayor',
    flavor: 'Volunteers on the phones, reaching hundreds a night.',
  },
  // ── Finance track (cash/sec) ──────────────────────────────────────────────
  {
    id: 'small_dollar_drive',
    name: 'Small-Dollar Drive',
    track: 'finance',
    rung: 0,
    baseCost: 75,          // TUNING TARGET: same gate as Canvasser
    baseOutput: 2.0,       // cash/sec per owned — TUNING TARGET: funds field purchases
    unlockOffice: 'city_council',
    flavor: '$5 here, $10 there — it adds up.',
  },
  {
    id: 'email_fundraising',
    name: 'Email Fundraising List',
    track: 'finance',
    rung: 1,
    baseCost: 80,          // TUNING TARGET
    baseOutput: 3.5,       // TUNING TARGET
    unlockOffice: 'mayor',
    flavor: '"Friend, I\'ll be honest with you…"',
  },
];

/** Cost of the Nth copy (0-indexed owned count before purchase). */
export function generatorCost(def: GeneratorDef, owned: number): number {
  return Math.ceil(def.baseCost * BAL.generatorCostGrowth ** owned);
}

/** Total output per second for owned copies of a generator. */
export function generatorOutput(def: GeneratorDef, owned: number): number {
  return def.baseOutput * owned;
}

/** Largest affordable quantity given current cash. */
export function maxAffordable(def: GeneratorDef, owned: number, cash: number): number {
  let qty = 0;
  let remaining = cash;
  while (true) {
    const cost = generatorCost(def, owned + qty);
    if (remaining < cost) break;
    remaining -= cost;
    qty++;
  }
  return qty;
}

/** Total cost to buy `qty` copies starting from `owned`. */
export function bulkCost(def: GeneratorDef, owned: number, qty: number): number {
  let total = 0;
  for (let i = 0; i < qty; i++) {
    total += generatorCost(def, owned + i);
  }
  return total;
}

export function getGenerator(id: string): GeneratorDef {
  const g = GENERATORS.find(g => g.id === id);
  if (!g) throw new Error(`Unknown generator: ${id}`);
  return g;
}
