export type Num = number; // swap to Decimal later if needed
export type Era = 'local' | 'county' | 'state' | 'federal';
export type Track = 'field' | 'finance';

export interface BlocState {
  groupId: string;
  lean: number; // -1 (left) to 1 (right)
  totalVoters: Num;
  undecided: Num;
  player: Num;
  rivals: Num[];
}

export interface RivalState {
  archetypeId: string;
  lean: number;
  share: Num;
  eliminated: boolean;
}

export interface GameState {
  version: number;
  rngSeed: number;

  // run — resets on loss:
  cash: Num;
  voters: Num;
  generators: Record<string, number>; // id → owned count
  upgrades: string[];
  charisma: number;
  volunteers: Num;
  platform: Record<string, string>; // issueId → stanceId
  blocSupport: Record<string, number>; // groupId → support multiplier
  officeIndex: number;
  rivalRate: number;           // voters/sec total for rivals — set per office, read by tick()
  phase: 'primary' | 'general';
  timerRemaining: number;
  isRunoff: boolean;
  blocs: BlocState[];
  rivals: RivalState[];

  // meta — persists across runs:
  prestige: number;
  perks: string[];
  achievements: string[];
  globalMultiplier: number;

  // transient UI signals — not persisted:
  lastCritHit: boolean;
  electionResult: 'none' | 'win' | 'lose' | 'runoff_start' | 'runoff_win' | 'runoff_lose';
}

// --- Effect / upgrade types ---

export type EffectSpec =
  | { kind: 'tapMult';     value: number }   // multiplies tap voter + cash yield
  | { kind: 'critChance';  value: number }   // additive bonus to base crit chance
  | { kind: 'fieldMult';   value: number }   // multiplies all Field generator output
  | { kind: 'financeMult'; value: number };  // multiplies all Finance generator output

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  category: 'tap' | 'field' | 'finance' | 'synergy' | 'ability' | 'group' | 'fork';
  cost: Num;
  effect: EffectSpec;
  unlockRung: number;       // 0 = city council, 1 = mayor … available when officeIndex ≥ unlockRung
  exclusiveGroup?: string;  // ideological forks: pick one, locks others (Phase 5)
}

// --- Config definition types ---

export interface OfficeDef {
  id: string;
  name: string;
  era: Era;
  index: number;
  generalPool: Num;
  primaryPool: Num;
  rivalCount: number;
  rivalRatePrimary: number;  // TUNING TARGET: rival voters/sec in the primary
  rivalRateGeneral: number;  // TUNING TARGET: rival voters/sec in the general
  unlocks: string[];         // generator ids that first become available here
}

export interface GeneratorDef {
  id: string;
  name: string;
  track: Track;
  rung: number;
  baseCost: Num;
  baseOutput: Num;
  unlockOffice: string;
  flavor: string;
}

export interface BlocStaticDef {
  groupId: string;
  name: string;
  lean: number;
  primaryWeight: number;
  generalWeight: number;
}

export interface RivalStaticDef {
  archetypeId: string;
  name: string;
  lean: number;
}
