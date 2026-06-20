import type { BlocStaticDef } from '../types';

// Interest-group blocs from Policy, Platform & Interest Groups — Roster B.
// Phase 1: 2 blocs for City Council. Full roster added in Phase 3.
// Weights are relative (normalized to 1.0 at runtime); Pri/Gen reflect the
// partisan-vs-moderate squeeze defined in the design.

export const CITY_COUNCIL_BLOCS: BlocStaticDef[] = [
  {
    groupId: 'labor_unions',
    name: 'Labor Unions',
    lean: -0.8,         // Left
    primaryWeight: 3,   // High in primaries (partisan base bloc)
    generalWeight: 2,   // Medium in generals
  },
  {
    groupId: 'suburban_moderates',
    name: 'Suburban Moderates & Independents',
    lean: 0.0,          // Center
    primaryWeight: 1,   // Low in primaries
    generalWeight: 3,   // Very High in generals
  },
];
