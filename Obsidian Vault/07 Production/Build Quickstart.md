---
type: production-doc
folder: 07 Production
status: complete
---

# Build Quickstart — The Long Game

> **🛠️ START HERE TO BUILD.** This is the single code-ready entry point. The game **design is complete and decision-complete** — do **not** re-run the design interview. Build from this doc plus [[Project Summary]] (what the game is), [[Technical Architecture Requirements]] (architecture), [[Implementation Roadmap]] (phase order), and [[Number Scaling & Curves]] (formulas). The design notes in folders 01–06 hold any deeper "why."

## 0. The Game in 5 Lines
Mobile-first browser **active incremental**. Tap "Knock on Doors" → convert **voters** from a finite, **bloc-segmented** pool + earn **cash**; buy **Field** (voters/sec) & **Finance** (cash/sec) generators; win each election (hold >50% at the timer, or 100% instantly) to climb **8 offices × (primary+general) = 16 elections to President**. Lose → restart at City Council banking **Prestige** (roguelite dynasty, ~8–12 runs to win). Build **vertical-slice first** (City Council).

## 1. Stack (locked)
- **TypeScript (strict)** · **Svelte + Vite** · central reactive store · **canvas** for juice · **Web Audio/Howler** · **PWA** service worker · **localStorage** saves · **Vitest**.
- **No backend.** Fully client-side. **Full-pause** when hidden (Page Visibility API) — **no offline progress**, no offline simulation.
- Numbers fit JS doubles (≤ ~150M); wrap currency in a `Num` alias to allow a later `break_infinity.js` swap for the post-MVP galactic tier.

## 2. Repo Structure
```
src/
  config/    # ALL content + balance as typed data (offices, generators, issues, groups,
             #   ideologies, upgrades, abilities, minigames, events, archetypes, perks,
             #   achievements, balance.ts). Adding content = editing config, NOT engine code.
  sim/       # pure reducers, no DOM: tick(), election(), economy(), prestige(), rng()
  state/     # central store + selectors (serializable GameState)
  ui/        # Svelte: tabs (Campaign/Operation/Platform/Legacy), header, modals
  juice/     # canvas particle pool, audio triggers
  persist/   # serialize / migrate / autosave
  main.ts
```
Keep `sim/` framework-free and unit-tested.

## 3. Data Model (TypeScript — the config schema)
```ts
type Num = number;                       // swap to Decimal later
type Era = 'local' | 'county' | 'state' | 'federal';
type Track = 'field' | 'finance';
type Scalar = -1 | 0 | 1;                // Left / Center / Right

interface OfficeDef {
  id: string; name: string; era: Era; index: number;   // 0..7
  generalPool: Num; primaryPool: Num;                  // electorate sizes
  rivalCount: number;                                  // rivals in the field
  unlocks: string[];                                   // generator/issue/system ids revealed here
}

interface GeneratorDef {
  id: string; name: string; track: Track; rung: number; // 0..7
  baseCost: Num; baseOutput: Num;                        // per-copy; cost grows 1.15^owned
  unlockOffice: string; flavor: string;
}

interface IssueDef {
  id: string; name: string; unlockEra: Era;
  stances: { id: string; label: string; scalar: Scalar }[];   // usually 3 (L/C/R)
}
interface InterestGroupDef {
  id: string; name: string;
  priorityIssues: string[];
  preferredStance: Record<string, Scalar>;             // issueId -> liked stance
  blocWeightPrimary: number; blocWeightGeneral: number; // share of pool in each phase
}
interface IdeologyDef {                                 // emergent from mean(stances)
  id: string; label: string; axisMin: number; axisMax: number; // range on [-1,1]
  bonuses: Record<string, number>; maluses: Record<string, number>;
}

interface UpgradeDef {
  id: string; name: string;
  category: 'tap'|'field'|'finance'|'synergy'|'ability'|'group'|'fork';
  cost: Num; effect: EffectSpec; unlockOffice?: string;
  exclusiveGroup?: string;                             // ideological forks: pick-one-locks-others
}
interface AbilityDef {
  id: string; name: string; category: 'offense'|'boost';
  cashCost: Num; cooldownSec: number;
  targetType: 'rival'|'bloc'|'self'; effect: EffectSpec;
}
interface MinigameDef {
  id: string; type: 'debate'|'townhall'|'gala'; mandatory: boolean;
  cooldownSec?: number; cashCost?: Num;                // optional ones are gated
  scenarios: { prompt: string; choices: {
      label: string; stanceDeltas?: Record<string, Scalar>;
      supportDeltas?: Record<string, number>; charismaDelta?: number;
  }[] }[];
}
interface EventDef {
  id: string; form: 'dilemma'|'modifier'; valence: 'neg'|'neutral'|'pos';
  trigger: 'random'|'state'|'scheduled'; target: 'player'|'rival'|'all';
  effect?: EffectSpec; choices?: { label: string; effect: EffectSpec }[];
}
interface RivalArchetype {
  id: string; name: string;
  leanScalar: number; leanBand: number;                // base lean ± random band
  fundingStrength: number; aggression: number; difficulty: number;
  strongBlocs: string[]; weakBlocs: string[];          // every archetype has a weakness
}
interface PerkNode { id: string; name: string; cost: number; effect: EffectSpec; prereq?: string }
interface AchievementDef { id: string; name: string; condition: ConditionSpec; reward: EffectSpec }

// EffectSpec/ConditionSpec: small declarative unions (e.g.
//   {kind:'mult', target:'allOutput', value:1.5} | {kind:'critChance', value:0.02} ...)
```

