import type { ElectionTier, UpgradeEffect } from './types'

export interface PolicyStanceDef {
  id: string
  label: string
  effectLabel: string
  effects: UpgradeEffect[]   // array: can have a positive and negative effect simultaneously
  conflicts: string[]  // stance ids that cancel this one's effect
}

export interface PolicyIssueDef {
  id: string
  name: string
  emoji: string
  unlocksAfter: ElectionTier   // must have won this tier for the issue to be available
  adoptionCost: number
  stances: [PolicyStanceDef, PolicyStanceDef, PolicyStanceDef]
}

export const POLICY_ISSUES: PolicyIssueDef[] = [
  {
    id: 'healthcare',
    name: 'Healthcare',
    emoji: '🏥',
    unlocksAfter: 'city_council',
    adoptionCost: 8000,
    stances: [
      { id: 'universal_care', label: 'Universal Care',
        effectLabel: '+15% supporter gain · −8% donations',
        effects: [{ type: 'all_production', value: 1.15 }, { type: 'cash_rate', value: 0.92 }],
        conflicts: ['austerity_budget'] },
      { id: 'preventive_focus', label: 'Preventive Focus',
        effectLabel: '+4% supporter gain · +3% knock chance',
        effects: [{ type: 'all_production', value: 1.04 }, { type: 'click_chance', value: 0.03 }],
        conflicts: [] },
      { id: 'market_solutions', label: 'Market Solutions',
        effectLabel: '−8% supporter gain · +15% Fundraise yield',
        effects: [{ type: 'all_production', value: 0.92 }, { type: 'fundraise_multiplier', value: 1.15 }],
        conflicts: [] },
    ],
  },
  {
    id: 'economy',
    name: 'Economy',
    emoji: '💰',
    unlocksAfter: 'city_council',
    adoptionCost: 8000,
    stances: [
      { id: 'wealth_tax', label: 'Wealth Tax',
        effectLabel: '+15% supporter gain · −10% donations',
        effects: [{ type: 'all_production', value: 1.15 }, { type: 'cash_rate', value: 0.90 }],
        conflicts: [] },
      { id: 'balanced_growth', label: 'Balanced Growth',
        effectLabel: '+4% supporter gain · +3% court chance',
        effects: [{ type: 'all_production', value: 1.04 }, { type: 'court_chance', value: 0.03 }],
        conflicts: [] },
      { id: 'austerity_budget', label: 'Austerity Budget',
        effectLabel: '−8% supporter gain · +15% donations',
        effects: [{ type: 'all_production', value: 0.92 }, { type: 'cash_rate', value: 1.15 }],
        conflicts: ['universal_care'] },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    emoji: '🎓',
    unlocksAfter: 'mayor',
    adoptionCost: 40000,
    stances: [
      { id: 'public_investment', label: 'Public Investment',
        effectLabel: '+12% supporter gain · −6% donations',
        effects: [{ type: 'all_production', value: 1.12 }, { type: 'cash_rate', value: 0.94 }],
        conflicts: [] },
      { id: 'school_choice', label: 'School Choice',
        effectLabel: '+4% knock chance · +5% Fundraise chance',
        effects: [{ type: 'click_chance', value: 0.04 }, { type: 'fundraise_chance', value: 0.05 }],
        conflicts: [] },
      { id: 'vocational_focus', label: 'Vocational Focus',
        effectLabel: '−6% supporter gain · +12% Fundraise yield',
        effects: [{ type: 'all_production', value: 0.94 }, { type: 'fundraise_multiplier', value: 1.12 }],
        conflicts: [] },
    ],
  },
  {
    id: 'public_safety',
    name: 'Public Safety',
    emoji: '🛡️',
    unlocksAfter: 'state_legislature',
    adoptionCost: 200000,
    stances: [
      { id: 'community_reform', label: 'Community Reform',
        effectLabel: '+10% supporter gain · +5% knock chance',
        effects: [{ type: 'all_production', value: 1.10 }, { type: 'click_chance', value: 0.05 }],
        conflicts: [] },
      { id: 'balanced_policing', label: 'Balanced Policing',
        effectLabel: '+3% knock chance · +4% court chance',
        effects: [{ type: 'click_chance', value: 0.03 }, { type: 'court_chance', value: 0.04 }],
        conflicts: [] },
      { id: 'tough_stance', label: 'Tough on Crime',
        effectLabel: '−5% supporter gain · +12% donations',
        effects: [{ type: 'all_production', value: 0.95 }, { type: 'cash_rate', value: 1.12 }],
        conflicts: [] },
    ],
  },
  {
    id: 'foreign_policy',
    name: 'Foreign Policy',
    emoji: '🌐',
    unlocksAfter: 'governor',
    adoptionCost: 1000000,
    stances: [
      { id: 'multilateral', label: 'Multilateral',
        effectLabel: '+12% supporter gain · ×1.3 court gains',
        effects: [{ type: 'all_production', value: 1.12 }, { type: 'court_multiplier', value: 1.30 }],
        conflicts: [] },
      { id: 'diplomatic_corps', label: 'Strategic Engagement',
        effectLabel: '+5% supporter gain · +4% court chance',
        effects: [{ type: 'all_production', value: 1.05 }, { type: 'court_chance', value: 0.04 }],
        conflicts: [] },
      { id: 'america_first', label: 'America First',
        effectLabel: '−8% supporter gain · +18% Fundraise yield',
        effects: [{ type: 'all_production', value: 0.92 }, { type: 'fundraise_multiplier', value: 1.18 }],
        conflicts: [] },
    ],
  },
  {
    id: 'immigration',
    name: 'Immigration',
    emoji: '🗽',
    unlocksAfter: 'senate',
    adoptionCost: 8000000,
    stances: [
      { id: 'open_pathways', label: 'Open Pathways',
        effectLabel: '+15% supporter gain · +6% knock chance',
        effects: [{ type: 'all_production', value: 1.15 }, { type: 'click_chance', value: 0.06 }],
        conflicts: ['border_security'] },
      { id: 'merit_based', label: 'Merit-Based',
        effectLabel: '+5% court chance · +8% Fundraise chance',
        effects: [{ type: 'court_chance', value: 0.05 }, { type: 'fundraise_chance', value: 0.08 }],
        conflicts: [] },
      { id: 'border_security', label: 'Border Security',
        effectLabel: '−10% supporter gain · +18% donations',
        effects: [{ type: 'all_production', value: 0.90 }, { type: 'cash_rate', value: 1.18 }],
        conflicts: ['open_pathways'] },
    ],
  },
]

export function getPolicyStanceDef(issueId: string, stanceId: string): PolicyStanceDef | null {
  const issue = POLICY_ISSUES.find(i => i.id === issueId)
  return issue?.stances.find(s => s.id === stanceId) ?? null
}

export function isPolicyStanceConflicted(
  policyStances: Record<string, string | null>,
  issueId: string,
  stanceId: string
): boolean {
  const stance = getPolicyStanceDef(issueId, stanceId)
  if (!stance || stance.conflicts.length === 0) return false
  for (const [otherId, activeStanceId] of Object.entries(policyStances)) {
    if (otherId === issueId || !activeStanceId) continue
    if (stance.conflicts.includes(activeStanceId)) return true
  }
  return false
}

export function getActivePolicyEffects(policyStances: Record<string, string | null>) {
  const effects: { effects: UpgradeEffect[]; conflicted: boolean; issueId: string; stanceId: string }[] = []
  for (const [issueId, stanceId] of Object.entries(policyStances)) {
    if (!stanceId) continue
    const stance = getPolicyStanceDef(issueId, stanceId)
    if (!stance) continue
    const conflicted = isPolicyStanceConflicted(policyStances, issueId, stanceId)
    effects.push({ effects: stance.effects, conflicted, issueId, stanceId })
  }
  return effects
}
