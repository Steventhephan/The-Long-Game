---
type: production-doc
folder: 07 Production
status: complete
---

# Phase 5 Build Log — Depth Systems & Era Hooks

> Read after [[Phase 4 Build Log]]. Documents Phase 5 and a post-build bug fix. **Git head: `cb1821f`. Next phase is Phase 6** (Full Content & Presentation — visual style, audio, juice, narrative).

---

## What Was Built

### System 1 — Charisma → Volunteers (all eras)

**Hook was already in `computeStack`** via `BAL.volunteerMult(state.volunteers)`:
- `volunteerMult(v) = 1 + Math.log10(1 + v) / 2`
- At v=0: ×1.0 (no bonus); v=100: ×2.0; v=1000: ×2.5

**New in Phase 5:**
- `BAL.baseVolunteerRate = 0.5` volunteers/sec at Charisma=0 (Local baseline)
- `BAL.charismaVolunteerRate = 2.0` additional volunteers/sec per Charisma point
- `tick()` adds `(baseVolunteerRate + state.charisma × charismaVolunteerRate) × dt` per tick
- Volunteers persist within a run (reset on run loss); Charisma also persists within run
- Display: **Operation tab** shows Volunteers count + accrual rate + Charisma tag

**Design note:** Local era provides base accrual (Charisma=0 still gives 0.5/s). County era minigames grant Charisma (+1–2 per debate answer), which scales volunteer rate meaningfully by mid-run. The `Charisma Prodigy` perk hook (Phase 4 stub) is partially completed by this system — the perk's `accrualBonus` effect is wired to Charisma display but the stat itself is set by minigames.

---

### System 2 — Opposition Archetypes + Per-Office Rivals

**Critical bug fixed from Phase 4:** `advanceElection` and `freshRunState` both hardcoded `CITY_COUNCIL_RIVALS` for every office, so all races used 1 rival at lean=0.3 regardless of `OfficeDef.rivalCount`. County should have 2, State 3, Federal 4.

**`config/rivals.ts`** — expanded to full 8-office roster:
- Separate `primary` and `general` rival lists per office (primary = same-side, general = cross-party)
- Rival counts: Local 1, County 2, State 3, Federal 4
- **6 archetypes** from design doc: Career Politician (baseline, lean moderate), Establishment Favorite (center, high conversionMod ~1.2–1.4, strong in Moderates/Seniors), Radical Insurgent (extreme lean, strong in base partisan blocs, weak in center), Charismatic Outsider (center-ish, moderate conversionMod, no bloc specialization), Self-Funding Mogul (high conversionMod ~1.3–1.6, strong in donor/business blocs), Single-Issue Crusader (low conversionMod ~0.7–0.9, overwhelming bonus in 1–2 blocs, penalties elsewhere)

**New fields on `RivalStaticDef` and `RivalState`:**
```typescript
conversionMod: number;   // multiplier on office rivalRate (1.0 = baseline)
strongBlocs: string[];   // groupIds where rival gets ×1.5 rate bonus
weakBlocs:   string[];   // groupIds where rival gets ×0.5 rate penalty
name: string;            // display name (shown in Header)
```

**`tick()` archetype behavior:**
```typescript
let archMod = rival.conversionMod ?? 1.0;
if (rival.strongBlocs.includes(bloc.groupId)) archMod *= BAL.abilityArchetypeConvBonus; // 1.5
if (rival.weakBlocs.includes(bloc.groupId))   archMod *= BAL.abilityArchetypeConvPenalty; // 0.5
const rivalRate = (state.rivalRate / blocCount) * leanMatch * archMod * rConvMult;
```

The existing lean-match formula (`0.5 + 0.5 × (1 − |lean_rival − lean_bloc| / 2)`) handles natural bloc affinity; `strongBlocs`/`weakBlocs` add archetype-specific flavor on top.

