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
    rivalRatePrimary: 50,  // TUNING TARGET: effective ~43.75/s vs player tap 38.6/s (stack~1.79, no lean filter); pure tapping loses; 2 canvassers (4.47/s each) flip it
    rivalRateGeneral: 70,  // TUNING TARGET: effective ~66/s; with FIELD_OUT_0=2.5, 6 canvassers (26.8/s) + tap (38.6/s) = 65.4 → genuine fight; more generators needed to win comfortably
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
    rivalRatePrimary: 150, // TUNING TARGET: effective ~139.5/s (6 blocs, Sam Rivera mult ~0.930); 3 PBs+10c passive (111.9/s) loses; tap+generators barely wins (163.4/s)
    rivalRateGeneral: 210, // TUNING TARGET: effective ~236/s (Morgan Hayes mult ~1.124); player must build 6 phone banks mid-race while tapping throughout 126s timer
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
    rivalRatePrimary: 250, // TUNING TARGET: combined effective ~460/s (2 rivals, 9 blocs); heavy carry-over (~391/s passive) still loses; 1-2 Regional Offices ($9,600) required to win
    rivalRateGeneral: 413, // TUNING TARGET: pending playtest with new primary
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
    rivalRatePrimary: 400, // TUNING TARGET (~2.5× County)
    rivalRateGeneral: 1120, // TUNING TARGET (2.8× primary)
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
    rivalRatePrimary: 985,  // TUNING TARGET (~2.5× County Exec; second era wall — 3 rivals)
    rivalRateGeneral: 2625, // TUNING TARGET (2.8× primary; feasibility headroom maintained by player's stealing mechanic)
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
    rivalRatePrimary: 2450, // TUNING TARGET (~2.5× State Leg)
    rivalRateGeneral: 6860, // TUNING TARGET (2.8× primary)
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
    rivalRatePrimary: 6125, // TUNING TARGET (~2.5× Governor)
    rivalRateGeneral: 17150, // TUNING TARGET (2.8× primary)
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
    rivalRatePrimary: 15300, // TUNING TARGET (~2.5× Senate)
    rivalRateGeneral: 42840, // TUNING TARGET (2.8× primary)
    unlocks: ['national_media_team', 'super_pac'],
  },
];

export function getOffice(index: number): OfficeDef {
  const o = OFFICES.find(o => o.index === index);
  if (!o) throw new Error(`No office at index ${index}`);
  return o;
}

export const MAX_OFFICE_INDEX = 7;
