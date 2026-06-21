import type { UpgradeDef } from '../types';

// Costs are TUNING TARGETs; designed to be reachable within 1–2 elections at the
// unlock tier. Tap upgrades cost less than generator-track upgrades since they
// have no passive compounding effect.

export const UPGRADES: UpgradeDef[] = [
  // ── Tap upgrades ─────────────────────────────────────────────────────────
  {
    id: 'tap_mult_1',
    name: 'Talking Points',
    description: 'Double your votes-per-knock',
    category: 'tap',
    cost: 1_500,
    effect: { kind: 'tapMult', value: 2 },
    unlockRung: 0,
  },
  {
    id: 'tap_mult_2',
    name: 'Stump Speech',
    description: 'Double your votes-per-knock again',
    category: 'tap',
    cost: 12_000,
    effect: { kind: 'tapMult', value: 2 },
    unlockRung: 1,
  },
  {
    id: 'tap_mult_3',
    name: 'Campaign Trail',
    description: 'Double your votes-per-knock once more',
    category: 'tap',
    cost: 100_000,
    effect: { kind: 'tapMult', value: 2 },
    unlockRung: 2,
  },

  // ── Crit upgrades ─────────────────────────────────────────────────────────
  {
    id: 'crit_1',
    name: 'Lucky Break',
    description: '+5% chance of a critical knock',
    category: 'tap',
    cost: 750,
    effect: { kind: 'critChance', value: 0.05 },
    unlockRung: 0,
  },
  {
    id: 'crit_2',
    name: 'Silver Tongue',
    description: '+5% chance of a critical knock',
    category: 'tap',
    cost: 6_000,
    effect: { kind: 'critChance', value: 0.05 },
    unlockRung: 1,
  },

  // ── Field multipliers ─────────────────────────────────────────────────────
  {
    id: 'field_mult_1',
    name: 'Grassroots Network',
    description: 'Double all canvasser and field output',
    category: 'field',
    cost: 3_000,
    effect: { kind: 'fieldMult', value: 2 },
    unlockRung: 0,
  },
  {
    id: 'field_mult_2',
    name: 'Precinct Captains',
    description: 'Double all field output again',
    category: 'field',
    cost: 35_000,
    effect: { kind: 'fieldMult', value: 2 },
    unlockRung: 1,
  },
  {
    id: 'field_mult_3',
    name: 'Rapid Response Team',
    description: 'Double all field output once more',
    category: 'field',
    cost: 300_000,
    effect: { kind: 'fieldMult', value: 2 },
    unlockRung: 2,
  },

  // ── Finance multipliers ───────────────────────────────────────────────────
  {
    id: 'finance_mult_1',
    name: 'Matching Pledge',
    description: 'Double all fundraising output',
    category: 'finance',
    cost: 2_500,
    effect: { kind: 'financeMult', value: 2 },
    unlockRung: 0,
  },
  {
    id: 'finance_mult_2',
    name: 'Donor Database',
    description: 'Double all fundraising output again',
    category: 'finance',
    cost: 25_000,
    effect: { kind: 'financeMult', value: 2 },
    unlockRung: 1,
  },
  {
    id: 'finance_mult_3',
    name: 'Fundraising Gala',
    description: 'Double all fundraising output once more',
    category: 'finance',
    cost: 200_000,
    effect: { kind: 'financeMult', value: 2 },
    unlockRung: 2,
  },

  // ── Ideological Forks (Federal era — officeIndex 6+) ─────────────────────
  // Commits to an ideological identity; mutually exclusive via exclusiveGroup.
  // Effect is a tapMult — fork bonuses are applied as a 3× tap multiplier for
  // a committed identity (representing motivated base turnout).
  {
    id: 'fork_progressive',
    name: 'Progressive Identity',
    description: 'Commit to the progressive lane — ×3 tap output when blocSupport from Labor, Civil Rights, or Environmentalists avg > 1.5',
    category: 'fork',
    cost: 50_000,
    effect: { kind: 'tapMult', value: 1.5 },
    unlockRung: 6,
    exclusiveGroup: 'ideology_fork',
  },
  {
    id: 'fork_moderate',
    name: 'Moderate Identity',
    description: 'Commit to the moderate lane — ×1.5 tap output, but bonus ×1.5 when leading Suburban Moderates and Retirees',
    category: 'fork',
    cost: 50_000,
    effect: { kind: 'tapMult', value: 1.5 },
    unlockRung: 6,
    exclusiveGroup: 'ideology_fork',
  },
  {
    id: 'fork_conservative',
    name: 'Conservative Identity',
    description: 'Commit to the conservative lane — ×1.5 tap output when blocSupport from Law Enforcement, Faith, or Small Business avg > 1.5',
    category: 'fork',
    cost: 50_000,
    effect: { kind: 'tapMult', value: 1.5 },
    unlockRung: 6,
    exclusiveGroup: 'ideology_fork',
  },
];

export function upgradesForOffice(officeIndex: number): UpgradeDef[] {
  return UPGRADES.filter(u => u.unlockRung <= officeIndex);
}
