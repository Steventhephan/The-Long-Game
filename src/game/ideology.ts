import type { UpgradeEffect } from './types'
import { isPolicyStanceConflicted } from './policy'

export interface IdeologyDef {
  id: string
  name: string
  description: string
  effects: UpgradeEffect[]
  effectLabel: string
}

// -1 = left, 0 = center, +1 = right
const STANCE_SCORES: Record<string, number> = {
  universal_care: -1, preventive_focus: 0, market_solutions: 1,
  wealth_tax: -1, balanced_growth: 0, austerity_budget: 1,
  public_investment: -1, school_choice: 0, vocational_focus: 1,
  community_reform: -1, balanced_policing: 0, tough_stance: 1,
  multilateral: -1, diplomatic_corps: 0, america_first: 1,
  open_pathways: -1, merit_based: 0, border_security: 1,
}

const IDEOLOGIES: Record<string, IdeologyDef> = {
  democratic_socialist: {
    id: 'democratic_socialist',
    name: 'Democratic Socialist',
    description: 'Bold public investment drives grassroots energy but cuts into donor appeal.',
    effects: [{ type: 'all_production', value: 1.15 }, { type: 'cash_rate', value: 0.92 }],
    effectLabel: '+15% supporter gain · −8% donations',
  },
  progressive: {
    id: 'progressive',
    name: 'Progressive',
    description: 'A left-leaning platform energizes the base and builds broad supporter momentum.',
    effects: [{ type: 'all_production', value: 1.10 }],
    effectLabel: '+10% supporter gain',
  },
  liberal: {
    id: 'liberal',
    name: 'Liberal',
    description: 'Center-left policies attract grassroots support and charitable giving.',
    effects: [{ type: 'all_production', value: 1.05 }, { type: 'fundraise_chance', value: 0.05 }],
    effectLabel: '+5% supporter gain · +5% Fundraise chance',
  },
  pragmatist: {
    id: 'pragmatist',
    name: 'Pragmatist',
    description: 'An evidence-based, centrist platform opens doors on both sides of the aisle.',
    effects: [{ type: 'court_chance', value: 0.04 }, { type: 'fundraise_chance', value: 0.04 }],
    effectLabel: '+4% court chance · +4% Fundraise chance',
  },
  centrist: {
    id: 'centrist',
    name: 'Centrist',
    description: 'Balanced positions appeal to a wide coalition of everyday voters.',
    effects: [{ type: 'click_chance', value: 0.03 }, { type: 'court_chance', value: 0.03 }],
    effectLabel: '+3% knock chance · +3% court chance',
  },
  moderate: {
    id: 'moderate',
    name: 'Moderate',
    description: 'Measured positions attract mainstream voters and steady donor support.',
    effects: [{ type: 'all_production', value: 1.04 }, { type: 'cash_rate', value: 1.05 }],
    effectLabel: '+4% supporter gain · +5% donations',
  },
  fiscal_conservative: {
    id: 'fiscal_conservative',
    name: 'Fiscal Conservative',
    description: 'Budget discipline and market-friendly policies unlock major donor networks.',
    effects: [{ type: 'cash_rate', value: 1.14 }],
    effectLabel: '+14% donations',
  },
  conservative: {
    id: 'conservative',
    name: 'Conservative',
    description: 'Traditional values energize the base and court establishment support.',
    effects: [{ type: 'cash_rate', value: 1.10 }, { type: 'court_chance', value: 0.04 }],
    effectLabel: '+10% donations · +4% court chance',
  },
  nationalist: {
    id: 'nationalist',
    name: 'Nationalist',
    description: 'A strong national identity platform fires up voters and draws donor loyalty.',
    effects: [{ type: 'cash_rate', value: 1.08 }, { type: 'click_chance', value: 0.05 }],
    effectLabel: '+8% donations · +5% knock chance',
  },
  populist: {
    id: 'populist',
    name: 'Populist',
    description: 'Anti-establishment energy wins hearts at the doors but alienates big donors.',
    effects: [{ type: 'all_production', value: 1.12 }, { type: 'cash_rate', value: 0.94 }],
    effectLabel: '+12% supporter gain · −6% donations',
  },
  populist_nationalist: {
    id: 'populist_nationalist',
    name: 'Populist Nationalist',
    description: 'Economic grievance meets strong borders — a volatile but potent coalition.',
    effects: [{ type: 'all_production', value: 1.10 }, { type: 'click_chance', value: 0.06 }],
    effectLabel: '+10% supporter gain · +6% knock chance',
  },
  america_first: {
    id: 'america_first',
    name: 'America First',
    description: 'Protectionist foreign policy and strict immigration controls draw major interest.',
    effects: [{ type: 'fundraise_multiplier', value: 1.12 }, { type: 'cash_rate', value: 1.06 }],
    effectLabel: '+12% Fundraise yield · +6% donations',
  },
  globalist: {
    id: 'globalist',
    name: 'Progressive Globalist',
    description: 'Open borders and multilateral cooperation amplify your reach with interest groups.',
    effects: [{ type: 'all_production', value: 1.12 }, { type: 'court_multiplier', value: 1.20 }],
    effectLabel: '+12% supporter gain · ×1.2 court gains',
  },
  law_and_order_dem: {
    id: 'law_and_order_dem',
    name: 'Law & Order Democrat',
    description: 'Progressive economics paired with a tough safety stance wins crossover appeal.',
    effects: [{ type: 'all_production', value: 1.08 }, { type: 'court_chance', value: 0.05 }],
    effectLabel: '+8% supporter gain · +5% court chance',
  },
  compassionate_con: {
    id: 'compassionate_con',
    name: 'Compassionate Conservative',
    description: 'Fiscal restraint softened by social investment broadens the donor coalition.',
    effects: [{ type: 'cash_rate', value: 1.08 }, { type: 'click_chance', value: 0.04 }],
    effectLabel: '+8% donations · +4% knock chance',
  },
}

