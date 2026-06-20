---
type: production-doc
folder: 07 Production
status: complete
---

# Technical Architecture Requirements — The Long Game

> Implementer-facing spec derived from the design. Read alongside [[Project Summary]] and [[Implementation Roadmap]]. Recommendations are concrete but where marked *(recommended)* a sensible equivalent is acceptable.

## 1. Platform & Constraints
- **Target:** mobile-first **web browser**, portrait, one-handed. Must run smoothly on **mid-range phones** (target **60fps**, small bundle).
- **No backend required for MVP** — fully client-side, offline-capable (PWA optional). No login, no server authority.
- **Active game, full-pause:** no offline progress. All simulation **pauses** when the page is hidden/closed and resumes from saved state (see §6).

## 2. Recommended Stack
- **Language:** **TypeScript** (strict).
- **UI framework:** **Svelte / SvelteKit** *(recommended)* for small bundle + fast reactive UI on mobile; Preact or Vue are acceptable alternatives. Avoid heavy frameworks.
- **State:** a single central **reactive store** holding the serializable game state (Svelte stores / a small custom store).
- **Rendering:** **DOM + CSS** for all UI; **`<canvas>`** for juice/particles ([[Game Feel & Juice]]); **SVG** for vector art.
- **Audio:** Web Audio API, or **Howler.js** with audio sprites.
- **Build:** Vite. **PWA** via a service worker for installability/offline (optional MVP, recommended).
- **Tests:** Vitest for the economy/simulation math.

## 3. Numbers
- **Magnitudes stay realistic** (≤ ~150M voters; cash perhaps low billions) — **well within JS `number` (double, safe to 2^53 ≈ 9e15).** **No big-number library needed for MVP.**
- **But** wrap numeric currency/output in a thin **`Num` abstraction** (type alias + helper fns for add/mul/format) so it can be swapped to **`break_infinity.js`** when the galactic tier exceeds safe doubles. Display via a **K/M/B/T suffix formatter.**

## 4. Data-Driven Content (critical — extensibility requirement)
All content is **declarative config**, not hardcoded, so new offices (incl. the post-MVP galactic tier) and tuning are **data, not code** ([[Vision Statement]]). Define typed config collections for:
- **Offices** (name, era, index, general/primary pool size, timer, rival count, unlocked generators/issues/systems).
- **Generators** (track Field/Finance, rung, baseCost, baseOutput, unlock office).
- **Upgrades** (target, effect, cost, unlock; including ideological forks).
- **Issues** (id, unlock era, stance options + scalar values).
- **Interest groups / blocs** (priority issues, preferred stances, bloc size weighting per primary/general).
- **Ideology designations** (axis ranges → label + bonus/malus).
- **Abilities** (effect, cash cost, cooldown, target type).
- **Minigames** (scenarios, choices → support/Charisma/stance deltas).
- **Events** (form: dilemma/modifier, valence, triggers, effects).
- **Rival archetypes** (lean, behavior profile, difficulty, strengths/weaknesses).
- **Prestige perk tree** (nodes, costs, effects).
- **Achievements** (condition, reward).
- **Balance constants** (the formulas in [[Number Scaling & Curves]]) centralized in one tunable file.

## 5. Simulation / Game Loop
- **Fixed-timestep tick** (e.g., **10–20 Hz**) via `requestAnimationFrame` + an accumulator; **decoupled from render.** All economy/election math advances per tick; UI renders from state reactively.
- **Pure, testable reducers:** `tick(state, dt) → state`. No randomness or I/O inside core math except via an injected seeded RNG.
- **Per-tick election step:** for the player and each rival, convert from each **bloc** at `rate = baseConversion × support × globalStack` (clamped to remaining bloc voters); decrement **timer**; on pool-empty-without-majority, run **elimination** (lowest out, voters → undecided); check **win/lose** conditions.
- **Global multiplier stack:** `support × Volunteers × Prestige × achievements`, applied to taps and generators ([[Economy Model]]).
- **Pause:** the loop **stops accumulating** while `document.hidden` (Page Visibility API) or on blur/close — guaranteeing no progress (and no losses) while away ([[Offline & Idle Progress]]).

## 6. Persistence
- **Autosave** the full state to **`localStorage`** frequently (every few seconds and on every meaningful action and on `visibilitychange`). Use **IndexedDB** if size grows.
- **Versioned schema** with **migration functions**; never break old saves silently.
- **Deterministic, no offline simulation** → inherently **cheat-resistant** (no clock-manipulation exploits). Seeded RNG persisted with the save so events are reproducible across reload.
- **Export/import** save string (recommended). Cloud save = post-MVP.

## 7. Architecture Layers
```
config/      typed content + balance constants (data-driven)
sim/         pure reducers: tick, election, economy, prestige, RNG
state/       central reactive store + selectors
ui/          Svelte components per tab + persistent header + modals
juice/       canvas particle pool, animations, audio triggers
persist/     serialize, migrate, autosave
```
Keep **sim/** free of framework/DOM deps so it's unit-testable and portable.

## 8. Performance Budget
- 60fps on mid-range phones; **object-pool** floating numbers/particles; cap particle counts on low-end; minimize DOM reflow (transform/opacity only); throttle non-critical UI updates.
- Lazy-load later-era assets; sprite atlases; compressed audio.
- **Reduced-motion** and **color-blind-safe** modes ([[Visual & Audio Style]], [[UX & UI Layout]]).

## 9. Input & Feel
- Tap feedback on **`touchstart`/`pointerdown`** (zero perceived latency); support **hold/auto-knock** option; **Haptics** via the Vibration API where available (graceful fallback). ([[Game Feel & Juice]])

## 10. Resolved Technical Decisions
- ✅ **PWA/installable:** include a basic service worker in MVP (offline-capable app shell).
- ✅ **Monetization:** **none in MVP**; keep the codebase monetization-free but structured so it can be added later without rework.
- ✅ **Big-number swap:** stay on JS doubles for MVP (magnitudes are safe); swap the `Num` abstraction to **break_infinity.js** when the post-MVP galactic tier exceeds safe doubles.
- ✅ **Analytics:** optional, **privacy-respecting, opt-in** telemetry to help balance the 8–12-run curve; off by default.
