import type { IdeologyDef } from '../types';

// Five ideology designations from Policy, Platform & Interest Groups — Roster C.
// Emergent from mean(stances) on [-1, +1]. Bonuses/maluses are mirror-symmetric
// so every ideology path is equally winnable (Pillar 5b).
// blocModifiers: multiplier deltas on per-bloc support (0.5 = +50%, -0.4 = -40%).

export const IDEOLOGIES: IdeologyDef[] = [
  {
    id: 'progressive',
    label: 'Progressive',
    axisMin: -1.01, axisMax: -0.60,
    blocModifiers: {
      // Bonus: left base blocs
      labor_unions:        0.50,
      environmental_groups: 0.50,
      civil_liberties:     0.50,
      // Malus: right blocs
      energy_industry:    -0.40,
      law_enforcement:    -0.40,
      faith_community:    -0.40,
    },
  },
  {
    id: 'liberal',
    label: 'Liberal',
    axisMin: -0.60, axisMax: -0.20,
    blocModifiers: {
      // Bonus: center-left blocs
      teachers:     0.25,
      tech_workers: 0.25,
      // Malus: right blocs
      energy_industry: -0.20,
      law_enforcement: -0.20,
      faith_community: -0.20,
    },
  },
  {
    id: 'moderate',
    label: 'Moderate',
    axisMin: -0.20, axisMax: 0.20,
    blocModifiers: {
      // Bonus: general-dominant moderates
      suburban_moderates: 0.40,
      retirees_seniors:   0.40,
      // Malus: partisan base blocs on both sides (harder primaries)
      labor_unions:            -0.25,
      environmental_groups:    -0.25,
      civil_liberties:         -0.25,
      energy_industry:         -0.25,
      law_enforcement:         -0.25,
      faith_community:         -0.25,
    },
  },
  {
    id: 'conservative',
    label: 'Conservative',
    axisMin: 0.20, axisMax: 0.60,
    blocModifiers: {
      // Bonus: center-right blocs
      small_business_owners: 0.25,
      farmers_agriculture:   0.25,
      // Malus: left blocs
      labor_unions:        -0.20,
      environmental_groups: -0.20,
      civil_liberties:     -0.20,
    },
  },
  {
    id: 'hard_liner',
    label: 'Hard-liner',
    axisMin: 0.60, axisMax: 1.01,
    blocModifiers: {
      // Bonus: right base blocs
      energy_industry:  0.50,
      law_enforcement:  0.50,
      faith_community:  0.50,
      // Malus: left blocs
      labor_unions:        -0.40,
      environmental_groups: -0.40,
      civil_liberties:     -0.40,
    },
  },
];

export function getIdeology(position: number): IdeologyDef {
  return IDEOLOGIES.find(i => position >= i.axisMin && position < i.axisMax)
    ?? IDEOLOGIES[2]; // fallback to Moderate
}