**`Header.svelte`** — fixed:
- `officeName` now uses `getOffice(state.officeIndex).name` (was hardcoded "City Council")
- Shows **lead rival** (highest non-eliminated share) + `+N` badge for extra rivals
- Rival display name comes from `state.rivals[i].name` (stored in RivalState)

**`gameState.ts` → `advanceElection` and `freshRunState`** now call `getRivals(officeIndex, phase)`.

---

### System 3 — Minigames (County era debut, officeIndex ≥ 2)

**`config/minigames.ts`** — 7 scenarios:
| Type | ID | Mandatory | Effect Focus |
|------|----|-----------|--------------|
| Debate | `debate_taxes` | yes | stanceCommit taxes_spending + bloc deltas + Charisma |
| Debate | `debate_healthcare` | yes | stanceCommit healthcare + bloc deltas + Charisma |
| Debate | `debate_policing` | yes | stanceCommit policing + bloc deltas + Charisma |
| Town Hall | `town_hall_education` | no | $300, 60s cd | bloc deltas + Charisma (no stance) |
| Town Hall | `town_hall_housing` | no | $300, 60s cd | bloc deltas + Charisma |
| Fundraising Gala | `fundraising_gala_donors` | no | $200, 90s cd | cash + bloc delta |
| Fundraising Gala | `fundraising_gala_business` | no | $200, 90s cd | cash + bloc delta + Charisma |

**`MinigameEffect` kinds:** `charisma`, `blocSupport`, `cash`, `stanceCommit`

**`stanceCommit` in debates:** directly sets `platform[issueId] = stanceId` and increments `flipFlopCounts` to 1 (marks stance as "on record"). No cash cost at debate time, but reversal in PolicyModal will trigger flip-flop costs. This is a departure from PolicyModal's `applyStanceChange` which respects cash.

**Mandatory debate trigger in `advanceElection`:**
```typescript
const electionsCompleted = nextOffice * 2 + (nextPhase === 'primary' ? 0 : 1);
const pendingMinigame = nextOffice >= 2
  ? DEBATES[electionsCompleted % DEBATES.length].id
  : null;
// Sets isPaused = true; race timer doesn't run until debate resolved
```
Cycles through 3 debates across elections. Each County+ election starts with a paused debate.

**Optional minigames** (Town Hall, Gala): buttons in Campaign tab "Outreach" section (County era+). `openOptionalMinigame()` in `gameState.ts` checks cooldown (`minigameCooldowns[type]`) and cash; sets `pendingMinigame` + `isPaused = true`; deducts cash.

**`MinigameModal.svelte`** — sheet-from-bottom modal, gold confirm button. Renders when `state.pendingMinigame !== null`. Bug fixed: reactive reset uses `state.pendingMinigame !== _lastMinigameId` (not `if (minigame)` which fired every tick).

**New state fields:** `pendingMinigame: string | null`, `minigameCooldowns: Record<string, number>`

---

### System 4 — Abilities (State era debut, officeIndex ≥ 4)

**`config/abilities.ts`** — 6 abilities:
| ID | Name | Category | Cost (base) | Cooldown | Effect |
|----|------|----------|-------------|----------|--------|
| `puffpiece` | Puff Piece | boost | $200 | 45s | conversionMult ×1.4 for 15s |
| `fundraiser` | Fundraiser | boost | $150 | 60s | instant cash: cost × 4 (net +$450 base) |
| `court_interest_group` | Court Interest Group | boost | $250 | 50s | blocSupportDelta +0.4 for 20s (pick bloc) |
| `ad_blitz` | Ad Blitz | boost | $500 | 90s | conversionMult ×1.6 for 12s |
| `grassroots_surge` | Grassroots Surge | boost | $400 | 75s | conversionMult ×1.5 for 20s (Governor+) |
| `hitpiece` | Hit Piece | offensive | $300 | 60s | rivalConvMult ×0.5 for 20s (pick rival) |

