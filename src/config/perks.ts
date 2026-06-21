import type { PerkDef } from '../types';

export const PERKS: PerkDef[] = [
  // ── Tier 0 (no prerequisites) ─────────────────────────────────────────────
  {
    id: 'head_start',
    name: 'Head Start',
    description: 'Begin each run with $200 in seed campaign funds.',
    cost: 1,
    prereqs: [],
    effect: { kind: 'headStart', cashBonus: 200 },
  },
  {
    id: 'ground_game',
    name: 'Ground Game',
    description: 'Your canvassers are more persuasive. +50% tap yield.',
    cost: 1,
    prereqs: [],
    effect: { kind: 'groundGame', tapMult: 1.5 },
  },
  {
    id: 'field_efficiency',
    name: 'Field Efficiency',
    description: 'Field operation costs reduced by 25%.',
    cost: 3,
    prereqs: [],
    effect: { kind: 'fieldEfficiency', costMult: 0.75 },
  },
  {
    id: 'finance_efficiency',
    name: 'Finance Efficiency',
    description: 'Fundraising operation costs reduced by 25%.',
    cost: 3,
    prereqs: [],
    effect: { kind: 'financeEfficiency', costMult: 0.75 },
  },
  {
    id: 'charisma_prodigy',
    name: 'Charisma Prodigy',
    description: 'Your natural charisma draws in volunteers faster.',
    cost: 3,
    prereqs: [],
    effect: { kind: 'charismaProdigy', accrualBonus: 0.2 },
  },

  // ── Tier 1 (requires one tier-0 perk) ────────────────────────────────────
  {
    id: 'fast_forward',
    name: 'Fast-Forward',
    description: 'Previously won races run on an accelerated 15-second clock.',
    cost: 6,
    prereqs: ['head_start'],
    effect: { kind: 'fastForward', timerSeconds: 15 },
  },
  {
    id: 'crit_mastery',
    name: 'Crit Mastery',
    description: '+5% base critical hit chance on every door knock.',
    cost: 6,
    prereqs: ['ground_game'],
    effect: { kind: 'critMastery', critBonus: 0.05 },
  },
  {
    id: 'media_darling',
    name: 'Media Darling',
    description: '+50% passive voter conversion rate.',
    cost: 6,
    prereqs: ['field_efficiency'],
    effect: { kind: 'mediaDarling', passiveMult: 1.5 },
  },
  {
    id: 'war_chest',
    name: 'War Chest',
    description: 'Raise your campaign\'s effective cash ceiling.',
    cost: 6,
    prereqs: ['finance_efficiency'],
    effect: { kind: 'warChest', cashCapBonus: 2.0 },
  },
  {
    id: 'bloc_whisperer',
    name: 'Bloc Whisperer',
    description: 'Interest groups warm to you more quickly.',
    cost: 6,
    prereqs: ['charisma_prodigy'],
    effect: { kind: 'blocWhisperer', supportBonus: 0.15 },
  },

  // ── Tier 2 ────────────────────────────────────────────────────────────────
  {
    id: 'iron_reputation',
    name: 'Iron Reputation',
    description: 'Position changes cost 30% less cash.',
    cost: 6,
    prereqs: ['bloc_whisperer'],
    effect: { kind: 'ironReputation', flipCostMult: 0.7 },
  },

  // ── Capstone ──────────────────────────────────────────────────────────────
  {
    id: 'kingmaker',
    name: 'Kingmaker',
    description: 'A dynasty-wide surge: +100% to all output permanently.',
    cost: 15,
    prereqs: ['crit_mastery', 'media_darling', 'war_chest'],
    effect: { kind: 'kingmaker', globalMult: 1.0 },
  },
];

export function getPerk(id: string): PerkDef {
  const p = PERKS.find(p => p.id === id);
  if (!p) throw new Error(`Unknown perk: ${id}`);
  return p;
}
