import type { GeneratorDef } from '../types';
import { BAL } from './balance';

// Base costs and outputs follow the spec formulas (all TUNING TARGETs):
//   baseCost(rung k)   = BASE_COST_0  × 8^k
//   baseOutput(rung k) = BASE_OUTPUT_0 × BAL.rungOutputMultiplier^k
// baseCost0 = 75 (tuned for ~4 taps/sec human — see Phase 1 Build Log).
// rungOutputMultiplier reduced 7→6→5 (Phase 7.5): 6× compounding still too fast —
// Phone Bank (rung 1) at 15 v/s × stack 1.79 = 26.8 effective, overwhelming Mayor rival.
// At 5×: Phone Bank = 12.5 × 1.79 = 22.4/s; player with 10c+1PB (67.1/s) stays below Mayor rival (111.6/s).

const BASE_COST_0   = 150; // TUNING TARGET: doubled from 75 — at 6 taps/sec cash flow, $75 base let players buy too many generators mid-race via tab-switching
const FIELD_OUT_0   = 2.5;  // TUNING TARGET: halved from 5.0 — stack multiplier (~1.79) was amplifying each canvasser to 8.95 effective v/s; 2.5 → 4.47 effective
const FINANCE_OUT_0 = 1.0;  // TUNING TARGET: halved from 2.0 — slows finance→field feedback loop that let players buy unlimited mid-race canvassers

function cost(rung: number)          { return Math.round(BASE_COST_0 * 8 ** rung); }
function fieldOutput(rung: number)   { return parseFloat((FIELD_OUT_0   * BAL.rungOutputMultiplier ** rung).toPrecision(4)); }
function financeOutput(rung: number) { return parseFloat((FINANCE_OUT_0 * BAL.rungOutputMultiplier ** rung).toPrecision(4)); }

const OFFICE_IDS = [
  'city_council', 'mayor', 'county_council', 'county_executive',
  'state_legislature', 'governor', 'senate', 'president',
];

