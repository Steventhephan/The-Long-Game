---
type: production-doc
folder: 07 Production
status: complete
---

# Phase 1 Build Log

> Documents what was actually built, deviations from the spec, final balance constants, and lessons learned during the Phase 1 vertical slice session. Read this before touching `src/` in a new session.

## Status

**Phase 1 is SHIPPED** (City Council primary + general). All §7 Definition-of-Done items are met. The ship-gate ("it must feel like a contested race") has been playtested and confirmed. Proceed to Phase 2 from here.

**Git head:** `451c39e` (as of session end)

---

## Repo Structure

Exactly as specified in Build Quickstart §2. Key files:

```
src/
  types.ts           ← shared interfaces (GameState, BlocState, RivalState, etc.)
  config/
    balance.ts       ← BAL + PHASE1 constants (all tuning targets flagged)
    offices.ts       ← City Council only
    generators.ts    ← Canvasser (field) + Small-Dollar Drive (finance)
    blocs.ts         ← Labor Unions + Suburban Moderates (city council only)
    rivals.ts        ← Establishment Favorite / "Alex Morgan" (lean 0.3)
  sim/
    election.ts      ← tick(), knockDoors(), initElection(), helpers
  state/
    gameState.ts     ← defaultState(), resetRun(), advanceElection()
    store.ts         ← Svelte writable + derived display values
  persist/
    autosave.ts      ← versioned localStorage, 3s autosave, visibilitychange
  ui/
    App.svelte       ← shell, tab bar (Campaign only; others locked)
    Header.svelte    ← race header: progress bar, days-to-election, cash
    CampaignTab.svelte ← KNOCK button, generators, bloc breakdown, reset
    ResultModal.svelte ← win / lose / runoff_start / runoff_win / runoff_lose
  main.ts            ← rAF loop at 20 Hz, full-pause on document.hidden
```

---

## Deviations from Build Quickstart Spec

### 1. Voter Stealing (not in spec — user-confirmed mechanic)

When a candidate's conversion demand exceeds available undecided voters, the overflow **steals from the opponent's decided voters at the same rate** (no efficiency penalty). Applies to:
- Player passive tick (BASE_CONV)
- Rival tick
- Field generators
- Tap (knockDoors)

This keeps the race alive after the undecided pool is exhausted. The original spec only mentioned "convert from undecided," but the user confirmed stealing is the intended behavior.

### 2. Shared `src/types.ts` for interfaces

The spec co-located types with their modules. In practice, `GameState`, `BlocState`, `RivalState`, `BlocStaticDef`, `RivalStaticDef` are all shared across `sim/`, `state/`, and `config/`. They live in `src/types.ts` and are imported everywhere.

### 3. `runoff_start` as ephemeral event signal

`electionResult = 'runoff_start'` is a one-tick signal. The ResultModal auto-dismisses it after 2.5s and resets `electionResult` to `'none'` while keeping `isRunoff = true`. The tick loop gates on `electionResult !== 'none'`, so the caller must handle this correctly.

### 4. `advanceElection` loops back to City Council

Phase 1 only has City Council. After winning the general, `advanceElection` calls `resetRun` (banking prestige) rather than advancing to a non-existent office. Phase 2 will wire up the next office.

---

## Final Balance Constants (PHASE1 in `config/balance.ts`)

Went through several playtesting iterations. **Calibrated for ~4 taps/sec human input.**

```ts
PHASE1 = {
  tapVoters: 7,           // 4 taps/sec × 7 = 28/s ≈ rival's ~25/s effective
  tapCash: 2,             // first generator takes ~9s of sustained tapping
  playerBaseConv: 0.5,    // per bloc passive; 2 blocs = 1/s total (minor trickle)
  rivalBaseRate: 30,      // with lean-matching: ~25/s effective across 2 blocs
  canvasserOutput: 2.0,   // voters/sec per owned; 3 units = +6/s tiebreaker
  smallDollarOutput: 2.0, // cash/sec per owned
}
```

Generator base costs (in `config/generators.ts`):
- Canvasser: $75 (×1.15 per copy)
- Small-Dollar Drive: $75 (×1.15 per copy)

**Calibration formula:** `rivalBaseRate × (sum of leanMatch per bloc / blocCount) ≈ tapVoters × human_tap_rate`

For the current 2-bloc setup with rival lean 0.3:
- Labor leanMatch ≈ 0.725, Suburban leanMatch ≈ 0.925 → avg 0.825
- `30 × 0.825 = 24.75/s` ≈ `7 × 4 = 28/s` → near parity at active play

**Target difficulty:** player and rival near-equal for the first ~80% of the timer. Generators are the tiebreaker that lets the player break ahead in the final 20%.

---

## UI Decisions

| Feature | Decision |
|---|---|
| Progress bar | Player fills left → rival fills right → undecided is background |
| Bloc bars | Same left/right layout as header bar |
| Timer | Seconds mapped 1:1 to campaign "days"; label = "Days to Election" |
| Tap feedback | Multi-floater array; each tap spawns independent element with random `--dx` horizontal drift; `{#each floaters}` keyed by id |
| Knock button | Label = "KNOCK"; crit chance shown inside button as "5% crit" |
| Buy buttons | Max button LEFT of price button (thumb ergonomics on mobile) |
| Reset save | Two-tap confirm with 3s auto-cancel |

---

## What's Next (Phase 2)

Per Implementation Roadmap:
- Full Field/Finance ladders (8 rungs each)
- Upgrades (multipliers, synergies, crit, tap)
- Multiplier stack wiring (Volunteers/Prestige placeholders)
- Operation tab
- Number scaling per Number Scaling & Curves
- Robust save/load + autosave + migrations

Before widening: the Phase 1 ship-gate is met. Tune further balance during Phase 2 as generator ladders are added.