```ts
interface GameState {
  version: number; rngSeed: number;
  // run (resets on loss):
  cash: Num; voters: Num;                              // voters = current-election score
  generators: Record<string, number>;                 // id -> owned count
  upgrades: string[]; forksChosen: string[];
  charisma: number; volunteers: Num;
  platform: Record<string, string>;                   // issueId -> chosen stanceId
  blocSupport: Record<string, number>;                // groupId -> support multiplier
  officeIndex: number; phase: 'primary'|'general';
  timerRemaining: number;
  blocs: { groupId: string; undecided: Num; player: Num; rivals: Num[] }[];
  rivals: { archetypeId: string; lean: number; share: Num; eliminated: boolean }[];
  // meta (persists across runs):
  prestige: number; perks: string[]; achievements: string[];
  globalMultiplier: number;
}
```

## 4. Locked v1 Constants (`config/balance.ts`)
```ts
export const BAL = {
  generatorCostGrowth: 1.15, rungCostMultiplier: 8, rungOutputMultiplier: 7,
  critBaseChance: 0.05, critChanceCap: 0.50, critMultiplier: 5,
  prestigePerPoint: 0.02, officeWeight: (i:number)=>2**i,
  synergyDiminish: 0.85, blocSupportMin: 0.5, blocSupportMax: 3.0,
  multiplierCapByEra: { local:50, county:250, state:1000, federal:5000 },
  volunteerMult: (v:number)=>1 + Math.log10(1+v)/2,
  flipFlopCostGrowth: 2, flipFlopTrustErosion: 0.7,
  generalTimerBase: 90, timerGrowth: 1.4, primaryTimerRatio: 0.6, primaryPoolRatio: 0.35,
  poolBase: 5000, poolGrowth: 4.3, runoffSeconds: 20,
};
// Pools per office ≈ poolBase * poolGrowth^index → 5K,22K,95K,410K,1.75M,7.5M,32M,150M
```

## 5. Core Election Tick (pseudocode — `sim/election.ts`)
```
tick(state, dt):
  if document.hidden: return state            // full-pause
  stack = blocSupport × volunteerMult × prestigeMult × achievementMult  (clamped to era cap)
  for each bloc:
     playerRate = baseConv × support[bloc] × stack
     convert min(playerRate·dt, bloc.undecided) from undecided → player
     for each live rival: convert by rival lean/funding vs this bloc
  apply passive generators (Field→voters into best blocs, Finance→cash)   // weak
  state.timerRemaining -= dt
  if any candidate ≥ 100% of total: WIN (or LOSE if a rival)
  if total undecided == 0 and nobody >50%: eliminate lowest → their voters back to undecided
  if timerRemaining ≤ 0:
     if player >50%: WIN
     elif nobody >50%: start RUNOFF (runoffSeconds, top two)
     else: LOSE
  on WIN: advance office/phase, reset voters+pool, keep operation
  on LOSE: bank Prestige = Σ officeWeight(won) → reset run → City Council
```

## 6. Save / Persistence (`persist/`)
- Serialize `GameState` to **localStorage** every few seconds + on every action + on `visibilitychange`.
- **Versioned** with migration functions. Persist `rngSeed` (seeded RNG) so events are reproducible. Provide export/import string. No server.

## 7. ▶️ Phase 1 — Vertical Slice: Definition of Done
Build **City Council only** (primary + general):
- [ ] Knock button converts voters (+cash) with 5% crit ×5; feedback on `touchstart`.
- [ ] 1 Field + 1 Finance generator, buy-many at 1.15× cost, weak passive.
- [ ] Finite pool with **2 interest-group blocs**, **1 rival** converting in real time.
- [ ] Countdown timer; **win** (>50% or 100%), **lose** (sub-50% at timer / eliminated / rival 100%), **runoff** if no majority.
- [ ] Campaign tab + persistent race header (your %, timer, cash).
- [ ] Save/load + full-pause on hide.
- [ ] **Ship-gate:** it must *feel* like a contested race. Playtest before widening (Phase 2+ in [[Implementation Roadmap]]).

## 8. The 5 Pillars (never violate — verify every commit)
1. Theme is a gate. 2. Depth beats accessibility. 3. Protect the underdog climb. 4. Active engagement is the soul (idle only bridges absence). 5. Neither cynical nor evangelical — effort *always* visibly pays off; even-handed; warm.

## 9. Content Rosters (authored — turn into `config/`)
Starter content is authored and lives in the design notes; port it into typed config:
- **Generators** (both 8-rung ladders, named) → [[Generators]]
- **12 Issues + stances, Interest-group blocs, Ideology designations** → [[Policy, Platform & Interest Groups]] (Rosters A–C)
- **Abilities** (8) → [[Campaigns & Abilities]]
- **Minigames** (types + sample scenarios) → [[Minigames]]
- **Events** (starter roster) → [[Events & Crises]]
- **Rival archetypes** (6) → [[Opposition & Conflict]]
- **Prestige perk tree** (12 nodes) → [[Prestige & Reset System]]
- **Achievements** (12) → [[Milestones & Unlocks]]

**Still 🎯 (tune during build, not design gaps):** exact balance magnitudes beyond the §4 constants (bonus/malus sizes, per-office bloc sizes, ability costs/cooldowns, perk costs, rival stat values) and expanding each roster's volume. Locked *approaches* exist for all.