export function getIdeology(
  policyStances: Record<string, string | null>
): { ideology: IdeologyDef; activeCount: number } | null {
  const active: string[] = []
  for (const [issueId, stanceId] of Object.entries(policyStances)) {
    if (!stanceId) continue
    if (isPolicyStanceConflicted(policyStances, issueId, stanceId)) continue
    active.push(stanceId)
  }

  if (active.length < 2) return null

  const has = (id: string) => active.includes(id)
  const score = active.reduce((sum, s) => sum + (STANCE_SCORES[s] ?? 0), 0)
  const centerCount = active.filter((s) => STANCE_SCORES[s] === 0).length

  // Special combos — checked before score-based fallback
  if (has('wealth_tax') && has('tough_stance') && has('border_security')) {
    return { ideology: IDEOLOGIES.populist_nationalist, activeCount: active.length }
  }
  if (has('america_first') && has('border_security')) {
    return { ideology: IDEOLOGIES.america_first, activeCount: active.length }
  }
  if (has('multilateral') && has('open_pathways')) {
    return { ideology: IDEOLOGIES.globalist, activeCount: active.length }
  }
  if (has('wealth_tax') && has('tough_stance')) {
    return { ideology: IDEOLOGIES.law_and_order_dem, activeCount: active.length }
  }
  if (has('wealth_tax') && has('community_reform') && has('public_investment')) {
    return { ideology: IDEOLOGIES.democratic_socialist, activeCount: active.length }
  }
  if (has('austerity_budget') && (has('preventive_focus') || has('community_reform') || has('school_choice'))) {
    return { ideology: IDEOLOGIES.compassionate_con, activeCount: active.length }
  }
  if (has('austerity_budget') && has('tough_stance')) {
    return { ideology: IDEOLOGIES.nationalist, activeCount: active.length }
  }

  // Score-based fallback
  if (score <= -4) return { ideology: IDEOLOGIES.democratic_socialist, activeCount: active.length }
  if (score <= -2) return { ideology: IDEOLOGIES.progressive, activeCount: active.length }
  if (score === -1) return { ideology: IDEOLOGIES.liberal, activeCount: active.length }
  if (score === 0) {
    return { ideology: centerCount >= 2 ? IDEOLOGIES.pragmatist : IDEOLOGIES.centrist, activeCount: active.length }
  }
  if (score === 1) return { ideology: IDEOLOGIES.moderate, activeCount: active.length }
  if (score <= 3) {
    return { ideology: has('austerity_budget') ? IDEOLOGIES.fiscal_conservative : IDEOLOGIES.conservative, activeCount: active.length }
  }
  return { ideology: IDEOLOGIES.nationalist, activeCount: active.length }
}
