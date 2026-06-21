---
type: production-doc
folder: 07 Production
status: in-progress
---

# Phase 7 Build Log — Balance, Accessibility, Polish

> Previous head: `400570e` (Phase 6 complete)
> Phase 7 work is on the same branch — no new git head yet (milestones 7.1–7.4 complete, 7.5–7.6 pending).

## Milestone 7.1 — Reduced Motion Accessibility

Added `@media (prefers-reduced-motion: reduce)` blocks to every animated component. Zero new behavior or logic — purely CSS override rules appended to each component's `<style>` block.

**Files changed:** `App.svelte`, `Header.svelte`, `CampaignTab.svelte`, `PresidencyWinOverlay.svelte`, `ResultModal.svelte`, `PlatformTab.svelte`

**Animations disabled per file:**

| Component | What's disabled |
|---|---|
| `App.svelte` | Ticker scroll → static (text remains readable at `translateX(0)`) |
| `Header.svelte` | Runoff badge opacity pulse; urgent timer opacity pulse; player bar `bar-win-pulse`; `.fill` width transition eliminated |
| `CampaignTab.svelte` | Vote floaters set `opacity: 0` (see note below); crit rings set `opacity: 0`; knock-btn transition removed; bloc-fill width transition removed; bloc-shimmer on win disabled; mod-fill transition removed |
| `PresidencyWinOverlay.svelte` | `pres-fade-in` and `pres-rise` entrance animations |
| `ResultModal.svelte` | `fade-in` overlay and `pop-in` card entrance |
| `PlatformTab.svelte` | Stance slider `left` transition; support bar `width` transition |

**Key pattern — floaters/rings use `opacity: 0` not `animation: none`:** These elements are added to a JS array and removed by `setTimeout`. With `animation: none`, the CSS `forwards` fill mode (which holds `opacity: 0` at animation end) never runs, so the element would sit visible until the timeout removes it. Setting `opacity: 0` directly hides them completely regardless of animation state.

---

## Milestone 7.2 — Color-Blind Safety & Tap Targets

### Color-blind safety

**Bloc fills (CampaignTab):**
- `.bloc-fill.rival` background changed `#e74c3c` (red) → `#c8832a` (warm amber)
- Rational: the 5px bloc bars have no text labels — color is the only differentiator between "your share" and "rival share." Blue vs. amber is unambiguous across protanopia, deuteranopia, and tritanopia.
- Added a `"You / Opp"` legend with colored swatches (7×7px squares, `border-radius: 1px`) immediately right-aligned inside the Blocs section label. The `.section-label.blocs-header` gets `display: flex; align-items: center` and `.bloc-legend { margin-left: auto }` to push the legend right without disrupting the label text.

