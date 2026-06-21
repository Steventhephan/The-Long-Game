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
  name: string;
  lean: number;
  share: Num;
  eliminated: boolean;
  conversionMod: number;
  strongBlocs: string[];
  weakBlocs: string[];
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

  // Phase 5 run-level state (resets per run):
  pendingMinigame: string | null;              // minigame id queued; race paused until resolved
  minigameCooldowns: Record<string, number>;   // optional minigame type → seconds remaining
  abilityCooldowns: Record<string, number>;    // ability id → seconds remaining
  activeEvent: ActiveEventState | null;        // dilemma event pausing the race
  eventModifiers: EventModifier[];             // struck modifiers (timed effects)
  eventCooldown: number;                       // seconds until next event can fire

  // transient UI signals — not persisted:
  lastCritHit: boolean;
  isPaused: boolean;   // true while any modal is open; halts tick()
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

// --- Phase 5: Minigame types ---

export type MinigameEffectSpec =
  | { kind: 'charisma'; delta: number }
  | { kind: 'blocSupport'; groupId: string; delta: number }
  | { kind: 'cash'; amount: number }
  | { kind: 'stanceCommit'; issueId: string; stanceId: string };

export interface MinigameChoice {
  id: string;
  text: string;
  effects: MinigameEffectSpec[];
}

export interface MinigameDef {
  id: string;
  type: 'debate' | 'town_hall' | 'fundraising_gala';
  title: string;
  prompt: string;
  choices: MinigameChoice[];
  unlockEra: Era;
  mandatory?: boolean;
  cooldownSeconds?: number;
  cashCost?: number;
}

// --- Phase 5: Ability types ---

export interface AbilityDef {
  id: string;
  name: string;
  description: string;
  category: 'boost' | 'offensive';
  baseCost: number;
  baseCooldown: number;
  effectDuration?: number;
  effectMagnitude: number;
  target: 'self' | 'bloc' | 'rival';
  unlockOfficeIndex: number;
}

// --- Phase 5: Event types ---

export interface EventModifier {
  id: string;
  label: string;
  kind: 'conversionMult' | 'cashMult' | 'blocSupportDelta' | 'rivalConvMult';
  magnitude: number;
  duration: number;
  groupId?: string;
  rivalIndex?: number;
}

export type EventDilemmaEffect =
  | { kind: 'charisma'; delta: number }
  | { kind: 'blocSupport'; groupId: string; delta: number }
  | { kind: 'cash'; amount: number }
  | { kind: 'modifier'; modKind: EventModifier['kind']; magnitude: number; duration: number; groupId?: string; rivalIndex?: number };

export interface EventChoice {
  id: string;
  text: string;
  effects: EventDilemmaEffect[];
}

export interface EventDef {
  id: string;
  name: string;
  type: 'dilemma' | 'modifier';
  valence: 'positive' | 'negative' | 'neutral';
  prompt?: string;
  choices?: EventChoice[];
  modKind?: EventModifier['kind'];
  modMagnitude?: number;
  modDuration?: number;
  triggerType: 'random' | 'state' | 'scheduled';
  stateCheck?: 'heavy_flips' | 'low_charisma' | 'high_volunteers' | 'timer_late';
  targetsSelf: boolean;
  unlockOfficeIndex: number;
}

export interface ActiveEventState {
  eventId: string;
  targetRivalIndex?: number;
}

// --- GeneratorDef ---

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
  conversionMod: number;     // multiplier on office rivalRate (1.0 = baseline)
  strongBlocs: string[];     // groupIds where rival gets +50% rate bonus
  weakBlocs: string[];       // groupIds where rival gets -50% rate penalty
}
