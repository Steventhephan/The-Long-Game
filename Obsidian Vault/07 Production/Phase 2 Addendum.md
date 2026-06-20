---
type: production-doc
folder: 07 Production
status: complete
---

# Phase 2 Addendum — Post-Release Balance Rebase & UI Polish

> Decisions made after the Phase 2 Build Log was written. **Read this after [[Phase 2 Build Log]] and before starting Phase 3.** Git range: `edfd635` → `14997c7`.

---

## Balance Rebase: tapVoters 7 → 3

### Why tapVoters changed

After playtesting, the user wanted 1 vote per tap for thematic clarity (knocking one door = one voter). tapVoters=1 was impractical because `round(1 × 1.4^officeIndex)` stalls at 1 for both City Council AND Mayor — no progression. tapVoters=3 was the chosen compromise:

- Thematically still reads as "a few people per door-knock"
- Per-office tap scaling: **3, 4, 6, 8, 12, 16, 23, 32** (clean progression)
- At 4 taps/sec: 12/s from tapping — rivals calibrated slightly above this so tapping alone loses

### Final balance constants

```
PHASE1.tapVoters = 3      // was 7
PHASE1.tapCash   = 2      // unchanged
```

**Field generator base output:** `FIELD_OUT_0 = 5.0` (raised from 2.0 to compensate)
**Finance generator base output:** `FINANCE_OUT_0 = 2.0` (unchanged — cash flow stays the same)

These are separate constants in `config/generators.ts`. Field uses `fieldOutput(rung)`, finance uses `financeOutput(rung)`.

### Rival rates after rebase

All rival rates rescaled from the new tapVoters=3 baseline. Parity formula: `rivalRate × 0.825 ≈ tapVoters × 4 = 12`.

| Office | Primary | General |
|---|---|---|
| City Council | **18** | **13** |
| Mayor | 45 | 45 |
| County Council | 112 | 112 |
| County Executive | 280 | 280 |
| State Legislature | 700 | 700 |
| Governor | 1750 | 1750 |
| Senate | 4375 | 4375 |
| President | 10900 | 10900 |

CC primary 18 gives effective ~14.85/s — rival slightly ahead of tap-only (12/s), 2 generators flip it. All Mayor+ are TUNING TARGETs.

---

## UI Changes (post-Phase-2)

### Tab layout (final)

| Tab | Contents | Unlock |
|---|---|---|
| Campaign | Knock button + bloc bars + rate display + reset | Always |
| Operation | Output summary + generators + upgrades shop | Always |
| Platform | — | Phase 3 |
| Legacy | — | Phase 4 |

Generators were **removed from Campaign tab** (redundant with Operation). Operation is **always unlocked** from game start (no first-generator gate).

### Campaign tab rate display

Two small stats below the KNOCK button: `👥 X/s` and `💰 $Y/s`.
- **Idle**: shows passive generator output only, muted dark grey
- **Active** (within 600ms of last tap): numbers jump to passive + tap contribution (rolling 2s tap-rate window × expected crit multiplier), turn blue/gold
- Computed in `CampaignTab.svelte` using `computeStack` + `computeUpgradeEffects` from `election.ts`

### Crit display on KNOCK button

Shows `{critChance}% ⚡` — reactive via `computeUpgradeEffects(state).critChance`. Updates immediately when crit upgrades are purchased. Uses ⚡ not "crit" text.

### Upgrade list sort in Operation tab

- **Unpurchased**: top of list, original unlock order
- **Purchased**: bottom, grouped by category (tap → field → finance)
- No trailing periods in descriptions

### Generator row visibility

`.gen-row` base opacity raised from 0.55 → 0.75; `.gen-row.empty` class removed. All generators visible at 75% opacity; affordable ones highlight to 100% + border tint. Previously 0-owned rows were too dim and confused players.

### Screen height consistency fix

`min-height: 0` added to `.tab-content`, `.campaign-tab`, and `.operation-tab`. Without it, flex children don't shrink below content height, causing the Operation tab (taller content) to push the shell taller than the Campaign tab. `overflow: hidden` added to `html`, `body`, `#app`, and `.app-shell`.

---

## Next: Phase 3

**Phase 3: Policy, Platform & Interest Groups** (the keystone system):
- Issues (3 per era, start with Local 3) + stance selection → aggregate position → emergent ideology
- Interest-group blocs with support meters; segmented pool conversion driven by support
- Primary vs. general bloc composition (radical→moderate squeeze)
- Flip-flop cost (escalating cash + trust erosion)
- Platform tab

See [[Implementation Roadmap]] and [[Policy, Platform & Interest Groups]] design note.
