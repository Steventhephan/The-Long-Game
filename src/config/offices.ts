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
    rivalRatePrimary: 25,  // TUNING TARGET: effective ~20.6/s; tap+crits alone (~14.4/s) loses; 2 canvassers flip it
    rivalRateGeneral: 50,  // TUNING TARGET: 2× primary; generals are longer + player has carry-over gens, needs higher rate to maintain pressure
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
    rivalRatePrimary: 65,  // TUNING TARGET (~2.6× CC primary)
    rivalRateGeneral: 130, // TUNING TARGET (2× primary)
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
    rivalRatePrimary: 160, // TUNING TARGET (~2.5× Mayor; first era wall — 2 rivals, tight pool ceiling)
    rivalRateGeneral: 295, // TUNING TARGET (~1.85× primary; capped by pool-feasibility ceiling at this tier)
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
    rivalRateGeneral: 800, // TUNING TARGET (2× primary)
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
    rivalRateGeneral: 1875, // TUNING TARGET (~1.9× primary; capped near pool-feasibility ceiling at this tier)
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
    rivalRateGeneral: 4900, // TUNING TARGET (2× primary)
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
    rivalRateGeneral: 12250, // TUNING TARGET (2× primary)
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
    rivalRateGeneral: 30600, // TUNING TARGET (2× primary)
    unlocks: ['national_media_team', 'super_pac'],
  },
];

export function getOffice(index: number): OfficeDef {
  const o = OFFICES.find(o => o.index === index);
  if (!o) throw new Error(`No office at index ${index}`);
  return o;
}

export const MAX_OFFICE_INDEX = 7;
