# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (URL will be http://localhost:5173/The-Long-Game/)
npm run build      # TypeScript check + Vite production build
npm run lint       # ESLint
npm run preview    # Serve the production build locally
npm run deploy     # Build + push to GitHub Pages (https://steventhephan.github.io/The-Long-Game/)
```

There are no tests. TypeScript strict mode is the primary correctness check — `npm run build` surfaces type errors.

## Architecture

**Stack:** Vite + React 19 + TypeScript (strict) + Tailwind CSS 3 + Zustand 5

### Game state layer (`src/game/` + `src/store/`)

All game logic lives outside React. Dependency order:

```
constants.ts  ──►  types.ts  ──►  upgrades.ts / milestones.ts / charisma.ts / competitors.ts / prestige.ts
                       │
                       ▼
                 selectors.ts   (pure functions over GameState)
                       │
                       ▼
                 gameStore.ts   (single Zustand store + requestAnimationFrame game loop)
                       │
                       ▼
                 persistence.ts (localStorage save/load, number formatting)
```

**`types.ts`** — all interfaces: `GameState`, `Building`, `Upgrade`, `UpgradeEffect`, `Election`, `MinigameState`, `Competitor`, `MilestoneState`. `CharismaLevel = 0 | 1 | ... | 9`. `UpgradeEffect.type` includes `'fundraise_multiplier' | 'court_multiplier' | 'court_chance'`. `GameState` includes `knockBoostSps`, `knockBoostCps`, `lastCourtResult`, `courtCooldownEndsAt`, `awaitingNextElection`, `lastWonTier`.

**`constants.ts`** — initial building/election/minigame data. Key constants: `TICK_RATE_MS = 100`, `BASE_VOLUNTEER_RECRUIT_RATE = 0.06`, `BASE_CASH_DONATION_RATE = 0.01`, `ELECTION_ORDER`, `ELECTION_DAYS_BY_TIER` (per-tier day counts: city_council=30 up to president=365).

**`upgrades.ts`** — `UPGRADES` record holds `unlockCondition` functions (never serialized). `buildInitialUpgrades()` strips functions. **Critical**: `getAvailableUpgrades` in selectors always looks up `unlockCondition` from the static `UPGRADES` constant, not from stored state. Adding new upgrades here is safe — they appear in existing saves automatically.

**`milestones.ts`** — 11 milestone definitions at supporter thresholds (100 → 10M). Effects apply via `selectors.ts` alongside upgrades.

**`charisma.ts`** — 10-level `CHARISMA_LEVELS` array (Tone-Deaf → Historic). Each level has a `stat` multiplier and a `req` object (totalSupporters + minigame completion counts). Charisma is decoupled from elections — levels up via outreach activity completions and supporter counts. Level stored as `charismaLevel: CharismaLevel` integer; never the stat value directly.

**`competitors.ts`** — `generateCompetitors(tier, supportersRequired)` returns `Competitor[]`. Competitors get a head-start fraction by tier (0% city_council → 30% president). Lead competitor is calibrated to reach 80% of threshold by election day.

**`prestige.ts`** — `PrestigeUpgradeDef[]` with carryover/production/click multiplier effects. `getCarryoverRates()` returns base 3% supporters / 5% cash / 5% volunteers plus purchased bonuses.

**`selectors.ts`** — pure functions over `GameState`. `productEffects()` and `sumEffects()` iterate both purchased upgrades AND activated milestones. Includes `getFundraiseMultiplier`, `getCourtMultiplier`, `getCourtChanceBonus`.

**`gameStore.ts`** — single Zustand store. Game loop uses `requestAnimationFrame` (throttled to `TICK_RATE_MS`) not `setInterval`. Module-level `clickBuffer` array tracks recent clicks for live SPS display (3-second rolling window). Key actions: `knock`, `fundraise`, `courtInterestGroups`, `buyBuilding`, `buyUpgrade`, `buyPrestigeUpgrade`, `activateMilestone`, `levelUpCharisma`, `tick`, `winElection`, `startNextElection`, `resetElectionAfterDefeat`, `prestige`, `triggerMinigame`, `completeMinigame`, `cancelMinigame`, `hardReset`.

**`persistence.ts`** — `saveGame()` strips upgrade functions. `loadSave()` handles save migration. `formatNumber` (K/M/B), `formatCash` (whole dollars, no decimals), `formatRate`.

### Currencies & resources

- **Supporters** — primary resource. Earned by clicking (`knock()`, base 25% success) and passively from buildings. Formatted K/M/B.
- **Cash** — spent on buildings and upgrades. Passive rate = `supporters × BASE_CASH_DONATION_RATE × multipliers`. Also earned per successful knock. Formatted as whole dollar amounts only.
- **Charisma** — 10 named levels (not spendable). Drives volunteer auto-recruitment. Levels up via supporter thresholds + minigame completions.

All buildings cost cash. Volunteers have `autoRecruit: true` and grow passively via charisma rate; all others are purchased.

### Core game loop

`App.tsx` → `startGameLoop()` → `requestAnimationFrame` throttled to 100ms → `store.tick()`. Each tick:
1. Adds `sps × delta` supporters and `cps × delta` cash
2. Computes `knockBoostSps`/`knockBoostCps` from 3-second rolling `clickBuffer`
3. Rolls for volunteer recruitment
4. Advances election timer (`ELECTION_DAYS_BY_TIER` determines total days per tier)
5. Advances competitor supporter counts
6. Unlocks minigames based on elections won
7. Auto-wins election when supporters ≥ required (sets `awaitingNextElection = true`, pauses tick)
8. Auto-saves every 30s

Defeat: detected in `KnockPanel` via `useEffect` watching `electionDaysRemaining ≤ 0 && supporters < required`. Calls `resetElectionAfterDefeat()` (−30% supporters, timer/competitors reset).

### Election & prestige flow

**Elections:** City Council (500) → Mayoral (10K) → State Legislature (100K) → Gubernatorial (1M) → U.S. Senate (80M) → Presidential (800M)

Election length varies by tier (30 days for city council, 365 for senate/president). `winElection()` sets `awaitingNextElection = true`; player manually triggers `startNextElection()`. **Prestige is only available after winning the Presidency.**

**Minigames** unlock after winning elections: TV Ad (city council) → Debate (mayor) → Stump Speech (state legislature) → Fundraiser (governor). `cancelMinigame(id)` closes without setting a cooldown.

**KnockPanel buttons:** Knock (always) → + Fundraise (after city council) → + Court Interest Group (after mayor). All three are equal width when all present.

### UI layer (`src/components/`)

**Responsive layout** — mobile uses full-width single column with bottom `TabBar`; desktop (`lg:`) uses two-column: left (fixed 384px) = StatsBar + KnockPanel, right (flex-1) = Upgrades/Staff/Outreach tabs.

**Critical**: Never define component functions inside other component functions. The game store re-renders at 100ms — inner function components get a new type identity every tick, causing React to unmount/remount them and reset all `useState`.

**`Layout.tsx`** — handles both mobile and desktop layouts. Tracks `seenIds` and `seenStaffIds` refs for badge logic. Badge is gray when upgrades are unlocked but unaffordable; yellow when any unseen upgrade is affordable or any milestone is pending.

**`UpgradesPanel`** — inner tabs: Upgrades / Milestones / Prestige. Uses `h-full flex flex-col` with `flex-shrink-0` inner tab bar and `flex-1 overflow-y-auto` content — do not use `sticky` positioning inside scroll containers.

**`StatsBar`** — supporters + rate | cash + rate | volunteers + rate. Rate display turns green and adds click contribution while player is actively knocking (`knockBoostSps > 0`).

**`UnlockToast`** — slide-in toast for first-time building/upgrade/minigame unlocks. Uses `useRef<Set<string>>` to track announced items.

**Minigames** — all use `useMemo(() => snapshot, [])` to freeze resource amounts at open time.

### Save/load

Key: `the-long-game-save`. Upgrade `unlockCondition` functions are stripped on save. `competitors` array is preserved across saves.
