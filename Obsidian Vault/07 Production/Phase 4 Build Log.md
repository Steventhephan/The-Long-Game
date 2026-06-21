---
type: production-doc
folder: 07 Production
status: complete
---

# Phase 4 Build Log — Dynasty / Prestige Meta

> Read after [[Phase 3 Build Log]]. Documents Phase 4 and follow-up polish. **Git head: `53fad42`. Next phase is Phase 5** (Depth Systems & Era Hooks — minigames, charisma/volunteers, abilities, events/crises, opposition archetypes).

---

## What Was Built

### Core meta loop

**Prestige banking** (`sim/prestige.ts`, `state/gameState.ts`):
- On every run end (loss or presidential win), prestige is banked ∝ elections won
- Formula: `officeWeight(i) = 2^i` per election; two elections per office (primary + general)
- Examples: loss at CC primary = 0pt; win CC primary, lose CC general = 1pt; full 16-election run = 510pt
- `computePrestigeGain(state, isVictory)` is the canonical source — exported from `sim/prestige.ts`
- Fixed a presidency off-by-1: `resetRun(state, isVictory=true)` adds +1 for the election just won

**Global multiplier** (`sim/election.ts` → `computeStack`):
- Already wired from Phase 3: `1 + prestige × BAL.prestigePerPoint` (2%/point)
- Kingmaker perk adds +1.0 to `state.globalMultiplier` at purchase time (recomputed in `resetRun`)

**Run state vs. meta state:**
- Platform (stances, flip-flop counts, trust multipliers) carries over across runs — dynasty continuity
- Bloc support recomputed for era 0 at start of each new run
- All generators, upgrades, cash, voters reset on each run

---

### Perk tree (`config/perks.ts`)

12 nodes, spent with prestige points. Costs calibrated for ~8–12 run curve.

| Perk | Cost | Prereq | Effect |
|------|------|--------|--------|
| Head Start | 1pt | — | +$200 seed cash each run |
| Ground Game | 1pt | — | +50% tap yield |
| Field Efficiency | 3pt | — | Field generators 25% cheaper |
| Finance Efficiency | 3pt | — | Finance generators 25% cheaper |
| Charisma Prodigy | 3pt | — | +20% volunteer accrual (Phase 5 hook) |
| Fast-Forward | 6pt | Head Start | Cleared offices run on 15s clock |
| Crit Mastery | 6pt | Ground Game | +5% base crit chance |
| Media Darling | 6pt | Field Efficiency | +50% passive conversion rate |
| War Chest | 6pt | Finance Efficiency | Raises effective cash cap (Phase 5 hook) |
| Bloc Whisperer | 6pt | Charisma Prodigy | +bloc support gain (Phase 5 hook) |
| Iron Reputation | 6pt | Bloc Whisperer | −30% flip-flop cash cost |
| Kingmaker | 15pt | Crit Mastery + Media Darling + War Chest | +100% global output (globalMultiplier +1.0) |

**Perk economy examples:**
- Run 3 (≈3pt cumulative): unlock Head Start + Ground Game
- Run 4 (≈7pt): unlock Field Efficiency  
- Run 5 (≈13pt): unlock Finance Efficiency + Crit Mastery
- Run 6–8: unlock Media Darling, War Chest, Fast-Forward
- Run 10+: approach Kingmaker

---

### Wiring perk effects into sim

**`sim/prestige.ts` → `computePerkEffects(state): PerkEffects`**

Returns a flat struct aggregating all owned perk bonuses. Called at point-of-use, never stored — always computed from `state.perks`.

**`sim/election.ts`:**
- `computeUpgradeEffects()` now applies `perkEffects.tapMult` and `perkEffects.critBonus` on top of upgrade bonuses
- `tick()` multiplies `BASE_CONV` by `perkEffects.mediaDarlingMult` for passive conversion
- `initElection()` applies Fast-Forward timer: if `hasPerk('fast_forward')` and `officeIndex <= state.highestOfficeCompleted`, timer is set to `perkEffects.fastForwardSeconds` (15s)

**`sim/platform.ts`:**
- `applyStanceChange()` applies `perkEffects.flipCostMult` (Iron Reputation) to flip-flop cash cost

**`config/generators.ts`:**
- `generatorCost(def, owned, costMult?)`, `bulkCost(def, owned, qty, costMult?)`, `maxAffordable(def, owned, cash, costMult?)` all accept an optional `costMult` parameter
- `OperationTab.svelte` passes `perkEffects.fieldCostMult` / `perkEffects.financeCostMult` per generator track

**`state/gameState.ts` → `buyPerk(state, perkId): GameState | null`:**
- Checks prereqs and prestige cost; returns `null` if unaffordable or prereqs unmet
- Updates `globalMultiplier` immediately when Kingmaker is bought
- Fires `checkAchievements(state, 'perkBought')` after purchase

