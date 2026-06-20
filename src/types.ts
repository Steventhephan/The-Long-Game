export type Num = number; // swap to Decimal later if needed
export type Era = 'local' | 'county' | 'state' | 'federal';
export type Track = 'field' | 'finance';
export type Scalar = -1 | 0 | 1;

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
  platform: Record<string, string>;         // issueId → stanceId ('left'|'center'|'right')
  flipFlopCounts: Record<string, number>;   // issueId → number of stance changes
  ideologyId: string;                       // current ideology designation id
  blocSupport: Record<string, number>;      // groupId → support multiplier (0.5–3.0)
  officeIndex: number;
  rivalRate: number;
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
  | { kind: 'tapMult';     value: number }
  | { kind: 'critChance';  value: number }
  | { kind: 'fieldMult';   value: number }
  | { kind: 'financeMult'; value: number };

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  category: 'tap' | 'field' | 'finance' | 'synergy' | 'ability' | 'group' | 'fork';
  cost: Num;
  effect: EffectSpec;
  unlockRung: number;
  exclusiveGroup?: string;
}

// --- Platform / policy types ---

export interface StanceDef {
  id: 'left' | 'center' | 'right';
  label: string;
  scalar: Scalar;
}

export interface IssueDef {
  id: string;
  name: string;
  unlockEra: Era;
  stances: [StanceDef, StanceDef, StanceDef]; // always [left, center, right]
}

export interface IdeologyDef {
  id: string;
  label: string;
  axisMin: number; // inclusive
  axisMax: number; // exclusive (except for last designation)
  // Multiplier deltas applied to per-bloc support: positive = bonus, negative = malus
  blocModifiers: Record<string, number>; // groupId → delta (e.g. 0.5 = +50%, -0.4 = -40%)
}

export interface IssuePriority {
  issueId: string;
  preferredScalar: Scalar;
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
  rivalRatePrimary: number;
  rivalRateGeneral: number;
  unlocks: string[];
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

// Full interest-group definition — replaces the old BlocStaticDef stub.
export interface InterestGroupDef {
  groupId: string;
  name: string;
  shortName: string;              // compact display name for narrow layouts
  lean: number;                   // -1 (far left) to +1 (far right)
  priorityIssues: IssuePriority[]; // issues this group cares about most
  primaryWeight: number;          // relative pool share in primaries
  generalWeight: number;          // relative pool share in generals
  unlockOfficeIndex: number;      // first office where this bloc is revealed in the UI
}

// Keep BlocStaticDef as alias so sim/election.ts signature stays backward-compatible.
export type BlocStaticDef = InterestGroupDef;

export interface RivalStaticDef {
  archetypeId: string;
  name: string;
  lean: number;
}
