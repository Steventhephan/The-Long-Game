import type { UpgradeDef } from '../types';

// Costs are TUNING TARGETs; designed to be reachable within 1–2 elections at the
// unlock tier. Tap upgrades cost less than generator-track upgrades since they
// have no passive compounding effect.

export const UPGRADES: UpgradeDef[] = [
  // ── Tap upgrades ─────────────────────────────────────────────────────────
  {
    id: 'tap_mult_1',
    name: 'Talking Points',
    description: 'Double your votes-per-knock.',
    category: 'tap',
    cost: 150,
    effect: { kind: 'tapMult', value: 2 },
    unlockRung: 0,
  },
  {
    id: 'tap_mult_2',
    name: 'Stump Speech',
    description: 'Double your votes-per-knock again.',
    category: 'tap',
    cost: 1_500,
    effect: { kind: 'tapMult', value: 2 },
    unlockRung: 1,
  },
  {
    id: 'tap_mult_3',
    name: 'Campaign Trail',
    description: 'Double your votes-per-knock once more.',
    category: 'tap',
    cost: 15_000,
    effect: { kind: 'tapMult', value: 2 },
    unlockRung: 2,
  },

  // ── Crit upgrades ─────────────────────────────────────────────────────────
  {
    id: 'crit_1',
    name: 'Lucky Break',
    description: '+5% chance of a critical knock.',
    category: 'tap',
    cost: 100,
    effect: { kind: 'critChance', value: 0.05 },
    unlockRung: 0,
  },
  {
    id: 'crit_2',
    name: 'Silver Tongue',
    description: '+5% chance of a critical knock.',
    category: 'tap',
    cost: 1_000,
    effect: { kind: 'critChance', value: 0.05 },
    unlockRung: 1,
  },

  // ── Field multipliers ─────────────────────────────────────────────────────
  {
    id: 'field_mult_1',
    name: 'Grassroots Network',
    description: 'Double all canvasser and field output.',
    category: 'field',
    cost: 400,
    effect: { kind: 'fieldMult', value: 2 },
    unlockRung: 0,
  },
  {
    id: 'field_mult_2',
    name: 'Precinct Captains',
    description: 'Double all field output again.',
    category: 'field',
    cost: 4_000,
    effect: { kind: 'fieldMult', value: 2 },
    unlockRung: 1,
  },
  {
    id: 'field_mult_3',
    name: 'Rapid Response Team',
    description: 'Double all field output once more.',
    category: 'field',
    cost: 40_000,
    effect: { kind: 'fieldMult', value: 2 },
    unlockRung: 2,
  },

  // ── Finance multipliers ───────────────────────────────────────────────────
  {
    id: 'finance_mult_1',
    name: 'Matching Pledge',
    description: 'Double all fundraising output.',
    category: 'finance',
    cost: 300,
    effect: { kind: 'financeMult', value: 2 },
    unlockRung: 0,
  },
  {
    id: 'finance_mult_2',
    name: 'Donor Database',
    description: 'Double all fundraising output again.',
    category: 'finance',
    cost: 3_000,
    effect: { kind: 'financeMult', value: 2 },
    unlockRung: 1,
  },
  {
    id: 'finance_mult_3',
    name: 'Fundraising Gala',
    description: 'Double all fundraising output once more.',
    category: 'finance',
    cost: 30_000,
    effect: { kind: 'financeMult', value: 2 },
    unlockRung: 2,
  },
];

export function upgradesForOffice(officeIndex: number): UpgradeDef[] {
  return UPGRADES.filter(u => u.unlockRung <= officeIndex);
}
