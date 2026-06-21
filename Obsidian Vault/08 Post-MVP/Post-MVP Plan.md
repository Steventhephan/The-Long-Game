---
type: production-doc
folder: 08 Post-MVP
status: planning
---

# Post-MVP Plan — The Long Game

> This document covers everything deferred from the MVP. The MVP is defined as: 8 offices, 16 elections, full dynasty meta, all five depth systems, Presidential win state. **All features below require the MVP to be shipped and playtested first.**

---

## Priority Stack

Ordered by player value vs. implementation cost:

1. **Galactic Republic Tier** — the "numbers go up forever" payoff; highest retention value
2. **Difficulty Modes** — expands the audience without new content
3. **Cloud Save** — unlocks multi-device and prevents player churn from lost saves
4. **Monetization** — enables sustainable development of everything else
5. **Localization** — Spanish first (largest adjacent audience for a U.S. politics game)
6. **Branching Ladder** — biggest design lift; do last once the base loop is proven

---

## 1. Galactic Republic Tier

### Concept

After winning the Presidency, the player discovers the game doesn't end — it escalates. A satirical "Galactic Republic" tier extends the ladder upward, preserving the incremental payoff. Framing is warm absurdist: Earth's political machine has gotten big enough to go interstellar.

### Offices (draft)

| Office | Era | Pool scale |
|---|---|---|
| UN Secretary-General | Global | ~4.3× President pool |
| Planetary Governor | Galactic-Local | ~4.3× |
| Galactic Senator | Galactic-County | ~4.3× |
| Galactic Chancellor | Galactic-State | ~4.3× |
| Supreme Architect | Galactic-Federal | Win condition (loop) |

> Numbers go up forever: after Supreme Architect, a new dynasty starts at a scaled baseline. The loop is the payoff.

### Design decisions needed

- **New blocs**: Corporations, Colonists, AI Rights Groups, Energy Cartels, Frontier Worlds — keeping the political satire grounded but absurd. Must be as even-handed as Earth blocs.
- **New generators**: Two new rungs (9 + 10) to unlock at Galactic-Local and Galactic-County. Names to reflect galactic scale (Outreach Drone Network, Interplanetary Media Consortium, etc.).
- **Big-number library**: Current pools use JS-safe doubles (max ~9 quadrillion). Galactic pools will exceed this by rung 12–14. Need to evaluate: `break_infinity` or custom suffix display. Keep existing `formatNum` API, swap internals.
- **Prestige loop**: Galactic offices should add substantially to the prestige curve. Consider a second prestige tier ("Legacy Points") that persists across galactic loops.
- **Timer scaling**: `BAL.timerGrowth = 1.4` continues. Supreme Architect General would run ~3.8 hours of active play — probably cap timers at 20 minutes and adjust pools instead.

### Implementation path

1. Extend `OFFICES` array with 5 new entries; `MAX_OFFICE_INDEX` → 12
2. Add 2 new generator rungs to each track
3. Add 5 new bloc definitions (with appropriate `unlockOfficeIndex`)
4. Add galactic rival archetypes to `config/rivals.ts`
5. Update `PresidencyWinOverlay` to trigger at `officeIndex === 7` (Presidency) but not end the game — advance to Galactic tier
6. New win condition: completing a Galactic loop (Supreme Architect General) → prestige-and-reset
7. Evaluate big-number library swap

---

## 2. Difficulty Modes

### Concept

A single setting chosen at dynasty start (not changeable mid-run). Affects rival rates globally via a multiplier on `rivalRatePrimary` and `rivalRateGeneral`. No balance re-tuning needed — just a scalar.

### Modes

| Mode | Rival rate multiplier | Target audience |
|---|---|---|
| Campaign Trail (Easy) | 0.65× | Casual / story-first players |
| The Long Game (Normal) | 1.0× | Current calibrated balance |
| Iron Will (Hard) | 1.35× | Veterans who want a challenge |
| Bloodbath (Brutal) | 1.75× | Masochists; no Fast-Forward perk |

### Implementation

- Add `difficultyMult: number` to `GameState` (default 1.0)
- Apply in `officeRivalRate()` before returning
- `SAVE_VERSION` bump required (add migration default of 1.0)
- Dynasty-start screen: show mode selector before first run
- Mode selection locked after the first election (prevent switching mid-run)

---

## 3. Cloud Save

### Concept

Replace (or augment) localStorage autosave with server-side save. Enables multi-device sync and prevents save loss. Requires an account system.

### Requirements

