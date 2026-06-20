import type { InterestGroupDef } from '../types';

// Full 14 interest-group blocs from Policy, Platform & Interest Groups — Roster B.
// All 14 participate in every election; their primaryWeight/generalWeight produce
// the partisan/moderate squeeze automatically (partisan blocs heavy in primaries,
// moderate blocs heavy in generals).
//
// Weight scale: VeryHigh=5, High=3, Med=2, Low=1
// priorityIssues: the issues each group cares about most + their preferred scalar.

export const INTEREST_GROUPS: InterestGroupDef[] = [
  // ── Left ──────────────────────────────────────────────────────────────────
  {
    groupId: 'labor_unions',
    name: 'Labor Unions',
    lean: -0.8,
    priorityIssues: [
      { issueId: 'small_business', preferredScalar: -1 },
      { issueId: 'healthcare',     preferredScalar: -1 },
      { issueId: 'taxes_spending', preferredScalar: -1 },
    ],
    primaryWeight: 3, generalWeight: 2,
  },
  {
    groupId: 'environmental_groups',
    name: 'Environmental Groups',
    lean: -0.9,
    priorityIssues: [
      { issueId: 'energy_environment', preferredScalar: -1 },
      { issueId: 'transit',            preferredScalar: -1 },
    ],
    primaryWeight: 3, generalWeight: 1,
  },
  {
    groupId: 'civil_liberties',
    name: 'Civil-Liberties Advocates',
    lean: -0.85,
    priorityIssues: [
      { issueId: 'social_policy', preferredScalar: -1 },
      { issueId: 'policing',      preferredScalar: -1 },
    ],
    primaryWeight: 3, generalWeight: 1,
  },

  // ── Center-Left ───────────────────────────────────────────────────────────
  {
    groupId: 'teachers',
    name: 'Teachers',
    lean: -0.5,
    priorityIssues: [
      { issueId: 'education',      preferredScalar: -1 },
      { issueId: 'property_taxes', preferredScalar: -1 },
    ],
    primaryWeight: 2, generalWeight: 2,
  },
  {
    groupId: 'tech_workers',
    name: 'Tech / Knowledge Workers',
    lean: -0.4,
    priorityIssues: [
      { issueId: 'energy_environment', preferredScalar: -1 },
      { issueId: 'immigration',        preferredScalar: -1 },
      { issueId: 'social_policy',      preferredScalar: -1 },
    ],
    primaryWeight: 1, generalWeight: 2,
  },

  // ── Center ────────────────────────────────────────────────────────────────
  {
    groupId: 'healthcare_industry',
    name: 'Healthcare Industry',
    lean: 0.0,
    priorityIssues: [
      { issueId: 'healthcare',     preferredScalar: 0 },
      { issueId: 'taxes_spending', preferredScalar: 0 },
    ],
    primaryWeight: 1, generalWeight: 3,
  },
  {
    groupId: 'retirees_seniors',
    name: 'Retirees / Seniors',
    lean: 0.1,
    priorityIssues: [
      { issueId: 'healthcare',     preferredScalar: 0 },
      { issueId: 'taxes_spending', preferredScalar: 0 },
      { issueId: 'social_policy',  preferredScalar: 0 },
    ],
    primaryWeight: 2, generalWeight: 3,
  },
  {
    groupId: 'suburban_moderates',
    name: 'Suburban Moderates / Independents',
    lean: 0.0,
    priorityIssues: [
      { issueId: 'property_taxes', preferredScalar: 0 },
      { issueId: 'policing',       preferredScalar: 0 },
      { issueId: 'social_policy',  preferredScalar: 0 },
    ],
    primaryWeight: 1, generalWeight: 5,
  },

  // ── Center-Right ──────────────────────────────────────────────────────────
  {
    groupId: 'small_business_owners',
    name: 'Small Business Owners',
    lean: 0.5,
    priorityIssues: [
      { issueId: 'small_business', preferredScalar: 1 },
      { issueId: 'property_taxes', preferredScalar: 1 },
      { issueId: 'development',    preferredScalar: 1 },
    ],
    primaryWeight: 2, generalWeight: 3,
  },
  {
    groupId: 'farmers_agriculture',
    name: 'Farmers / Agriculture',
    lean: 0.5,
    priorityIssues: [
      { issueId: 'transit',            preferredScalar: 1 },
      { issueId: 'energy_environment', preferredScalar: 0 },
      { issueId: 'immigration',        preferredScalar: 0 },
    ],
    primaryWeight: 2, generalWeight: 2,
  },

  // ── Right ─────────────────────────────────────────────────────────────────
  {
    groupId: 'energy_industry',
    name: 'Energy / Industry',
    lean: 0.9,
    priorityIssues: [
      { issueId: 'energy_environment', preferredScalar: 1 },
      { issueId: 'taxes_spending',     preferredScalar: 1 },
    ],
    primaryWeight: 3, generalWeight: 1,
  },
  {
    groupId: 'law_enforcement',
    name: 'Law Enforcement',
    lean: 0.8,
    priorityIssues: [
      { issueId: 'policing', preferredScalar: 1 },
      { issueId: 'guns',     preferredScalar: 1 },
    ],
    primaryWeight: 3, generalWeight: 2,
  },
  {
    groupId: 'faith_community',
    name: 'Faith & Community Groups',
    lean: 0.85,
    priorityIssues: [
      { issueId: 'social_policy', preferredScalar: 1 },
      { issueId: 'education',     preferredScalar: 1 },
    ],
    primaryWeight: 3, generalWeight: 1,
  },
  {
    groupId: 'developers_real_estate',
    name: 'Developers / Real Estate',
    lean: 0.6,
    priorityIssues: [
      { issueId: 'development',   preferredScalar: 1 },
      { issueId: 'property_taxes', preferredScalar: 1 },
    ],
    primaryWeight: 2, generalWeight: 2,
  },
];

// Legacy 2-bloc export removed — use INTEREST_GROUPS everywhere.
// gameState.ts passes INTEREST_GROUPS to initElection.