export const GENERATORS: GeneratorDef[] = [
  // ── Field track — voters/sec ──────────────────────────────────────────────
  {
    id: 'canvasser',
    name: 'Canvasser',
    track: 'field', rung: 0,
    baseCost: cost(0), baseOutput: fieldOutput(0),
    unlockOffice: OFFICE_IDS[0],
    flavor: 'Going door to door, one conversation at a time.',
  },
  {
    id: 'phone_bank',
    name: 'Phone Bank',
    track: 'field', rung: 1,
    baseCost: cost(1), baseOutput: fieldOutput(1),
    unlockOffice: OFFICE_IDS[1],
    flavor: 'Volunteers on the phones, reaching hundreds a night.',
  },
  {
    id: 'regional_office',
    name: 'Regional Office',
    track: 'field', rung: 2,
    baseCost: cost(2), baseOutput: fieldOutput(2),
    unlockOffice: OFFICE_IDS[2],
    flavor: 'A local hub turning neighbors into organizers.',
  },
  {
    id: 'campaign_bus',
    name: 'Campaign Bus',
    track: 'field', rung: 3,
    baseCost: cost(3), baseOutput: fieldOutput(3),
    unlockOffice: OFFICE_IDS[3],
    flavor: 'Rolling through every precinct, sunrise to sundown.',
  },
  {
    id: 'rally_tour',
    name: 'Rally Tour',
    track: 'field', rung: 4,
    baseCost: cost(4), baseOutput: fieldOutput(4),
    unlockOffice: OFFICE_IDS[4],
    flavor: 'Packed auditoriums converting enthusiasm into votes.',
  },
  {
    id: 'tv_ad_spot',
    name: 'TV Ad Spot',
    track: 'field', rung: 5,
    baseCost: cost(5), baseOutput: fieldOutput(5),
    unlockOffice: OFFICE_IDS[5],
    flavor: '"Paid for by the Committee to Elect…"',
  },
  {
    id: 'micro_targeting',
    name: 'Micro-Targeting Data Team',
    track: 'field', rung: 6,
    baseCost: cost(6), baseOutput: fieldOutput(6),
    unlockOffice: OFFICE_IDS[6],
    flavor: 'Every ad, every door — precision-matched to the voter.',
  },
  {
    id: 'national_media_team',
    name: 'National Media Team',
    track: 'field', rung: 7,
    baseCost: cost(7), baseOutput: fieldOutput(7),
    unlockOffice: OFFICE_IDS[7],
    flavor: 'The full media apparatus of a presidential campaign.',
  },

  // ── Finance track — cash/sec ───────────────────────────────────────────────
  {
    id: 'small_dollar_drive',
    name: 'Small-Dollar Drive',
    track: 'finance', rung: 0,
    baseCost: cost(0), baseOutput: financeOutput(0),
    unlockOffice: OFFICE_IDS[0],
    flavor: '$5 here, $10 there — it adds up.',
  },
  {
    id: 'email_fundraising',
    name: 'Email Fundraising List',
    track: 'finance', rung: 1,
    baseCost: cost(1), baseOutput: financeOutput(1),
    unlockOffice: OFFICE_IDS[1],
    flavor: '"Friend, I\'ll be honest with you…"',
  },
  {
    id: 'donor_dinner',
    name: 'Donor Dinner',
    track: 'finance', rung: 2,
    baseCost: cost(2), baseOutput: financeOutput(2),
    unlockOffice: OFFICE_IDS[2],
    flavor: 'Rubber chicken, real checks.',
  },
  {
    id: 'bundler_network',
    name: 'Bundler Network',
    track: 'finance', rung: 3,
    baseCost: cost(3), baseOutput: financeOutput(3),
    unlockOffice: OFFICE_IDS[3],
    flavor: 'Each bundler brings a rolodex of max-donors.',
  },
  {
    id: 'national_fundraising',
    name: 'National Fundraising Committee',
    track: 'finance', rung: 4,
    baseCost: cost(4), baseOutput: financeOutput(4),
    unlockOffice: OFFICE_IDS[4],
    flavor: 'A coordinated machine working every time zone.',
  },
  {
    id: 'corporate_sponsorships',
    name: 'Corporate Sponsorships',
    track: 'finance', rung: 5,
    baseCost: cost(5), baseOutput: financeOutput(5),
    unlockOffice: OFFICE_IDS[5],
    flavor: 'Logos on the podium, checks in the war chest.',
  },
  {
    id: 'lobbyist_alliance',
    name: 'Lobbyist Alliance',
    track: 'finance', rung: 6,
    baseCost: cost(6), baseOutput: financeOutput(6),
    unlockOffice: OFFICE_IDS[6],
    flavor: 'K Street knows which way the wind is blowing.',
  },
  {
    id: 'super_pac',
    name: 'Super PAC',
    track: 'finance', rung: 7,
    baseCost: cost(7), baseOutput: financeOutput(7),
    unlockOffice: OFFICE_IDS[7],
    flavor: 'Technically independent. Practically unlimited.',
  },
];

// Generators whose rung ≤ officeIndex are available at that office.
export function generatorsForOffice(officeIndex: number): GeneratorDef[] {
  return GENERATORS.filter(g => g.rung <= officeIndex);
}

/** Cost of the Nth copy (owned = count before this purchase). costMult from perks. */
export function generatorCost(def: GeneratorDef, owned: number, costMult = 1.0): number {
  return Math.ceil(def.baseCost * BAL.generatorCostGrowth ** owned * costMult);
}

/** Total passive output per second for all owned copies. */
export function generatorOutput(def: GeneratorDef, owned: number): number {
  return def.baseOutput * owned;
}

/** Largest quantity affordable given current cash. costMult from perks. */
export function maxAffordable(def: GeneratorDef, owned: number, cash: number, costMult = 1.0): number {
  let qty = 0;
  let remaining = cash;
  while (true) {
    const c = generatorCost(def, owned + qty, costMult);
    if (remaining < c) break;
    remaining -= c;
    qty++;
    if (qty > 10_000) break; // safety cap
  }
  return qty;
}

/** Total cost to buy `qty` copies starting from `owned`. costMult from perks. */
export function bulkCost(def: GeneratorDef, owned: number, qty: number, costMult = 1.0): number {
  let total = 0;
  for (let i = 0; i < qty; i++) total += generatorCost(def, owned + i, costMult);
  return total;
}

export function getGenerator(id: string): GeneratorDef {
  const g = GENERATORS.find(g => g.id === id);
  if (!g) throw new Error(`Unknown generator: ${id}`);
  return g;
}
