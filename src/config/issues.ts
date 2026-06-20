import type { IssueDef, Era } from '../types';

// All 12 authored issues from Policy, Platform & Interest Groups — Roster A.
// Stances are written neutrally — no option is "the correct politics" (Pillar 5b).
// Issues unlock as the player climbs eras: 3 Local → 6 County → 9 State → 12 Federal.

export const ISSUES: IssueDef[] = [
  // ── Local era ────────────────────────────────────────────────────────────
  {
    id: 'property_taxes',
    name: 'Property Taxes',
    unlockEra: 'local',
    stances: [
      { id: 'left',   label: 'Raise to fund services', scalar: -1 },
      { id: 'center', label: 'Hold steady',             scalar:  0 },
      { id: 'right',  label: 'Cut',                     scalar:  1 },
    ],
  },
  {
    id: 'policing',
    name: 'Policing',
    unlockEra: 'local',
    stances: [
      { id: 'left',   label: 'Reform & reinvest',   scalar: -1 },
      { id: 'center', label: 'Maintain & fund',      scalar:  0 },
      { id: 'right',  label: 'Expand & toughen',     scalar:  1 },
    ],
  },
  {
    id: 'development',
    name: 'Development',
    unlockEra: 'local',
    stances: [
      { id: 'left',   label: 'Affordable-housing mandates', scalar: -1 },
      { id: 'center', label: 'Balanced zoning',             scalar:  0 },
      { id: 'right',  label: 'Developer-friendly',          scalar:  1 },
    ],
  },

  // ── County era ───────────────────────────────────────────────────────────
  {
    id: 'transit',
    name: 'Transit',
    unlockEra: 'county',
    stances: [
      { id: 'left',   label: 'Expand transit',       scalar: -1 },
      { id: 'center', label: 'Roads + transit mix',  scalar:  0 },
      { id: 'right',  label: 'Prioritize roads',     scalar:  1 },
    ],
  },
  {
    id: 'small_business',
    name: 'Small Business',
    unlockEra: 'county',
    stances: [
      { id: 'left',   label: 'Worker protections',        scalar: -1 },
      { id: 'center', label: 'Balanced',                   scalar:  0 },
      { id: 'right',  label: 'Deregulate & cut taxes',    scalar:  1 },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    unlockEra: 'county',
    stances: [
      { id: 'left',   label: 'Boost public schools',         scalar: -1 },
      { id: 'center', label: 'Maintain',                     scalar:  0 },
      { id: 'right',  label: 'School choice / vouchers',     scalar:  1 },
    ],
  },

  // ── State era ─────────────────────────────────────────────────────────────
  {
    id: 'healthcare',
    name: 'Healthcare',
    unlockEra: 'state',
    stances: [
      { id: 'left',   label: 'Public option',   scalar: -1 },
      { id: 'center', label: 'Mixed system',    scalar:  0 },
      { id: 'right',  label: 'Market-based',    scalar:  1 },
    ],
  },
  {
    id: 'energy_environment',
    name: 'Energy & Environment',
    unlockEra: 'state',
    stances: [
      { id: 'left',   label: 'Green transition',    scalar: -1 },
      { id: 'center', label: 'All-of-the-above',    scalar:  0 },
      { id: 'right',  label: 'Industry-first',      scalar:  1 },
    ],
  },
  {
    id: 'guns',
    name: 'Guns',
    unlockEra: 'state',
    stances: [
      { id: 'left',   label: 'Stricter regulation',   scalar: -1 },
      { id: 'center', label: 'Background checks',     scalar:  0 },
      { id: 'right',  label: 'Protect gun rights',    scalar:  1 },
    ],
  },

  // ── Federal era ───────────────────────────────────────────────────────────
  {
    id: 'taxes_spending',
    name: 'Taxes & Spending',
    unlockEra: 'federal',
    stances: [
      { id: 'left',   label: 'Tax wealth, expand programs', scalar: -1 },
      { id: 'center', label: 'Balance the budget',          scalar:  0 },
      { id: 'right',  label: 'Cut taxes & spending',        scalar:  1 },
    ],
  },
  {
    id: 'immigration',
    name: 'Immigration',
    unlockEra: 'federal',
    stances: [
      { id: 'left',   label: 'Pathway & expansion',      scalar: -1 },
      { id: 'center', label: 'Security + reform',        scalar:  0 },
      { id: 'right',  label: 'Restriction & enforcement', scalar:  1 },
    ],
  },
  {
    id: 'social_policy',
    name: 'Social Policy',
    unlockEra: 'federal',
    stances: [
      { id: 'left',   label: 'Expansive rights',    scalar: -1 },
      { id: 'center', label: 'Moderate',            scalar:  0 },
      { id: 'right',  label: 'Traditional values',  scalar:  1 },
    ],
  },
];

const ERA_ORDER: Era[] = ['local', 'county', 'state', 'federal'];

export function issuesForEra(currentEra: Era): IssueDef[] {
  const cutoff = ERA_ORDER.indexOf(currentEra);
  return ISSUES.filter(i => ERA_ORDER.indexOf(i.unlockEra) <= cutoff);
}

export function getIssue(id: string): IssueDef {
  const issue = ISSUES.find(i => i.id === id);
  if (!issue) throw new Error(`Unknown issue: ${id}`);
  return issue;
}
