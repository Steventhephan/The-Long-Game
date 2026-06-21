import type { IssueDef, StanceDef, Era } from '../types';

// All 12 authored issues, each with 5 stances (Far Left → Far Right).
// Stances are written neutrally — no option is "the correct politics" (Pillar 5b).
// Scalars: -1 (Far Left), -0.5 (Center-Left), 0 (Center), 0.5 (Center-Right), 1 (Far Right)

export const ISSUES: IssueDef[] = [

  // ── Local era ──────────────────────────────────────────────────────────────
  {
    id: 'property_taxes',
    name: 'Property Taxes',
    unlockEra: 'local',
    stances: [
      { id: 'far_left',     label: 'Left',      scalar: -1,   title: 'Steep Increase',   description: 'Make the wealthy pay. Fund robust public services through dramatically higher property taxes.' },
      { id: 'center_left',  label: 'Center-Left',   scalar: -0.5, title: 'Modest Increase',  description: 'Nudge rates up to close the funding gap. Balance services with affordability.' },
      { id: 'center',       label: 'Center',        scalar:  0,   title: 'Hold Steady',      description: 'Keep rates where they are. Stability over disruption.' },
      { id: 'center_right', label: 'Center-Right',  scalar:  0.5, title: 'Modest Cut',       description: 'Put money back in residents\' pockets. Trim programs to offset the reduction.' },
      { id: 'far_right',    label: 'Right',     scalar:  1,   title: 'Significant Cut',  description: 'Low taxes drive growth. Let the market, not government, provide.' },
    ],
  },
  {
    id: 'policing',
    name: 'Policing',
    unlockEra: 'local',
    stances: [
      { id: 'far_left',     label: 'Left',      scalar: -1,   title: 'Divest & Reinvest', description: 'Redirect police funding to social services, mental health, and community programs.' },
      { id: 'center_left',  label: 'Center-Left',   scalar: -0.5, title: 'Reform & Fund',     description: 'Accountability measures and community policing. Smarter, not just harder.' },
      { id: 'center',       label: 'Center',        scalar:  0,   title: 'Maintain & Fund',   description: 'Keep the current approach. Steady investment in the existing model.' },
      { id: 'center_right', label: 'Center-Right',  scalar:  0.5, title: 'Expand Resources',  description: 'More officers, more equipment. Public safety is the first duty of government.' },
      { id: 'far_right',    label: 'Right',     scalar:  1,   title: 'Zero Tolerance',    description: 'Full enforcement, tough penalties. Law and order above all else.' },
    ],
  },
  {
    id: 'development',
    name: 'Development',
    unlockEra: 'local',
    stances: [
      { id: 'far_left',     label: 'Left',      scalar: -1,   title: 'Affordable First',    description: 'Mandate affordable units in every development. Housing is a right, not a commodity.' },
      { id: 'center_left',  label: 'Center-Left',   scalar: -0.5, title: 'Mixed-Income Zones',  description: 'Require affordable units alongside market-rate. Build for everyone.' },
      { id: 'center',       label: 'Center',        scalar:  0,   title: 'Balanced Zoning',     description: 'Let the planning commission decide case by case. No blanket mandates.' },
      { id: 'center_right', label: 'Center-Right',  scalar:  0.5, title: 'Streamline Permits',  description: 'Cut red tape so builders can build. Supply solves affordability.' },
      { id: 'far_right',    label: 'Right',     scalar:  1,   title: 'Developer Friendly',  description: 'Remove restrictions entirely. The market will deliver the housing we need.' },
    ],
  },

  // ── County era ─────────────────────────────────────────────────────────────
  {
    id: 'transit',
    name: 'Transit',
    unlockEra: 'county',
    stances: [
      { id: 'far_left',     label: 'Left',      scalar: -1,   title: 'Transit First',    description: 'Massively expand buses and rail. Reduce car dependency across the region.' },
      { id: 'center_left',  label: 'Center-Left',   scalar: -0.5, title: 'Expand Transit',   description: 'Grow the transit network while keeping road maintenance funded.' },
      { id: 'center',       label: 'Center',        scalar:  0,   title: 'Roads + Transit',  description: 'Fund both. Let commuters choose their mode.' },
      { id: 'center_right', label: 'Center-Right',  scalar:  0.5, title: 'Roads First',      description: 'Most residents drive. Prioritize the infrastructure they use.' },
      { id: 'far_right',    label: 'Right',     scalar:  1,   title: 'Roads Only',       description: 'Transit is inefficient. Invest entirely in roads and highways.' },
    ],
  },
  {
    id: 'small_business',
    name: 'Small Business',
    unlockEra: 'county',
    stances: [
      { id: 'far_left',     label: 'Left',      scalar: -1,   title: 'Workers First',       description: 'Strong protections for workers. Require living wages and benefits from day one.' },
      { id: 'center_left',  label: 'Center-Left',   scalar: -0.5, title: 'Fair Standards',      description: 'Baseline protections with room to negotiate. Balance worker and owner interests.' },
      { id: 'center',       label: 'Center',        scalar:  0,   title: 'Status Quo',          description: 'Keep current rules. Don\'t fix what isn\'t broken.' },
      { id: 'center_right', label: 'Center-Right',  scalar:  0.5, title: 'Light Deregulation',  description: 'Cut unnecessary compliance costs. Let small businesses focus on business.' },
      { id: 'far_right',    label: 'Right',     scalar:  1,   title: 'Full Deregulation',   description: 'Zero mandates. The market determines wages and conditions.' },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    unlockEra: 'county',
    stances: [
      { id: 'far_left',     label: 'Left',      scalar: -1,   title: 'Fully Fund Public',  description: 'Dramatically increase public school funding. No child left behind.' },
      { id: 'center_left',  label: 'Center-Left',   scalar: -0.5, title: 'Strengthen Public',  description: 'Target resources at underperforming districts. Public schools come first.' },
      { id: 'center',       label: 'Center',        scalar:  0,   title: 'Maintain System',    description: 'Keep current allocation. Stable, predictable, proven.' },
      { id: 'center_right', label: 'Center-Right',  scalar:  0.5, title: 'School Choice',      description: 'Let parents choose. Competition improves outcomes for everyone.' },
      { id: 'far_right',    label: 'Right',     scalar:  1,   title: 'Voucher System',     description: 'Public funds follow students anywhere. Fully open the education market.' },
    ],
  },

  // ── State era ──────────────────────────────────────────────────────────────
  {
    id: 'healthcare',
    name: 'Healthcare',
    unlockEra: 'state',
    stances: [
      { id: 'far_left',     label: 'Left',      scalar: -1,   title: 'Public Option',     description: 'A government-run plan available to all citizens. Coverage as a right.' },
      { id: 'center_left',  label: 'Center-Left',   scalar: -0.5, title: 'Expand Coverage',   description: 'Extend existing public programs and add an affordable buy-in option.' },
      { id: 'center',       label: 'Center',        scalar:  0,   title: 'Mixed System',      description: 'Keep what works. Reform what doesn\'t. No dramatic restructuring.' },
      { id: 'center_right', label: 'Center-Right',  scalar:  0.5, title: 'Market Reform',     description: 'Reduce regulation to lower costs. Let competition drive innovation.' },
      { id: 'far_right',    label: 'Right',     scalar:  1,   title: 'Market Only',       description: 'Get government out. A free market in healthcare serves patients best.' },
    ],
  },
  {
    id: 'energy_environment',
    name: 'Energy & Environment',
    unlockEra: 'state',
    stances: [
      { id: 'far_left',     label: 'Left',      scalar: -1,   title: 'Green New Deal',       description: 'Rapid transition to renewables. Tax carbon, subsidize clean energy aggressively.' },
      { id: 'center_left',  label: 'Center-Left',   scalar: -0.5, title: 'Green Investment',     description: 'Incentivize clean energy without mandates. Lead with carrots, not sticks.' },
      { id: 'center',       label: 'Center',        scalar:  0,   title: 'All-of-the-Above',    description: 'Renewables, natural gas, and nuclear. Diversify the energy mix.' },
      { id: 'center_right', label: 'Center-Right',  scalar:  0.5, title: 'Energy Independence',  description: 'Domestic production first. Clean energy when it\'s cost-competitive.' },
      { id: 'far_right',    label: 'Right',     scalar:  1,   title: 'Industry First',       description: 'Fossil fuels power our economy. Lift restrictions and let industry lead.' },
    ],
  },
  {
    id: 'guns',
    name: 'Guns',
    unlockEra: 'state',
    stances: [
      { id: 'far_left',     label: 'Left',      scalar: -1,   title: 'Strict Regulation',  description: 'License ownership, mandatory training, and liability insurance for all firearms.' },
      { id: 'center_left',  label: 'Center-Left',   scalar: -0.5, title: 'Close Loopholes',    description: 'Expand background checks and extend waiting periods. Keep guns out of wrong hands.' },
      { id: 'center',       label: 'Center',        scalar:  0,   title: 'Background Checks',  description: 'Universal background checks. A modest step most Americans support.' },
      { id: 'center_right', label: 'Center-Right',  scalar:  0.5, title: 'Protect Rights',     description: 'No new restrictions. Enforce existing laws fairly and consistently.' },
      { id: 'far_right',    label: 'Right',     scalar:  1,   title: 'Expand Rights',      description: 'Reduce restrictions. Concealed carry everywhere. Protect the Second Amendment.' },
    ],
  },

  // ── Federal era ─────────────────────────────────────────────────────────────
  {
    id: 'taxes_spending',
    name: 'Taxes & Spending',
    unlockEra: 'federal',
    stances: [
      { id: 'far_left',     label: 'Left',      scalar: -1,   title: 'Tax Wealth, Expand',  description: 'Soak the rich. Dramatically expand social programs funded by wealth taxes.' },
      { id: 'center_left',  label: 'Center-Left',   scalar: -0.5, title: 'Fair Share',          description: 'Higher rates on top earners to fund targeted program expansion.' },
      { id: 'center',       label: 'Center',        scalar:  0,   title: 'Balanced Budget',     description: 'Match spending to revenue. No dramatic increases or cuts.' },
      { id: 'center_right', label: 'Center-Right',  scalar:  0.5, title: 'Lean Government',     description: 'Modest tax cuts paired with program efficiency. Do more with less.' },
      { id: 'far_right',    label: 'Right',     scalar:  1,   title: 'Cut & Reduce',        description: 'Dramatic tax cuts drive growth. Cut programs to balance the books.' },
    ],
  },
  {
    id: 'immigration',
    name: 'Immigration',
    unlockEra: 'federal',
    stances: [
      { id: 'far_left',     label: 'Left',      scalar: -1,   title: 'Open & Welcome',    description: 'Expand legal pathways, support asylum seekers, and create citizenship routes.' },
      { id: 'center_left',  label: 'Center-Left',   scalar: -0.5, title: 'Pathway Forward',   description: 'Legalize the undocumented and expand visas. Build a humane, manageable system.' },
      { id: 'center',       label: 'Center',        scalar:  0,   title: 'Security + Reform',  description: 'Secure the border while modernizing legal immigration. Both matter.' },
      { id: 'center_right', label: 'Center-Right',  scalar:  0.5, title: 'Security First',    description: 'Strengthen enforcement before any reform. Control the border first.' },
      { id: 'far_right',    label: 'Right',     scalar:  1,   title: 'Restrict & Enforce', description: 'Reduce immigration levels. Strict enforcement, no amnesties.' },
    ],
  },
  {
    id: 'social_policy',
    name: 'Social Policy',
    unlockEra: 'federal',
    stances: [
      { id: 'far_left',     label: 'Left',      scalar: -1,   title: 'Expansive Rights',   description: 'Codify comprehensive protections for all. Ensure full civil rights regardless of identity.' },
      { id: 'center_left',  label: 'Center-Left',   scalar: -0.5, title: 'Inclusive Standards', description: 'Broad protections in law with space for communities to adapt.' },
      { id: 'center',       label: 'Center',        scalar:  0,   title: 'Moderate Path',      description: 'Balance civil rights with community values. Neither extreme.' },
      { id: 'center_right', label: 'Center-Right',  scalar:  0.5, title: 'Traditional Lean',   description: 'Respect community norms and religious institutions alongside civil rights.' },
      { id: 'far_right',    label: 'Right',     scalar:  1,   title: 'Traditional Values',  description: 'Ground policy in traditional values and community standards.' },
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

export function getStance(issue: IssueDef, stanceId: string): StanceDef | undefined {
  return issue.stances.find(s => s.id === stanceId);
}

