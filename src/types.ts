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

// --- Config definition types ---

export interface OfficeDef {
  id: string;
  name: string;
  era: Era;
  index: number;
  generalPool: Num;
  primaryPool: Num;
  rivalCount: number;
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
