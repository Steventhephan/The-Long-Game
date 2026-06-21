import type { AbilityDef } from '../types';

// Abilities unlock at State era (officeIndex 4+) unless noted.
// baseCost scales by BAL.timerGrowth^officeIndex at point of use.
// baseCooldown is in seconds.

export const ABILITIES: AbilityDef[] = [
  {
    id: 'puffpiece',
    name: 'Puff Piece',
    description: 'A flattering news segment — +40% conversion rate for 15s',
    category: 'boost',
    baseCost: 200,
    baseCooldown: 45,
    effectDuration: 15,
    effectMagnitude: 1.4,
    target: 'self',
    unlockOfficeIndex: 4,
  },
  {
    id: 'fundraiser',
    name: 'Fundraiser',
    description: 'Emergency cash push — instantly gain $600 (scales with office)',
    category: 'boost',
    baseCost: 150,
    baseCooldown: 60,
    effectMagnitude: 4,  // cash gain = baseCost × 4 (net +450 after cost)
    target: 'self',
    unlockOfficeIndex: 4,
  },
  {
    id: 'court_interest_group',
    name: 'Court Interest Group',
    description: 'Personal outreach to a bloc — +0.4 support for 20s (pick a bloc)',
    category: 'boost',
    baseCost: 250,
    baseCooldown: 50,
    effectDuration: 20,
    effectMagnitude: 0.4,
    target: 'bloc',
    unlockOfficeIndex: 4,
  },
  {
    id: 'ad_blitz',
    name: 'Ad Blitz',
    description: 'Saturate the airwaves — +60% conversion rate for 12s',
    category: 'boost',
    baseCost: 500,
    baseCooldown: 90,
    effectDuration: 12,
    effectMagnitude: 1.6,
    target: 'self',
    unlockOfficeIndex: 4,
  },
  {
    id: 'grassroots_surge',
    name: 'Grassroots Surge',
    description: 'Rally volunteers — +50% conversion rate for 20s (Governor+)',
    category: 'boost',
    baseCost: 400,
    baseCooldown: 75,
    effectDuration: 20,
    effectMagnitude: 1.5,
    target: 'self',
    unlockOfficeIndex: 5,
  },
  {
    id: 'hitpiece',
    name: 'Hit Piece',
    description: 'Opposition research — target rival converts 50% slower for 20s',
    category: 'offensive',
    baseCost: 300,
    baseCooldown: 60,
    effectDuration: 20,
    effectMagnitude: 0.5,
    target: 'rival',
    unlockOfficeIndex: 4,
  },
];

export function abilitiesForOffice(officeIndex: number): AbilityDef[] {
  return ABILITIES.filter(a => a.unlockOfficeIndex <= officeIndex);
}

export function getAbility(id: string): AbilityDef | undefined {
  return ABILITIES.find(a => a.id === id);
}
