---
type: production-doc
folder: 07 Production
status: complete
---

# Phase 6 Build Log — Full Content & Presentation

> Head at phase completion: `400570e`
> Previous head: `cb1821f` (Phase 5 complete)

## Milestone 6.1 — Visual Design System

**Warm dark palette applied globally:**
- `index.html`: body bg `#0f0f1a` → `#0D0A06`, theme-color `#1a1a2e` → `#1C1510`
- All components: cool `#1a1a2e` surfaces → `#1C1510`, `#2a2a3e` borders → `#2E2218`, `#3a3a5a` tracks → `#302418`
- Vote floater color `#a8d8ff` → `#F0E8D8`
- KNOCK label letter-spacing `0.12em` → `0.18em`

**Multi-rival bar system** (Header.svelte — heavily reworked):
- `RIVAL_COLORS = ['#E74C3C', '#E8944A', '#E8D840', '#9B59B6']` — visually varied, stable by original `state.rivals[]` index (colors don't shift on elimination)
- `stackedRivals` computed with cumulative `rightOffset` so each rival gets a non-overlapping segment stacked inward from the right edge
- Each rival bar: `right: {rightOffset}%; width: {width}%`
- Labels: `position: absolute; left: {100 - rightOffset - width/2}%; transform: translateX(-50%)` — centered under segment midpoint, showing `lastName(rival.name)` + pct, both in rival's color
- Rivals sorted largest→smallest so wider bars render first (behind), narrower on top
- `.rival-bio` removed — names are always visible on the bar itself

**Outreach grid fix**: Changed from `flex-wrap` to `grid-template-columns: 1fr 1fr` to prevent orphaned full-width card.

**Bug fixes in 6.1:**
- `playerBaseConv: 0.5` → `0` in `balance.ts` (votes were generating at game start with no taps/generators)
- PolicyModal: removed back button; header `position: relative`, close btn `position: absolute; right: 12px`, title full-width centered
- Flip warning text: was showing "Trust reduced to 100% after last flip" on first flip when trust was still 1.0. Replaced with mechanic explanation: "Repeated flip-flops erode bloc trust — making this policy weaker at converting voters." Made conditional on `trust < 1.0`.
- Outreach `effectSummary`: was showing raw `groupId.replace(/_/g, ' ')`. Fixed to use `INTEREST_GROUPS.find().shortName`.
- Auto-debate popup removed from `advanceElection` in `gameState.ts` (was pausing and setting `pendingMinigame` on every election start). Also set all 3 debates `mandatory: false` in `minigames.ts`.

## Milestone 6.2 — Flavor & Narrative Content

**New file: `src/config/flavor.ts`**
- `OfficeTitleCard` interface + `OFFICE_TITLE_CARDS: Record<string, OfficeTitleCard>` — 8 offices, each with a `tagline` and `quote`. Shown in `ResultModal` on general election wins (next office preview).
- `ARCHETYPE_BIOS: Record<string, string>` — one-liner bios for all 6 archetypes: `career_politician`, `establishment_favorite`, `radical_insurgent`, `charismatic_outsider`, `self_funding_mogul`, `single_issue_crusader`.
- `TICKER_LINES: Record<string, string[]>` — 8 lines per era (local/county/state/federal), Veep-gentle × The Onion tone.

**ResultModal.svelte**: Added `nextTitleCard` reactive — on general-election wins (non-presidential), shows the next office's title card (tagline + quote) before the continue button.

## Milestone 6.3 — News Ticker

**Added to App.svelte** between tab-content and tab-bar:
```svelte
<div class="ticker-wrap">
  <div class="ticker-track">
    <span class="ticker-text">{tickerContent}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{tickerContent}</span>
  </div>
</div>
```
- Content rendered **twice** in one span. `@keyframes ticker-scroll { from: translateX(0); to: translateX(-50%) }` at 55s. Scrolling exactly one copy-length wraps seamlessly.
- `era` derived from `eraForOffice($gameStore.officeIndex)`, selects the appropriate `TICKER_LINES` array.
- Fixed layout bleed: `min-width: 0; width: 100%` on `.ticker-wrap`.
- Height: 22px, color `#4A3C30` (muted amber), italic.

## Milestone 6.4 — Presidential Win State

**New file: `src/ui/PresidencyWinOverlay.svelte`**
- Full-screen `position: absolute; inset: 0` at z-index 200. Dark `#0A0705` background.
- Shows when `(result === 'win' || result === 'runoff_win') && officeIndex === MAX_OFFICE_INDEX && phase === 'general'`
- Content: 🏛️ seal, "Run #N" eyebrow, "PRESIDENT" in gold caps, vote pct, prestige-banked banner, **Dynasty Record table** (all past runs from `state.runHistory` with run number, highest office, prestige earned, running total), "Start a New Dynasty →" CTA
- CTA calls `resetRun(state, true)` — same as before, just in a new full-screen context
- Animations: `pres-fade-in` (opacity) + `pres-rise` (translateY 20px → 0) on mount

**ResultModal.svelte**: Added `&& !isPresidencyWin` to `$: show` guard — prevents the normal card modal from rendering underneath the overlay.

**MinigameModal.svelte**: Removed orphaned `.mandatory-note` CSS rule.

## Milestone 6.5 — Juice

**CampaignTab.svelte:**
- **Crit ring**: each crit spawns a `div.crit-ring` via a `critRings: CritRing[]` array (same pattern as floaters). Each ring is a new independent DOM element, so rapid crits stack concurrent rings correctly. `@keyframes ring-expand`: scale 0.88 → 1.85, opacity 0.9 → 0, 0.55s.
- **Floater pop-in**: `@keyframes float-up` now 3-stop — spawns at scale(1.2), settles to scale(1.0) at 18%, drifts to scale(0.75) at fadeout. Crit float duration 750ms → 1200ms, normal 750ms → 800ms.
- **Bloc shimmer on win**: `$: isWin` reactive, `class:celebrating={isWin}` on `.blocs-section`. `.blocs-section.celebrating .bloc-fill.you` runs `@keyframes bloc-shimmer` (brightness 1 → 2.0, 6 iterations alternate).

**Header.svelte:**
- `$: isWin` reactive, `class:celebrating={isWin}` on `.fill.player`.
- `.fill.player.celebrating` runs `@keyframes bar-win-pulse` (brightness 1 → 1.8 + blue glow, 5 iterations alternate).

## Milestone 6.6 — Audio

**New file: `src/audio/sounds.ts`**
- Web Audio API engine. `AudioContext` created lazily on first call to `unlockAudio()`.
- All play functions are no-ops until `unlockAudio()` is called (browser autoplay policy compliance).
- `tone(freq, freqEnd, duration, type, volume, startDelay)` — internal primitive that creates osc + gain, schedules exponential ramp.
- `playTap()` — triangle wave 300→150Hz, 60ms
- `playCrit()` — sawtooth sweep 420→900Hz (140ms) + delayed sine sparkle at 1300Hz
- `playWin()` — C-E-G-C ascending arpeggio (sine, 4 notes × 100ms apart)
- `playLoss()` — G-Eb-C-G descending minor phrase (sine, 4 notes × 160ms apart, with slight pitch drop)

**App.svelte**: `on:pointerdown={unlockAudio}` on `.app-shell` — captures first user touch anywhere.

**CampaignTab.svelte**: `playTap()` / `playCrit()` called in `onKnock()` before vibrate.

**ResultModal.svelte**: `prevResult` variable tracks last-seen result; reactive block fires `playWin()` / `playLoss()` only when result transitions (not on every render).

## Dev Tool (post-Phase 6)

**`devSkipToElection(state, targetOffice, targetPhase)`** added to `gameState.ts`:
- Pre-buys 2 of each generator available at target office (both tracks)
- Starting cash = `5 × 75 × 8^targetOffice`
- Preserves prestige/perks/platform; resets all combat state
- Calls `initElection` with correct rivals and rival rate

**CampaignTab.svelte**: "⚙ Skip to…" `<select>` next to Reset Save button. 16 options (8 offices × primary/general). Styled dark/muted to visually distinguish as dev UI. Resets to placeholder after selection.

## Key Architectural Notes

- `SAVE_VERSION` unchanged at 6 — no new persisted fields in Phase 6.
- All overlays remain `position: absolute` scoped to `.app-shell` (never `position: fixed`).
- All flavor/copy content lives in `src/config/flavor.ts`, not hardcoded in components.
- Ticker loop: content rendered twice; `translateX(-50%)` animation = seamless loop.
- Rival colors stable across eliminations: assigned by `state.rivals[]` index, not display rank.
- Crit rings use same floater array pattern (independent DOM elements per event = correct stacking for rapid inputs).
- Audio unlock: `on:pointerdown` on `.app-shell` in App.svelte fires before any sound is needed.
