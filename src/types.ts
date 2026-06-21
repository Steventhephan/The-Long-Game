export type Num = number; // swap to Decimal later if needed
export type Era = 'local' | 'county' | 'state' | 'federal';
export type Track = 'field' | 'finance';
export type Scalar = -1 | -0.5 | 0 | 0.5 | 1;   // stance scalars (5 positions)
export type PreferredScalar = -1 | 0 | 1;          // interest group preferences (3 positions)

// --- Prestige / perk types ---

export type PerkEffect =
  | { kind: 'headStart';         cashBonus: number }
  | { kind: 'groundGame';        tapMult: number }
  | { kind: 'fieldEfficiency';   costMult: number }
  | { kind: 'financeEfficiency'; costMult: number }
  | { kind: 'charismaProdigy';   accrualBonus: number }
  | { kind: 'critMastery';       critBonus: number }
  | { kind: 'blocWhisperer';     supportBonus: number }
  | { kind: 'ironReputation';    flipCostMult: number }
  | { kind: 'mediaDarling';      passiveMult: number }
  | { kind: 'warChest';          cashCapBonus: number }
  | { kind: 'fastForward';       timerSeconds: number }
  | { kind: 'kingmaker';         globalMult: number };

export interface PerkDef {
  id: string;
  name: string;
  description: string;
  cost: number;       // prestige points
  prereqs: string[];  // perk ids that must be owned first
  effect: PerkEffect;
}

export interface PerkEffects {
  tapMult: number;
  critBonus: number;
  fieldCostMult: number;
  financeCostMult: number;
  mediaDarlingMult: number;
  flipCostMult: number;
  headStartCash: number;
  fastForwardSeconds: number;
}

// --- Achievement types ---

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
}

// --- Run history ---

export interface RunHistoryEntry {
  runNumber: number;
  officeName: string;
  electionsWon: number;
  prestigeEarned: number;
  outcome: 'loss' | 'victory';
}

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
  platform: Record<string, string>;                    // issueId → StanceId
  flipFlopCounts: Record<string, number>;              // issueId → number of changes made
  flipFlopTrustMultipliers: Record<string, number>;    // issueId → effectiveness multiplier (1.0 decaying)
  ideologyId: string;
  blocSupport: Record<string, number>;                 // groupId → support multiplier (0.5–3.0)
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
  runHistory: RunHistoryEntry[];
  runNumber: number;
  highestOfficeCompleted: number; // -1 = none; officeIndex of last office with completed general

  // transient UI signals — not persisted:
  lastCritHit: boolean;
  isPaused: boolean;   // true while Promise modal is open; halts tick()
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

export type StanceId = 'far_left' | 'center_left' | 'center' | 'center_right' | 'far_right';

export interface StanceDef {
  id: StanceId;
  label: string;       // axis label: "Far Left", "Center-Left", etc.
  title: string;       // policy name shown on card
  description: string; // roleplay flavor shown on card
  scalar: Scalar;
}

export interface IssueDef {
  id: string;
  name: string;
  unlockEra: Era;
  stances: [StanceDef, StanceDef, StanceDef, StanceDef, StanceDef]; // L, CL, C, CR, R
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
  preferredScalar: PreferredScalar; // groups have clear L/C/R preferences
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
