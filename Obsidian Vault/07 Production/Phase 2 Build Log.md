---
type: production-doc
folder: 07 Production
status: complete
---

# Phase 2 Build Log

> Documents what was built, key decisions, and balance findings for Phase 2 — "The Incremental Spine." Read alongside [[Phase 1 Build Log]]. **Next phase is Phase 3** (Policy, Platform & Interest Groups).

## Status

**Phase 2 is COMPLETE and playtested.** All 6 steps shipped. Git head: `edfd635`.

---

## What Was Built

### 1. Per-office rival rates (`config/offices.ts`)

`OfficeDef` split `rivalRate` into `rivalRatePrimary` and `rivalRateGeneral` so each phase can be tuned independently. All 8 offices configured. `officeRivalRate(officeIndex, phase)` in `gameState.ts` selects the correct value at `initElection` time.

**City Council tuned values (others are TUNING TARGETs):**
- Primary: 30 (playtested, working)
- General: 26 (reduced from 30 after playtest showed 30 forced a consistent runoff even with aggressive generator buying)

**~2.5× scaling per office** for other offices (TUNING TARGET):
Mayor 75 → County 190 → County Exec 475 → State Leg 1200 → Governor 3000 → Senate 7500 → President 18500

### 2. Full 16-generator ladder (`config/generators.ts`)

All 8 Field + 8 Finance generators built from spec formulas:
- `baseCost(rung k) = 75 × 8^k`
- `baseOutput(rung k) = 2.0 × 7^k`

`generatorsForOffice(officeIndex)` returns generators with `rung <= officeIndex` — new rungs appear automatically as offices advance. `tick()` now sums all owned generators generically (no hardcoded ids).

| Rung | Cost | Output/s |
|---|---|---|
| 0 | $75 | 2 |
| 1 | $600 | 14 |
| 2 | $4.8K | 98 |
| 3 | $38.4K | 686 |
| 4 | $307K | 4.8K |
| 5 | $2.5M | 33.6K |
| 6 | $19.7M | 235K |
| 7 | $157M | 1.65M |

### 3. Tap scaling per office (`sim/election.ts`)

`tapVoters` and `tapCash` scale by `BAL.timerGrowth^officeIndex` (1.4× per office) so taps stay relevant as pools grow. At higher offices the rival rate far exceeds tap-alone output — generators close the gap.

| Office | tapVoters | tapCash |
|---|---|---|
| City Council | 7 | 2 |
| Mayor | 10 | 3 |
| County Council | 14 | 4 |
| … | … | … |
| President | 74 | 21 |

### 4. Upgrades system (`config/upgrades.ts`, `sim/election.ts`)

`EffectSpec` union: `tapMult | critChance | fieldMult | financeMult`. 11 starter upgrades across 3 office tiers, all bought-once and persistent within a run:

| Category | Tiers | Cumulative effect |
|---|---|---|
| Tap ×2 | 0 / 1 / 2 | ×8 tap yield |
| Crit +5% | 0 / 1 | 15% total |
| Field ×2 | 0 / 1 / 2 | ×8 field output |
| Finance ×2 | 0 / 1 / 2 | ×8 finance output |

`computeUpgradeEffects(state)` in `election.ts` derives multipliers. Applied in `knockDoors()` (tap + crit) and `tick()` (generators).

### 5. Operation tab (`ui/OperationTab.svelte`)

- Live output summary (field voters/sec + finance cash/sec with upgrades + stack)
- Active multiplier tags (Tap ×N, Field ×N, Finance ×N, Stack ×N)
- All unlocked generators with per-row buy buttons (Max + single)
- Upgrades shop: unpurchased at top (original order), purchased grouped by category at bottom
- Always visible — generators were removed from Campaign tab to eliminate redundancy

### 6. Save migration v1 → v2

`SAVE_VERSION` bumped to 2. v1→v2 patches `rivalRate` from office config for the saved `officeIndex`. Forward-compat merge with `defaultState()` handles future new fields.

---

## Playtesting Findings (Phase 2)

Simulated ~4 taps/sec, aggressive generator + upgrade buying:

**City Council Primary** — PASS
- Rival leads at 20% and 50% marks
- Player pulls ahead at 80% via generator investment
- WIN at 52.6%

**City Council General** — PASS after tuning
- Initially forced runoff with rivalRateGeneral=30
- Reduced to 26: player now wins cleanly with active play + generators

**Mayor and above** — TUNING TARGET (not yet playtested; use manual playtest)

---

## Tab Layout (final for Phase 2)

| Tab | Contents |
|---|---|
| Campaign | Knock button, bloc breakdown, reset save |
| Operation | Output summary, all generators (buy here), upgrades shop |
| Platform | Locked (Phase 3) |
| Legacy | Locked (Phase 4) |

---

## What's Next (Phase 3)

Per Implementation Roadmap:
- Issues (3 stances each) + stance selection → aggregate position → emergent ideology
- Interest-group blocs with support meters; segmented pool conversion driven by support
- Primary vs. general bloc composition (the radical→moderate squeeze)
- Flip-flop cost (escalating cash + trust erosion)
- Platform tab

**Done when:** coalition-building meaningfully decides elections and the primary/general squeeze is felt.
