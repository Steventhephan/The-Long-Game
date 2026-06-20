import type { OfficeDef } from '../types';
import { BAL } from './balance';

function pool(index: number): number {
  return Math.round(BAL.poolBase * BAL.poolGrowth ** index);
}

// rivalRatePrimary / rivalRateGeneral are TUNING TARGETs for all offices.
// Calibration: rivalRate × leanMatchAvg(~0.825) ≈ expected player voters/sec at that tier.
// Primary and general can differ — generals tend to have a wider pool and longer timer,
// so the rival may need a different rate to keep the same feel.
export const OFFICES: OfficeDef[] = [
  {
    id: 'city_council',
    name: 'City Council',
    era: 'local',
    index: 0,
    generalPool: pool(0),
    primaryPool: Math.round(pool(0) * BAL.primaryPoolRatio),
    rivalCount: 1,
    rivalRatePrimary: 30,  // calibrated — primary feels right, do not change without re-testing
    rivalRateGeneral: 26,  // reduced from 30: playtest showed 30 forced a runoff every general
    unlocks: ['canvasser', 'small_dollar_drive'],
  },
  {
    id: 'mayor',
    name: 'Mayor',
    era: 'local',
    index: 1,
    generalPool: pool(1),
    primaryPool: Math.round(pool(1) * BAL.primaryPoolRatio),
    rivalCount: 1,
    rivalRatePrimary: 75,  // TUNING TARGET
    rivalRateGeneral: 75,  // TUNING TARGET
    unlocks: ['phone_bank', 'email_fundraising'],
  },
  {
    id: 'county_council',
    name: 'County Council',
    era: 'county',
    index: 2,
    generalPool: pool(2),
    primaryPool: Math.round(pool(2) * BAL.primaryPoolRatio),
    rivalCount: 2,
    rivalRatePrimary: 190, // TUNING TARGET
    rivalRateGeneral: 190, // TUNING TARGET
    unlocks: ['regional_office', 'donor_dinner'],
  },
  {
    id: 'county_executive',
    name: 'County Executive',
    era: 'county',
    index: 3,
    generalPool: pool(3),
    primaryPool: Math.round(pool(3) * BAL.primaryPoolRatio),
    rivalCount: 2,
    rivalRatePrimary: 475, // TUNING TARGET
    rivalRateGeneral: 475, // TUNING TARGET
    unlocks: ['campaign_bus', 'bundler_network'],
  },
  {
    id: 'state_legislature',
    name: 'State Legislature',
    era: 'state',
    index: 4,
    generalPool: pool(4),
    primaryPool: Math.round(pool(4) * BAL.primaryPoolRatio),
    rivalCount: 3,
    rivalRatePrimary: 1200, // TUNING TARGET
    rivalRateGeneral: 1200, // TUNING TARGET
    unlocks: ['rally_tour', 'national_fundraising'],
  },
  {
    id: 'governor',
    name: 'Governor',
    era: 'state',
    index: 5,
    generalPool: pool(5),
    primaryPool: Math.round(pool(5) * BAL.primaryPoolRatio),
    rivalCount: 3,
    rivalRatePrimary: 3000, // TUNING TARGET
    rivalRateGeneral: 3000, // TUNING TARGET
    unlocks: ['tv_ad_spot', 'corporate_sponsorships'],
  },
  {
    id: 'senate',
    name: 'Senate',
    era: 'federal',
    index: 6,
    generalPool: pool(6),
    primaryPool: Math.round(pool(6) * BAL.primaryPoolRatio),
    rivalCount: 4,
    rivalRatePrimary: 7500, // TUNING TARGET
    rivalRateGeneral: 7500, // TUNING TARGET
    unlocks: ['micro_targeting', 'lobbyist_alliance'],
  },
  {
    id: 'president',
    name: 'President',
    era: 'federal',
    index: 7,
    generalPool: pool(7),
    primaryPool: Math.round(pool(7) * BAL.primaryPoolRatio),
    rivalCount: 4,
    rivalRatePrimary: 18500, // TUNING TARGET
    rivalRateGeneral: 18500, // TUNING TARGET
    unlocks: ['national_media_team', 'super_pac'],
  },
];

export function getOffice(index: number): OfficeDef {
  const o = OFFICES.find(o => o.index === index);
  if (!o) throw new Error(`No office at index ${index}`);
  return o;
}

export const MAX_OFFICE_INDEX = 7;