- Anonymous play still works (localStorage only) until the player opts in
- Account creation: email + password, or OAuth (Google / Apple Sign-In)
- Save data: JSON blob, versioned, same schema as current autosave
- Conflict resolution: "which save is newer?" based on `runNumber` and timestamp

### Stack options

| Option | Pros | Cons |
|---|---|---|
| Firebase Firestore | Fast setup, free tier generous | Google dependency |
| Supabase | OSS, Postgres, good free tier | Slightly more setup |
| Cloudflare Workers + KV | Lowest latency, cheap at scale | Most custom work |

**Recommendation:** Supabase for the first pass — row-level security maps cleanly to the save-per-user model, and the free tier handles thousands of players.

### Implementation path

1. Auth UI: modal at game start or Settings tab
2. `persist/cloudsave.ts`: wraps Supabase client, mirrors `autosave.ts` API
3. On load: compare cloud save vs. localStorage; take whichever has higher `runNumber`
4. On save: write both (localStorage as offline backup)
5. `SAVE_VERSION` bump if new fields added

---

## 4. Monetization

### Decision context

MVP is free, client-side, no ads. Post-MVP monetization should not compromise the core experience or create pay-to-win dynamics.

### Options

| Model | Player impact | Revenue potential |
|---|---|---|
| "Buy me a coffee" tip button | Zero friction, fully optional | Low (but honorable) |
| One-time purchase to unlock Galactic tier | Paywall on new content only | Medium |
| Cosmetic dynasty skins | Visual only, no gameplay change | Medium (requires art) |
| Optional "Head Start" boost | Conflicts with Design Pillar 5a (effort always pays) | Avoid |

**Recommendation:** One-time purchase (≈$4.99) to unlock the Galactic Republic tier, with the MVP ladder (City Council → President) remaining free forever. This is the "shareware" model — give the full base game free, charge for the extension.

### Implementation notes

- Payment processor: Stripe (web) + RevenueCat (if native app later)
- Entitlement check: server-side (tied to Cloud Save account)
- Free players still see the Galactic tier teased (grayed out after Presidency win) to drive conversion

---

## 5. Localization

### Priority order

1. **Spanish (es-US)** — largest non-English US political audience; thematically relevant
2. **French (fr)** — large Francophone incremental game community
3. **German (de)** — strong incremental game market in DACH

### Implementation

- i18n library: `svelte-i18n` (lightweight, integrates naturally with Svelte reactivity)
- String keys: replace all user-visible strings with `$_('key')` calls
- Translation files: `src/i18n/en.json`, `src/i18n/es.json`, etc.
- Political flavor text (ticker lines, rival names, event text) needs cultural adaptation, not just translation — consider hiring native-speaker writers for each locale
- Language selector: Settings tab or first-run prompt

### Scope caveat

The game's humor is deeply American (U.S. offices, U.S. political archetypes). True localization for non-US markets would require adapting the office ladder (City Council → President is not universal). Consider a "U.S. Politics Pack" framing and designing a separate "localized politics pack" per market — same engine, different config.

---

## 6. Branching Ladder

### Concept

Currently the ladder is strictly linear. A branching ladder would let players choose their path — e.g., run for Mayor OR County Council after City Council, with different bloc compositions and rival archetypes per path.

### Design considerations

- Branching increases replayability significantly but also content requirements (each branch needs rivals, blocs, balance tuning)
- The even-handedness pillar (5b) must extend to paths: no path should feel obviously superior
- Prestige weighting: how do you compare a player who ran Mayor → Governor vs. County → State Legislature? Need a new weight formula.
- Suggested scope: **two branches at the Local→County transition** (Mayor or County Council as the County entry point), converging at State Legislature. This adds one branch point without exploding the content matrix.

### Implementation (draft)

- `OfficeDef` gains an optional `nextOffices: string[]` field (defaults to `[nextIndex]` for linear progression)
- After winning a General, player presented with branch choice if `nextOffices.length > 1`
- `GameState.officeIndex` stays an index; office graph replaces the simple array
- Balance tuning: each branch office pair playtested independently

---

## Rejected Post-MVP Ideas

These came up in design and were explicitly cut:

- **Governing / policy-enactment**: The game is about *winning* offices, not holding them. Implementing a governing phase would require a fundamentally different game loop. Cut permanently.
- **Offline accrual / idle mode**: Active engagement is a design pillar (Pillar 4). Adding offline income directly contradicts it. The game full-pauses when closed. Cut permanently.
- **PvP / leaderboards**: Incremental games work poorly with direct PvP. Leaderboards add stress without fun. Cut permanently.
- **Narrative campaign / story mode**: The warm satire works through systemic emergence (your choices, your rival's archetype), not authored story. Cut permanently.
