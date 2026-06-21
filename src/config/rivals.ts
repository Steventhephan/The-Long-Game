import type { RivalStaticDef } from '../types';

// Archetype identifiers match Opposition & Conflict design doc.
// conversionMod: multiplier on the office's rivalRate for this rival.
// strongBlocs/weakBlocs: groupIds where rival gets ±50% rate bonus/penalty on top of lean-match.

// Kept for Header.svelte backward-compat until Header is updated to use RivalState.name.
export const CITY_COUNCIL_RIVALS: RivalStaticDef[] = [
  { archetypeId: 'career_politician', name: 'Jordan Kim', lean: 0.2, conversionMod: 1.0, strongBlocs: [], weakBlocs: [] },
];

// Per-office rivals, separate primary vs. general lists.
// Primary: same-side rivals (within-party feel); General: cross-party (opposing side).
const RIVALS: Record<number, { primary: RivalStaticDef[]; general: RivalStaticDef[] }> = {
  // City Council (Local, 1 rival)
  0: {
    primary: [
      { archetypeId: 'career_politician', name: 'Jordan Kim', lean: 0.2, conversionMod: 1.0, strongBlocs: [], weakBlocs: [] },
    ],
    general: [
      { archetypeId: 'establishment_favorite', name: 'Blake Roberts', lean: 0.6, conversionMod: 1.1,
        strongBlocs: ['suburban_moderates', 'retirees_seniors'], weakBlocs: ['labor_unions', 'civil_liberties'] },
    ],
  },

  // Mayor (Local, 1 rival)
  1: {
    primary: [
      { archetypeId: 'radical_insurgent', name: 'Sam Rivera', lean: -0.5, conversionMod: 1.1,
        strongBlocs: ['labor_unions', 'environmental_groups'], weakBlocs: ['suburban_moderates', 'small_business_owners'] },
    ],
    general: [
      { archetypeId: 'establishment_favorite', name: 'Morgan Hayes', lean: 0.6, conversionMod: 1.2,
        strongBlocs: ['suburban_moderates', 'retirees_seniors', 'small_business_owners'], weakBlocs: ['labor_unions', 'environmental_groups'] },
    ],
  },

  // County Council (County, 2 rivals)
  2: {
    primary: [
      { archetypeId: 'career_politician', name: 'Alex Vega', lean: 0.1, conversionMod: 1.0, strongBlocs: [], weakBlocs: [] },
      { archetypeId: 'radical_insurgent', name: 'Jamie Torres', lean: -0.7, conversionMod: 1.1,
        strongBlocs: ['labor_unions', 'civil_liberties', 'environmental_groups'], weakBlocs: ['suburban_moderates', 'small_business_owners'] },
    ],
    general: [
      { archetypeId: 'establishment_favorite', name: 'Casey Andrews', lean: 0.6, conversionMod: 1.2,
        strongBlocs: ['suburban_moderates', 'small_business_owners', 'retirees_seniors'], weakBlocs: ['civil_liberties'] },
      { archetypeId: 'single_issue_crusader', name: 'Pat Coleman', lean: 0.85, conversionMod: 0.8,
        strongBlocs: ['law_enforcement', 'faith_community'], weakBlocs: ['labor_unions', 'environmental_groups', 'civil_liberties'] },
    ],
  },

  // County Executive (County, 2 rivals)
  3: {
    primary: [
      { archetypeId: 'career_politician', name: 'Chris Mendez', lean: 0.2, conversionMod: 1.0, strongBlocs: [], weakBlocs: [] },
      { archetypeId: 'charismatic_outsider', name: 'Taylor Reed', lean: 0.0, conversionMod: 1.1, strongBlocs: [], weakBlocs: [] },
    ],
    general: [
      { archetypeId: 'self_funding_mogul', name: 'Drew Mitchell', lean: 0.5, conversionMod: 1.3,
        strongBlocs: ['small_business_owners', 'developers_real_estate', 'healthcare_industry'], weakBlocs: ['labor_unions', 'civil_liberties'] },
      { archetypeId: 'establishment_favorite', name: 'Robin Walsh', lean: 0.7, conversionMod: 1.2,
        strongBlocs: ['suburban_moderates', 'retirees_seniors'], weakBlocs: ['civil_liberties', 'environmental_groups'] },
    ],
  },

  // State Legislature (State, 3 rivals)
  4: {
    primary: [
      { archetypeId: 'career_politician', name: 'Morgan Hill', lean: 0.1, conversionMod: 1.0, strongBlocs: [], weakBlocs: [] },
      { archetypeId: 'radical_insurgent', name: 'Alex Park', lean: -0.6, conversionMod: 1.2,
        strongBlocs: ['labor_unions', 'civil_liberties', 'environmental_groups'], weakBlocs: ['suburban_moderates', 'small_business_owners', 'healthcare_industry'] },
      { archetypeId: 'charismatic_outsider', name: 'Sam Torres', lean: -0.1, conversionMod: 1.1, strongBlocs: [], weakBlocs: [] },
    ],
    general: [
      { archetypeId: 'establishment_favorite', name: 'Casey Brooks', lean: 0.6, conversionMod: 1.2,
        strongBlocs: ['suburban_moderates', 'retirees_seniors'], weakBlocs: ['civil_liberties', 'environmental_groups'] },
      { archetypeId: 'self_funding_mogul', name: 'Jamie Reid', lean: 0.4, conversionMod: 1.4,
        strongBlocs: ['small_business_owners', 'developers_real_estate', 'healthcare_industry'], weakBlocs: ['labor_unions'] },
      { archetypeId: 'single_issue_crusader', name: 'Blake Foster', lean: 0.9, conversionMod: 0.7,
        strongBlocs: ['law_enforcement', 'faith_community'], weakBlocs: ['labor_unions', 'civil_liberties', 'environmental_groups', 'tech_workers'] },
    ],
  },

  // Governor (State, 3 rivals)
  5: {
    primary: [
      { archetypeId: 'career_politician', name: 'Jordan Ellis', lean: 0.2, conversionMod: 1.0, strongBlocs: [], weakBlocs: [] },
      { archetypeId: 'radical_insurgent', name: 'Charlie Kim', lean: -0.7, conversionMod: 1.2,
        strongBlocs: ['labor_unions', 'environmental_groups', 'civil_liberties'], weakBlocs: ['suburban_moderates', 'small_business_owners', 'healthcare_industry'] },
      { archetypeId: 'charismatic_outsider', name: 'Drew Santos', lean: -0.2, conversionMod: 1.2, strongBlocs: [], weakBlocs: [] },
    ],
    general: [
      { archetypeId: 'establishment_favorite', name: 'Pat Richardson', lean: 0.7, conversionMod: 1.3,
        strongBlocs: ['suburban_moderates', 'small_business_owners', 'retirees_seniors'], weakBlocs: ['civil_liberties', 'environmental_groups'] },
      { archetypeId: 'self_funding_mogul', name: 'Morgan Chase', lean: 0.5, conversionMod: 1.5,
        strongBlocs: ['developers_real_estate', 'healthcare_industry', 'small_business_owners'], weakBlocs: ['labor_unions'] },
      { archetypeId: 'single_issue_crusader', name: 'Riley Thompson', lean: 0.9, conversionMod: 0.8,
        strongBlocs: ['law_enforcement', 'faith_community', 'energy_industry'], weakBlocs: ['labor_unions', 'civil_liberties', 'environmental_groups'] },
    ],
  },

  // Senate (Federal, 4 rivals)
  6: {
    primary: [
      { archetypeId: 'career_politician', name: 'Alex Washington', lean: 0.15, conversionMod: 1.0, strongBlocs: [], weakBlocs: [] },
      { archetypeId: 'radical_insurgent', name: 'Sam Monroe', lean: -0.8, conversionMod: 1.2,
        strongBlocs: ['labor_unions', 'civil_liberties', 'environmental_groups'], weakBlocs: ['suburban_moderates', 'small_business_owners', 'healthcare_industry'] },
      { archetypeId: 'charismatic_outsider', name: 'Chris Nixon', lean: -0.2, conversionMod: 1.2, strongBlocs: [], weakBlocs: [] },
      { archetypeId: 'career_politician', name: 'Jordan Carter', lean: 0.3, conversionMod: 1.0, strongBlocs: [], weakBlocs: [] },
    ],
    general: [
      { archetypeId: 'establishment_favorite', name: 'Casey Harrison', lean: 0.7, conversionMod: 1.3,
        strongBlocs: ['suburban_moderates', 'retirees_seniors', 'healthcare_industry'], weakBlocs: ['civil_liberties', 'environmental_groups'] },
      { archetypeId: 'self_funding_mogul', name: 'Morgan Tyler', lean: 0.5, conversionMod: 1.5,
        strongBlocs: ['developers_real_estate', 'small_business_owners', 'healthcare_industry'], weakBlocs: ['labor_unions'] },
      { archetypeId: 'single_issue_crusader', name: 'Blake Jackson', lean: 0.85, conversionMod: 0.8,
        strongBlocs: ['law_enforcement', 'faith_community'], weakBlocs: ['labor_unions', 'civil_liberties', 'environmental_groups', 'tech_workers'] },
      { archetypeId: 'career_politician', name: 'Robin Grant', lean: 0.6, conversionMod: 1.1,
        strongBlocs: ['retirees_seniors', 'suburban_moderates'], weakBlocs: [] },
    ],
  },

  // President (Federal, 4 rivals)
  7: {
    primary: [
      { archetypeId: 'career_politician', name: 'Jordan Pierce', lean: 0.2, conversionMod: 1.0, strongBlocs: [], weakBlocs: [] },
      { archetypeId: 'radical_insurgent', name: 'Alex Hamilton', lean: -0.8, conversionMod: 1.3,
        strongBlocs: ['labor_unions', 'civil_liberties', 'environmental_groups'], weakBlocs: ['suburban_moderates', 'small_business_owners', 'healthcare_industry', 'retirees_seniors'] },
      { archetypeId: 'charismatic_outsider', name: 'Sam Madison', lean: -0.1, conversionMod: 1.3, strongBlocs: [], weakBlocs: [] },
      { archetypeId: 'career_politician', name: 'Chris Jefferson', lean: 0.3, conversionMod: 1.1, strongBlocs: [], weakBlocs: [] },
    ],
    general: [
      { archetypeId: 'establishment_favorite', name: 'Morgan Lincoln', lean: 0.7, conversionMod: 1.4,
        strongBlocs: ['suburban_moderates', 'retirees_seniors', 'small_business_owners'], weakBlocs: ['civil_liberties', 'environmental_groups'] },
      { archetypeId: 'self_funding_mogul', name: 'Riley Reagan', lean: 0.5, conversionMod: 1.6,
        strongBlocs: ['developers_real_estate', 'small_business_owners', 'healthcare_industry', 'energy_industry'], weakBlocs: ['labor_unions', 'civil_liberties'] },
      { archetypeId: 'single_issue_crusader', name: 'Drew Adams', lean: 0.9, conversionMod: 0.9,
        strongBlocs: ['law_enforcement', 'faith_community', 'energy_industry'], weakBlocs: ['labor_unions', 'civil_liberties', 'environmental_groups', 'tech_workers'] },
      { archetypeId: 'career_politician', name: 'Casey Franklin', lean: 0.65, conversionMod: 1.2,
        strongBlocs: ['retirees_seniors', 'suburban_moderates', 'healthcare_industry'], weakBlocs: [] },
    ],
  },
};

export function getRivals(officeIndex: number, phase: 'primary' | 'general'): RivalStaticDef[] {
  return RIVALS[officeIndex]?.[phase] ?? CITY_COUNCIL_RIVALS;
}
