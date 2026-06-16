export interface PrestigeUpgradeDef {
  id: string
  name: string
  description: string
  cost: number  // prestige points
  // What this upgrade does when prestiging (applied in prestige action or selectors)
  effect:
    | { type: 'supporter_carry'; value: number }  // additive %, e.g. 0.10 = +10%
    | { type: 'cash_carry'; value: number }
    | { type: 'volunteer_carry'; value: number }
    | { type: 'all_carry'; value: number }        // adds to all three
    | { type: 'production_mult'; value: number }  // permanent multiplier on all production
    | { type: 'cash_rate_mult'; value: number }   // permanent cash rate multiplier
    | { type: 'click_mult'; value: number }       // permanent click multiplier
  unlockAfterPrestiges: number  // how many prestiges needed before this option appears
}

export const PRESTIGE_UPGRADES: PrestigeUpgradeDef[] = [
  // ── Carryover upgrades ─────────────────────────────────────────────────
  {
    id: 'p_name_recognition',
    name: 'Name Recognition',
    description: 'Voters remember you. Carry over +10% of your supporters.',
    cost: 1,
    effect: { type: 'supporter_carry', value: 0.10 },
    unlockAfterPrestiges: 0,
  },
  {
    id: 'p_war_chest',
    name: 'War Chest',
    description: 'Keep your donors warm between campaigns. +10% cash carryover.',
    cost: 1,
    effect: { type: 'cash_carry', value: 0.10 },
    unlockAfterPrestiges: 0,
  },
  {
    id: 'p_loyal_base',
    name: 'Loyal Base',
    description: 'Your most dedicated volunteers don\'t quit between races. +10% volunteer carryover.',
    cost: 1,
    effect: { type: 'volunteer_carry', value: 0.10 },
    unlockAfterPrestiges: 0,
  },
  {
    id: 'p_endorsements',
    name: 'Endorsements',
    description: 'Prior victories attract serious backers. +20% supporter carryover.',
    cost: 3,
    effect: { type: 'supporter_carry', value: 0.20 },
    unlockAfterPrestiges: 1,
  },
  {
    id: 'p_legacy_donors',
    name: 'Legacy Donors',
    description: 'Old money follows winners. +20% cash carryover.',
    cost: 3,
    effect: { type: 'cash_carry', value: 0.20 },
    unlockAfterPrestiges: 1,
  },
  {
    id: 'p_grassroots_machine',
    name: 'Grassroots Machine',
    description: 'Your organizing infrastructure outlasts any single campaign. +20% volunteer carryover.',
    cost: 3,
    effect: { type: 'volunteer_carry', value: 0.20 },
    unlockAfterPrestiges: 1,
  },
  {
    id: 'p_political_dynasty',
    name: 'Political Dynasty',
    description: 'Your family name is the brand. +15% to all carryover.',
    cost: 6,
    effect: { type: 'all_carry', value: 0.15 },
    unlockAfterPrestiges: 2,
  },
  {
    id: 'p_iron_curtain',
    name: 'Iron Curtain',
    description: 'Your organization is a fortress. +25% to all carryover.',
    cost: 10,
    effect: { type: 'all_carry', value: 0.25 },
    unlockAfterPrestiges: 4,
  },

  // ── Production / bonus upgrades ────────────────────────────────────────
  {
    id: 'p_incumbent_advantage',
    name: 'Incumbent Advantage',
    description: 'Winning changes how people see you. Permanent ×1.5 to all production.',
    cost: 4,
    effect: { type: 'production_mult', value: 1.5 },
    unlockAfterPrestiges: 1,
  },
  {
    id: 'p_donor_network',
    name: 'Donor Network',
    description: 'Your Rolodex grows with every race. Permanent cash rate ×2.',
    cost: 4,
    effect: { type: 'cash_rate_mult', value: 2 },
    unlockAfterPrestiges: 1,
  },
  {
    id: 'p_grassroots_brand',
    name: 'Grassroots Brand',
    description: 'People open the door before you knock. Permanent ×2 click supporters.',
    cost: 2,
    effect: { type: 'click_mult', value: 2 },
    unlockAfterPrestiges: 0,
  },
  {
    id: 'p_movement_infrastructure',
    name: 'Movement Infrastructure',
    description: 'Offices, data, and staff that span campaigns. Permanent ×2.5 all production.',
    cost: 8,
    effect: { type: 'production_mult', value: 2.5 },
    unlockAfterPrestiges: 3,
  },
  {
    id: 'p_super_donor',
    name: 'Super Donor Relationships',
    description: 'You\'re in the Rolodex of the real power brokers. Cash rate ×4.',
    cost: 8,
    effect: { type: 'cash_rate_mult', value: 4 },
    unlockAfterPrestiges: 3,
  },
]

export const PRESTIGE_UPGRADES_BY_ID: Record<string, PrestigeUpgradeDef> = Object.fromEntries(
  PRESTIGE_UPGRADES.map((u) => [u.id, u])
)

// Compute total carryover rates from purchased prestige upgrades
export function getCarryoverRates(purchasedPrestigeUpgrades: Record<string, boolean>): {
  supporters: number
  cash: number
  volunteers: number
} {
  let supporters = 0
  let cash = 0
  let volunteers = 0

  for (const [id, purchased] of Object.entries(purchasedPrestigeUpgrades)) {
    if (!purchased) continue
    const def = PRESTIGE_UPGRADES_BY_ID[id]
    if (!def) continue
    const e = def.effect
    if (e.type === 'supporter_carry') supporters += e.value
    else if (e.type === 'cash_carry') cash += e.value
    else if (e.type === 'volunteer_carry') volunteers += e.value
    else if (e.type === 'all_carry') { supporters += e.value; cash += e.value; volunteers += e.value }
  }

  return {
    supporters: Math.min(supporters, 0.95),
    cash: Math.min(cash, 0.95),
    volunteers: Math.min(volunteers, 0.95),
  }
}

// Permanent production multiplier from prestige upgrades (applied in selectors)
export function getPrestigeProductionMult(purchasedPrestigeUpgrades: Record<string, boolean>): number {
  let mult = 1
  for (const [id, purchased] of Object.entries(purchasedPrestigeUpgrades)) {
    if (!purchased) continue
    const def = PRESTIGE_UPGRADES_BY_ID[id]
    if (def?.effect.type === 'production_mult') mult *= def.effect.value
  }
  return mult
}

export function getPrestigeCashRateMult(purchasedPrestigeUpgrades: Record<string, boolean>): number {
  let mult = 1
  for (const [id, purchased] of Object.entries(purchasedPrestigeUpgrades)) {
    if (!purchased) continue
    const def = PRESTIGE_UPGRADES_BY_ID[id]
    if (def?.effect.type === 'cash_rate_mult') mult *= def.effect.value
  }
  return mult
}

export function getPrestigeClickMult(purchasedPrestigeUpgrades: Record<string, boolean>): number {
  let mult = 1
  for (const [id, purchased] of Object.entries(purchasedPrestigeUpgrades)) {
    if (!purchased) continue
    const def = PRESTIGE_UPGRADES_BY_ID[id]
    if (def?.effect.type === 'click_mult') mult *= def.effect.value
  }
  return mult
}
