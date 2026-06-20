import type { OfficeDef } from '../types';
import { BAL } from './balance';

// Phase 1: City Council only. Additional offices added in Phase 6.
export const OFFICES: OfficeDef[] = [
  {
    id: 'city_council',
    name: 'City Council',
    era: 'local',
    index: 0,
    generalPool: BAL.poolBase,
    primaryPool: Math.round(BAL.poolBase * BAL.primaryPoolRatio),
    rivalCount: 1,
    unlocks: ['canvasser', 'small_dollar_drive'],
  },
];

export function getOffice(index: number): OfficeDef {
  const o = OFFICES.find(o => o.index === index);
  if (!o) throw new Error(`No office at index ${index}`);
  return o;
}