**Cost scaling:** `Math.round(ability.baseCost × BAL.timerGrowth ^ officeIndex)` — costs scale with office tier so abilities stay relevant.

**`activateAbility(state, abilityId, targetId?)` in `gameState.ts`:** checks cooldown, cost, office unlock; fires effect; returns updated state or null if can't fire. Permanent cash sinks (fundraiser) applied immediately; timed effects pushed to `state.eventModifiers` as `EventModifier` entries.

**Ability effects use the same `eventModifiers` array as events** — shared display and expiry system.

**`tick()`:** `decayCooldowns(state.abilityCooldowns, dt)` each frame. Each cooldown entry is a key→seconds-remaining record.

**Campaign tab abilities UI (State era+):** Full-width card stack under "Abilities" section header. Each card shows name, description, cost, cooldown bar or ready indicator. Abilities requiring a target (bloc/rival) show an inline target picker when their button is tapped. No separate modal.

**New state fields:** `abilityCooldowns: Record<string, number>`

---

### System 5 — Events & Crises (State era debut)

**`config/events.ts`** — 9 starter events:

| ID | Type | Valence | Trigger |
|----|------|---------|---------|
| `scandal_breaks` | dilemma | neg | state: total flip-flop count > 3 |
| `endorsement_offer` | dilemma | pos | random |
| `economic_report` | dilemma | neutral | random |
| `october_surprise` | dilemma | neg | scheduled: timer ≤ 20s in general |
| `viral_moment` | modifier | pos | random |
| `gaffe` | modifier | neg | state: Charisma < 2 |
| `rival_scandal` | modifier | pos | random → targets a rival |
| `grassroots_wave` | modifier | pos | state: volunteers > 500 |
| `donor_backlash` | modifier | neg | state: heavy flip-flopping proxy |

**Two event forms:**
- **Dilemma** (4 events): race pauses (`isPaused=true`), `EventModal.svelte` shows, player picks a response, `resolveEvent()` applies effects + clears `activeEvent`
- **Modifier** (5 events): no pause, fires instantly in `tick()`, stored in `eventModifiers` with duration

**Event triggering in `tick()` (State/Federal era only):**
```typescript
// Random events: BAL.eventBaseChance = 0.012/sec, BAL.eventMinGap = 30s
if (newEventCooldown <= 0 && Math.random() < BAL.eventBaseChance * dt) { ... }
// Scheduled October Surprise: detect timer crossing 20s in generals
const crossedLate = phase === 'general' && timerRemaining > 20 && (timerRemaining - dt) <= 20;
```

**`EventModifier` system** (shared by abilities and events):
```typescript
interface EventModifier {
  id: string; label: string;
  kind: 'conversionMult' | 'cashMult' | 'blocSupportDelta' | 'rivalConvMult';
  magnitude: number;
  duration: number;  // seconds remaining; tick() decrements
  groupId?: string;  // for blocSupportDelta
  rivalIndex?: number;  // for rivalConvMult
}
```

Effects in `tick()`:
- `conversionMult`: multiplies `BASE_CONV × mediaDarlingMult × support × stack`
- `cashMult`: multiplies `cashPerSec × stack`
- `blocSupportDelta`: temporary bloc support boost (applied at point-of-use, not stored)
- `rivalConvMult`: multiplies a specific rival's conversion rate

**Modifier display:** persistent banners above KNOCK button in Campaign tab. Green for positive (magnitude ≥ 1.0), red for negative. Shows label + effect summary + duration bar.

**`EventModal.svelte`** — same sheet-from-bottom pattern as MinigameModal. Same reactive fix applied (`_lastEventId` tracking).

**New state fields:** `activeEvent: ActiveEventState | null`, `eventModifiers: EventModifier[]`, `eventCooldown: number`

---

### System 6 — Ideological Forks (Federal era, officeIndex ≥ 6)