**Rival colors (Header):**
- `RIVAL_COLORS` slot 1 changed `#E8944A` (orange) → `#45A890` (teal)
- Rational: red (#E74C3C) and orange (#E8944A) are nearly indistinguishable for deutan/protan users. Teal is unambiguous from red, yellow, and purple across all colorblind types. Each rival already has text labels (name + %) as primary identification; color is secondary.
- New set: `['#E74C3C', '#45A890', '#E8D840', '#9B59B6']` — red, teal, yellow, purple.

### Tap target sizing

Mobile minimum: 44×44px (iOS HIG) — impractical at this UI density; targeted 32px min-height for compact buttons, 36px for navigation.

| Element | Before | After |
|---|---|---|
| Tab bar `.tab-btn` | `padding: 7px 4px 5px` (~22px) | `padding: 9px 4px 7px; min-height: 36px` |
| Generator `.buy-btn` (OperationTab) | `padding: 3px 6px` (~22px) | `padding: 6px 8px; min-height: 32px` |
| Ability `.ability-btn` (CampaignTab) | `padding: 3px 8px` (~22px) | `padding: 6px 10px; min-height: 32px` |
| Target picker `.target-btn` (CampaignTab) | `padding: 3px 7px` (~22px) | `padding: 6px 9px; min-height: 32px` |
| Perk `.perk-btn` (LegacyTab) | `padding: 4px 8px` (~22px) | `padding: 7px 10px; min-height: 32px` |

Elements already adequate: knock button (120×120px), modal CTAs (padding: 10–13px, ~36–44px), platform promise cards (full-card hit area).

---

## Milestone 7.3 — Buzzer-Loss Warning

**Problem:** Losing at the buzzer felt unfair when the player had no warning they were trailing. The fix telegraphs the loss with enough time to act (~15 seconds).

**Implementation in `Header.svelte`:**

New reactive:
```js
$: atRisk = state.electionResult === 'none'
  && state.timerRemaining > 0
  && state.timerRemaining < 15
  && liveRivals.some(r => r.share > state.voters);
```

Uses actual vote counts (not a fixed % threshold) so it correctly handles multi-rival primaries — a player at 33% may still be leading if rivals are split below that.

**Visual signals:**
- **Timer text:** amber (`#c8a44a`, the game's own warning color) when `atRisk`. Turns red when `urgent` (< 10s). CSS rule order: `.timer.at-risk` defined before `.timer.urgent`, so `urgent` always overrides when both apply — no specificity hacks needed.
- **Player bar:** slow brightness-dimming pulse (`risk-pulse`, 1.2s, `brightness(0.65)` → `brightness(1.0)`) so the bar visually "struggles." Distinct from `bar-win-pulse` (brightens) and `bloc-shimmer` (celebrating). Cannot coexist with `celebrating` — `atRisk` gates on `electionResult === 'none'`, `celebrating` gates on `isWin`.
- **Reduced-motion:** `.fill.player.at-risk { animation: none; }` added to the reduced-motion block.

**State ladder:**
- Normal → white timer, steady bar
- `atRisk` (trailing, 10–15s left) → amber timer, dimming bar pulse
- `atRisk` + `urgent` (trailing, <10s) → red timer (overrides amber), dimming bar pulse
- Winning → no warning classes; `celebrating` class on win

---

## Milestone 7.4 — Fast-Forward Verification

**Verdict: No code bugs found.** Full trace confirmed correctness of every path.

### Traced paths

**Set (`highestOfficeCompleted`):**
- `advanceElection` → updates only when `state.phase === 'general'` (general election wins). Immediately passed into the next `initElection` call via spread.
- `resetRun` → preserves existing `highestOfficeCompleted` on loss; updates to include `state.officeIndex` on presidential victory.
- Persisted in JSON save; v4→v5 migration defaults to -1 for old saves.
- Carries through `freshRunState` (new run start) intact.

**Apply (`initElection` in `sim/election.ts`):**
```js
if (ffPerks.fastForwardSeconds > 0 && officeIndex <= (state.highestOfficeCompleted ?? -1)) {
  timer = ffPerks.fastForwardSeconds;  // 15s
}
```
The `officeIndex` checked here is the **parameter** (target office), not `state.officeIndex`, which is correct — we're asking "is this target office one the player has already completed?"

**Perk prerequisites:** Head Start (1pt) → Fast-Forward (6pt) = 7pt minimum. Typically available after losing at County level (10+ prestige from a run reaching County General). Aligns with mid-game unlocks.

### Dev tool fix

**Problem:** `devSkipToElection` passed `...state` wholesale, so `highestOfficeCompleted` stayed at -1 on a fresh save, making it impossible to quickly test FF without grinding through elections.

**Fix in `gameState.ts`:**
```js
const highestOfficeCompleted = targetOffice > 0
  ? Math.max(state.highestOfficeCompleted ?? -1, targetOffice - 1)
  : (state.highestOfficeCompleted ?? -1);
```
Added to skeleton before `initElection`. Semantically correct: simulating arrival at office N implies completion of offices 0…N-1.

**To test FF in browser:**
1. Skip to any office > 0 (e.g., Mayor Primary) — this now sets `highestOfficeCompleted` to include prior offices
2. Go to Legacy tab, buy **Head Start** (1pt) then **Fast-Forward** (6pt) — requires 7 prestige total
3. Skip back to **City Council Primary** → timer should open at **0:15** instead of the normal 0:54
4. Advance through CC and verify both primary and general run 15s timers

---

## Milestones 7.5–7.6 — PENDING

### 7.5 — Balance Playtest & Tuning (iterative — user drives sessions)

This milestone requires real human playtesting. Use "⚙ Skip to…" dev tool throughout.

**Files to tune:**
- `src/config/offices.ts` — `rivalRatePrimary` / `rivalRateGeneral` per office
- `src/config/balance.ts` — `BAL` constants (timers, multiplier caps, prestige curve)
- `src/config/generators.ts` — base output values if passive rate needs adjustment

**Key balance targets from design docs:**
- CC Primary rival (~14.85/s effective) vs tap-only (~12/s) — rival slightly ahead; 2 generators flip it
- Primary vs general rival rate: currently identical for Mayor+ — may need primary > general since generals have longer timers and carry-over generators
- Prestige +2%/pt validated against era caps (×50 local → ×5000 federal) — if it breaches before 10+ runs, swap to diminishing curve
- All 3 ideology alignments (Left, Center, Right) should win with similar difficulty through County+
- Era walls: Local→County (first positioning system), County→State (biggest), State→Federal (national scale + max rivals)

**Parity check formula (from Phase 2 Addendum):**
`rivalRate × leanMatchAvg(0.825) ≈ tapVoters × humanTapRate`
- `3 × 4 = 12` player tap rate
- CC primary: `18 × 0.825 = 14.85` → rival slightly ahead ✓
- Re-verify this ratio before changing any rival rates

**No new persisted fields expected.** If a structural balance fix requires a new field, bump `SAVE_VERSION` to 7 and add migration in `autosave.ts`.

### 7.6 — Performance Pass

- Add `will-change: transform` to any remaining animated elements not already GPU-composited
- Profile tick loop for hot paths — current suspects: `computeUpgradeEffects` and `computePerkEffects` called every tick even when state hasn't changed (consider memoizing per tick)
- Header rival bar labels: currently use `position: absolute; left: X%` which triggers layout — profile on mobile-tier CPU
- Verify ticker animation is compositor-layer (it uses `translateX` with `will-change: transform` already set ✓)
- Target: 60fps on mid-range phone (Galaxy A series tier)

---

## Architectural constraints carried into Phase 7

- `SAVE_VERSION = 6`. Any new persisted field needs migration in `autosave.ts` and a `SAVE_VERSION` bump to 7.
- All overlays `position: absolute` scoped to `.app-shell` — never `position: fixed`.
- Warm dark palette: bg `#0D0A06`, surface `#1C1510`, border `#2E2218`, gold `#c8a44a`. No cool purple-blue UI chrome.
- All content data-driven in `src/config/` — nothing hardcoded in components.
- `prefers-reduced-motion` blocks now exist in all 6 animated components — any new animation must add a corresponding reduced-motion override.