---

### Achievement system (`config/achievements.ts`, `sim/prestige.ts`)

10 starter achievements, checked at three event types:

| Achievement | Trigger | Event |
|-------------|---------|-------|
| First Victory | Win first election | electionWin |
| Hat Trick | Win 3 elections in one run | electionWin |
| Landslide | Win with >75% of vote | electionWin |
| Iron Will | Reach County Executive | electionWin |
| Statesman | Reach State Legislature | electionWin |
| The Long Game | Win the Presidency (full run) | electionWin + isVictory |
| Dynasty Begins | Complete first run reset | runReset |
| Perk Up | Buy first perk | perkBought |
| Power Broker | Own 5+ perks | perkBought |
| The Kingmaker | Unlock Kingmaker | perkBought |

`checkAchievements(state, event, extra)` returns newly unlocked ids. Called from `advanceElection`, `resetRun`, and `buyPerk`. Achievement ids are stored in `state.achievements` (meta, persists across runs).

---

### New GameState fields (SAVE_VERSION 4 → 5)

```typescript
// All persist across runs:
runHistory: RunHistoryEntry[];      // ordered log of completed runs
runNumber: number;                  // current run number (starts at 1)
highestOfficeCompleted: number;     // -1 = none; officeIndex of last completed general
```

`RunHistoryEntry`: `{ runNumber, officeName, electionsWon, prestigeEarned, outcome: 'loss' | 'victory' }`

**Migration v4 → v5:** adds `runHistory: []`, `runNumber: 1`, `highestOfficeCompleted: -1`.

---

### Legacy tab (`ui/LegacyTab.svelte`)

Three sections:

**Dynasty Stats** (always visible):
- Large prestige number + prestige title (`prestigeLabel` function: Newcomer → Kingmaker)
- "This run" counter: prestige earned so far this run (updates as elections are won; represents what you'd bank on a loss right now)

**Prestige Perks:**
- All 12 perks listed; sorted available → locked → owned
- Available perks (prereqs met, prestige ≥ cost): show gold buy button with cost
- Locked (insufficient prestige or prereqs unmet): show dimmed cost badge
- Owned: shown at 50% opacity with ✓ badge

**Achievements:** unlocked (★, gold) then locked (☆, dimmed)

**Run History:** newest run first; shows office reached, elections won, prestige earned, victory badge if applicable

---

### ResultModal updates (`ui/ResultModal.svelte`)

- Office name now dynamic: `getOffice(state.officeIndex).name` — no more hardcoded "City Council"
- Loss modal shows prestige banked: "Banking **+N** prestige for your dynasty" or "Win at least one election to bank prestige" (0pt case)
- Presidential win: special `isPresidencyWin` branch shows "🏛️ President!", "Your dynasty's legacy is complete", button reads "New Dynasty →"
- Presidential win calls `resetRun(state, true)` directly (not `advanceElection`) — avoids double-call and correctly passes `isVictory=true` for prestige formula
- Modal overlay changed from `position: fixed` → `position: absolute` (consistent with Phase 3 overlay pattern)

---

### Polish fixes (same session, `53fad42`)

- **PlatformTab**: ideology badge centered via `align-self: center`
- **PolicyModal**: removed `+Bloc / –Bloc` effect tags from stance cards (Coalition Support bars already surface this; tags were redundant and cluttered)
- **LegacyTab**: "Bank now" label renamed to "This run" for clarity

---

## Architecture notes

- `computePerkEffects(state)` is called multiple times per tick (from `computeUpgradeEffects`, `tick`, `initElection`, `applyStanceChange`). This is intentional — the function is O(n perks) pure computation with no side effects, and n≤12. No need to memoize.
- `sim/prestige.ts` imports from `config/perks.ts` and `config/offices.ts` only. No circular dependencies.
- `state/gameState.ts` imports from `sim/prestige.ts` and `config/perks.ts` directly. Clean dependency direction.
- Charisma Prodigy, War Chest, Bloc Whisperer are defined in the perk tree but their effects are stubs — they show in the UI and cost prestige, but their mechanical hooks (volunteers, cash cap, bloc gain rate) are Phase 5 systems.

---

## What's Next — Phase 5

Per Implementation Roadmap:
- **Minigames** (choice-based, pause race; Charisma + support) — County hook
- **Charisma → Volunteers** scaling (completes Charisma Prodigy perk hook)
- **Abilities** (cooldown, cash, offensive + boost) — State hook
- **Events & Crises** (dilemmas + modifiers; triggers) — State hook
- **Opposition archetypes** (hybrid AI, leans, strengths/weaknesses; scaling rival counts) — Federal max fields
- **Ideological forks** — Federal hook
- **Done when:** each era introduces its headline system on schedule and rivals feel distinct