Three mutually-exclusive fork upgrades in `config/upgrades.ts` under `category: 'fork'` and `exclusiveGroup: 'ideology_fork'`:
- `fork_progressive` — ×1.5 tapMult, commit to progressive identity
- `fork_moderate` — ×1.5 tapMult, commit to moderate identity
- `fork_conservative` — ×1.5 tapMult, commit to conservative identity

All cost $50,000 at Federal prices. `unlockRung: 6`. The existing upgrade machinery handles display, purchase, and mutual exclusivity. Phase 6 can enhance these with ideology-aware bloc bonuses when content is filled out.

---

### UI layout additions

**Campaign tab sections (era-gated):**
1. **Modifier banners** (State+): persistent strip showing active EventModifiers/ability effects
2. **Outreach** (County+): optional minigame buttons (Town Hall, Gala) with cooldown/cost display
3. **Abilities** (State+): card stack with target pickers

**Operation tab:**
- New top row: Volunteers count + accrual rate + Charisma tag (always visible)

---

## Post-Build Bug Fix (`cb1821f`)

**Root cause:** During HMR (hot module replacement) development, partial saves were written at SAVE_VERSION=6 with `rivals` in the old format (no `conversionMod`/`strongBlocs`/`weakBlocs`). Since these saves were already v6, the v5→v6 migration skipped the rival-patching step. On the first `tick()`, `rival.strongBlocs.includes(...)` threw `TypeError: Cannot read properties of undefined`, permanently killing the `requestAnimationFrame` loop. Tapping worked (knockDoors is outside the loop) but all passive generation and rival conversion stopped.

**Three-layer fix:**
1. `cloneRivals`: `?? []` defaults on strongBlocs/weakBlocs
2. Rival loop in `tick()`: `?? 1.0` / `?? []` at every archetype field access
3. `decayCooldowns`/`decayModifiers` calls: `?? {}` / `?? []` defaults
4. `main.ts`: try-catch around `gameStore.update(tick)` — loop survives future tick errors
5. `autosave.ts`: always re-patches rivals + validates Phase 5 fields on every load regardless of save version

---

## Architecture notes

- `computePerkEffects(state)` is still called per-tick O(n perks). Now `tick()` also calls `decayCooldowns` (O(n abilities)) and `decayModifiers` (O(n modifiers)). Both are tiny arrays. No memoization needed.
- `EventModifier` is the shared type for both ability timed effects AND event modifier strikes. Single display and expiry path.
- Minigame `stanceCommit` bypasses the normal `applyStanceChange` cash-and-trust logic. The flip counter is incremented, marking the stance for future cost, but no cash charged at debate time.
- `DEBATES[electionsCompleted % DEBATES.length]` cycles through 3 debates across 12 County+ elections. Each appears 4× per full run.
- `october_surprise` scheduled trigger uses timer-crossing detection (`timerRemaining > 20 && timerRemaining - dt ≤ 20`) rather than a flag, so it fires exactly once per general regardless of tick rate.
- The game loop try-catch in `main.ts` is the last line of defense. Errors should be prevented upstream (defensive defaults), but a stale HMR state or future migration gap won't permanently break the loop.

---

## What's Next — Phase 6

Per Implementation Roadmap:
- **All 8 offices / 16 elections** fully content-complete (currently offices 0–7 exist in config but later ones lack distinct flavor/rivals/events)
- **Vintage-Americana visual style** — color palette, typography, iconography
- **Audio** — ambient sounds, tap SFX, election win/loss stings
- **Juice** — tap-first feel, particle effects, screen shake on crit, vote bar animations
- **Flavor / narrative** — Veep-gentler × The Onion: office descriptions, rival flavor text, event copy polish
- **News ticker** — ambient scrolling flavor during elections
- **Characters** — candidate portrait and rival portraits
- **Announcer** — text callouts for big moments (first crit, first win, first loss, prestige milestones)
- **Win state** — President = victory screen + credits + "Start a new dynasty"
- **Done when:** complete MVP is content-complete and on-style
