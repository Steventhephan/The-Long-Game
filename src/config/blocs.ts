import type { InterestGroupDef } from '../types';

// Full 14 interest-group blocs from Policy, Platform & Interest Groups — Roster B.
// unlockOfficeIndex controls when each bloc is revealed in the UI (display-only — all
// blocs participate in the pool from the start so the conversion dynamics are stable).
//
// Reveal schedule (one balanced L/C/R set per office pair):
//   0 City Council:    Labor Unions, Suburban Moderates, Small Business Owners
//   1 Mayor:           Environmental Groups, Retirees/Seniors, Law Enforcement
//   2 County Council:  Civil-Liberties, Healthcare Industry, Developers/Real Estate
//   3 County Executive: Teachers, Farmers/Agriculture, Faith & Community
//   4 State Legislature: Tech/Knowledge Workers, Energy/Industry
//
// Weight scale: VeryHigh=5, High=3, Med=2, Low=1

export const INTEREST_GROUPS: InterestGroupDef[] = [
  // ── Left ──────────────────────────────────────────────────────────────────
  {
    groupId: 'labor_unions',
    name: 'Labor Unions',
    shortName: 'Labor Unions',
    lean: -0.8,
    priorityIssues: [
      { issueId: 'small_business', preferredScalar: -1 },
      { issueId: 'healthcare',     preferredScalar: -1 },
      { issueId: 'taxes_spending', preferredScalar: -1 },
    ],
    primaryWeight: 3, generalWeight: 2,
    unlockOfficeIndex: 0,
  },
  {
    groupId: 'environmental_groups',
    name: 'Environmental Groups',
    shortName: 'Environmentalists', // user-approved; may truncate slightly at 90px
    lean: -0.9,
    priorityIssues: [
      { issueId: 'energy_environment', preferredScalar: -1 },
      { issueId: 'transit',            preferredScalar: -1 },
    ],
    primaryWeight: 3, generalWeight: 1,
    unlockOfficeIndex: 1,
  },
  {
    groupId: 'civil_liberties',
    name: 'Civil-Liberties Advocates',
    shortName: 'Civil Rights',
    lean: -0.85,
    priorityIssues: [
      { issueId: 'social_policy', preferredScalar: -1 },
      { issueId: 'policing',      preferredScalar: -1 },
    ],
    primaryWeight: 3, generalWeight: 1,
    unlockOfficeIndex: 2,
  },

  // ── Center-Left ───────────────────────────────────────────────────────────
  {
    groupId: 'teachers',
    name: 'Teachers',
    shortName: 'Teachers',
    lean: -0.5,
    priorityIssues: [
      { issueId: 'education',      preferredScalar: -1 },
      { issueId: 'property_taxes', preferredScalar: -1 },
    ],
    primaryWeight: 2, generalWeight: 2,
    unlockOfficeIndex: 3,
  },
  {
    groupId: 'tech_workers',
    name: 'Tech / Knowledge Workers',
    shortName: 'Big Tech',
    lean: -0.4,
    priorityIssues: [
      { issueId: 'energy_environment', preferredScalar: -1 },
      { issueId: 'immigration',        preferredScalar: -1 },
      { issueId: 'social_policy',      preferredScalar: -1 },
    ],
    primaryWeight: 1, generalWeight: 2,
    unlockOfficeIndex: 4,
  },

  // ── Center ────────────────────────────────────────────────────────────────
  {
    groupId: 'healthcare_industry',
    name: 'Healthcare Industry',
    shortName: 'Healthcare',
    lean: 0.0,
    priorityIssues: [
      { issueId: 'healthcare',     preferredScalar: 0 },
      { issueId: 'taxes_spending', preferredScalar: 0 },
    ],
    primaryWeight: 1, generalWeight: 3,
    unlockOfficeIndex: 2,
  },
  {
    groupId: 'retirees_seniors',
    name: 'Retirees / Seniors',
    shortName: 'Retirees',
    lean: 0.1,
    priorityIssues: [
      { issueId: 'healthcare',     preferredScalar: 0 },
      { issueId: 'taxes_spending', preferredScalar: 0 },
      { issueId: 'social_policy',  preferredScalar: 0 },
    ],
    primaryWeight: 2, generalWeight: 3,
    unlockOfficeIndex: 1,
  },
  {
    groupId: 'suburban_moderates',
    name: 'Suburban Moderates / Independents',
    shortName: 'Suburbanites',
    lean: 0.0,
    priorityIssues: [
      { issueId: 'property_taxes', preferredScalar: 0 },
      { issueId: 'policing',       preferredScalar: 0 },
      { issueId: 'social_policy',  preferredScalar: 0 },
    ],
    primaryWeight: 1, generalWeight: 5,
    unlockOfficeIndex: 0,
  },

  // ── Center-Right ──────────────────────────────────────────────────────────
  {
    groupId: 'small_business_owners',
    name: 'Small Business Owners',
    shortName: 'Small Business',
    lean: 0.5,
    priorityIssues: [
      { issueId: 'small_business', preferredScalar: 1 },
      { issueId: 'property_taxes', preferredScalar: 1 },
      { issueId: 'development',    preferredScalar: 1 },
    ],
    primaryWeight: 2, generalWeight: 3,
    unlockOfficeIndex: 0,
  },
  {
    groupId: 'farmers_agriculture',
    name: 'Farmers / Agriculture',
    shortName: 'Farmers',
    lean: 0.5,
    priorityIssues: [
      { issueId: 'transit',            preferredScalar: 1 },
      { issueId: 'energy_environment', preferredScalar: 0 },
      { issueId: 'immigration',        preferredScalar: 0 },
    ],
    primaryWeight: 2, generalWeight: 2,
    unlockOfficeIndex: 3,
  },

  // ── Right ─────────────────────────────────────────────────────────────────
  {
    groupId: 'energy_industry',
    name: 'Energy / Industry',
    shortName: 'Corporations',
    lean: 0.9,
    priorityIssues: [
      { issueId: 'energy_environment', preferredScalar: 1 },
      { issueId: 'taxes_spending',     preferredScalar: 1 },
    ],
    primaryWeight: 3, generalWeight: 1,
    unlockOfficeIndex: 4,
  },
  {
    groupId: 'law_enforcement',
    name: 'Law Enforcement',
    shortName: 'Public Safety',
    lean: 0.8,
    priorityIssues: [
      { issueId: 'policing', preferredScalar: 1 },
      { issueId: 'guns',     preferredScalar: 1 },
    ],
    primaryWeight: 3, generalWeight: 2,
    unlockOfficeIndex: 1,
  },
  {
    groupId: 'faith_community',
    name: 'Faith & Community Groups',
    shortName: 'Religious',
    lean: 0.85,
    priorityIssues: [
      { issueId: 'social_policy', preferredScalar: 1 },
      { issueId: 'education',     preferredScalar: 1 },
    ],
    primaryWeight: 3, generalWeight: 1,
    unlockOfficeIndex: 3,
  },
  {
    groupId: 'developers_real_estate',
    name: 'Developers / Real Estate',
    shortName: 'Developers',
    lean: 0.6,
    priorityIssues: [
      { issueId: 'development',    preferredScalar: 1 },
      { issueId: 'property_taxes', preferredScalar: 1 },
    ],
    primaryWeight: 2, generalWeight: 2,
    unlockOfficeIndex: 2,
  },
];

export function blocsUnlockedForOffice(officeIndex: number): InterestGroupDef[] {
  return INTEREST_GROUPS.filter(g => g.unlockOfficeIndex <= officeIndex);
}
