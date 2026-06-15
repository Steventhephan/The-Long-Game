# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # TypeScript check + Vite production build
npm run lint       # ESLint
npm run preview    # Serve the production build locally
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
                 gameStore.ts   (single Zustand store + setInterval game loop)
                       │
                       ▼
                 persistence.ts (localStorage save/load, number formatting)
```

**`types.ts`** — all interfaces: `GameState`, `Building`, `Upgrade`, `UpgradeEffect`, `Election`, `MinigameState`, `Competitor`, `MilestoneState`. `CharismaLevel = 0 | 1 | ... | 9`.

**`constants.ts`** — initial building/election/minigame data. Key constants: `TICK_RATE_MS = 100`, `BASE_VOLUNTEER_RECRUIT_RATE = 0.02`, `BASE_CASH_DONATION_RATE = 0.02`, `ELECTION_ORDER`.

**`upgrades.ts`** — `UPGRADES` record holds `unlockCondition` functions (never serialized). `buildInitialUpgrades()` strips functions to `{ id, name, description, cost, purchased, effect }`. **Critical**: `getAvailableUpgrades` in selectors always looks up `unlockCondition` from the static `UPGRADES` constant, not from stored state.

**`milestones.ts`** — 11 milestone definitions at supporter thresholds (100 → 10M). `buildInitialMilestones()`, `MILESTONES_BY_ID`. Effects apply via `selectors.ts` alongside upgrades.

**`charisma.ts`** — 10-level `CHARISMA_LEVELS` array (Tone-Deaf → Historic). Each level has a `stat` multiplier on `BASE_VOLUNTEER_RECRUIT_RATE` and a `req` object (totalSupporters + minigame completion counts). `canLevelUpCharisma()` checks all req fields. Level stored as `charismaLevel: CharismaLevel` integer in state; never the stat value directly.

**`competitors.ts`** — `generateCompetitors(tier, supportersRequired)` returns `Competitor[]` with random funny names. `COMPETITORS_PER_TIER` maps each election tier to a count (1 for early elections, up to 5 for President). `ELECTION_TOTAL_DAYS = 365`. Competitor `supportersPerSecond` is calibrated so the lead competitor reaches 80% of the threshold by election day.

**`prestige.ts`** — `PrestigeUpgradeDef[]` with carryover/production/click multiplier effects. `getCarryoverRates(purchasedPrestigeUpgrades)` returns base 3% supporters / 5% cash / 5% volunteers plus any purchased bonuses.

**`selectors.ts`** — pure functions over `GameState`. `productEffects()` and `sumEffects()` iterate both purchased upgrades AND activated milestones. Key exports: `getBuildingCost`, `getBuildingSps`, `getTotalSps`, `getClickSupporters`, `getClickCash`, `getClickSuccessChance`, `getCashPerSecond`, `getVolunteerRecruitRate`, `getCharismaStat`, `getNextElection`, `getHasWonAnyElection`, `getHasWonPresidency`, `getAllMilestonesAnnotated`.

**`gameStore.ts`** — single Zustand store. `startGameLoop()`/`stopGameLoop()` manage a `setInterval` outside React. `mergeWithSave()` applies offline progress (capped 8h) on load. Key actions: `knock`, `buyBuilding`, `buyUpgrade`, `buyPrestigeUpgrade`, `activateMilestone`, `levelUpCharisma`, `tick`, `winElection`, `resetElectionAfterDefeat`, `prestige`, `triggerMinigame`, `completeMinigame`, `hardReset`.

**`persistence.ts`** — `saveGame()` strips upgrade functions. `loadSave()` migrates old `votes` saves to `supporters` and numeric `charisma` to `charismaLevel: 0`. `formatNumber` (K/M/B), `formatCash` (whole dollars, no decimals), `formatRate`.

### Currencies & resources

- **Supporters** — primary political resource. Earned by clicking (`knock()`, base 40% success) and passively from buildings. Each successful knock also earns `$2` base cash (`getClickCash`). Formatted K/M/B.
- **Cash** — spent on buildings and upgrades. Passive rate = `supporters × BASE_CASH_DONATION_RATE × multipliers`. Also earned per click. Formatted as whole dollar amounts only.
- **Charisma** — 10 named levels (not spendable). Drives volunteer auto-recruitment: `charismaLevel.stat × BASE_VOLUNTEER_RECRUIT_RATE` per second. Levels up by meeting supporter + minigame completion thresholds.

All buildings cost cash. Volunteers have `autoRecruit: true` and grow passively; all others are purchased.

### Core game loop

`App.tsx` → `startGameLoop()` → `setInterval` at 100ms → `store.tick()`. Each tick:
1. Adds `sps × delta` supporters and `cps × delta` cash
2. Rolls for volunteer recruitment (`recruitRate × delta` chance)
3. Advances election timer: `electionDayFraction += delta / 10`; when fraction ≥ 1, `electionDaysRemaining--`
4. Advances all competitor supporter counts by `supportersPerSecond × delta`
5. Unlocks minigames based on elections won
6. Auto-wins election if `daysRemaining ≤ 0` and player has enough supporters
7. Auto-saves every 30s

Defeat: detected in `KnockPanel` via `useEffect` watching `electionDaysRemaining ≤ 0 && supporters < required`. Calls `resetElectionAfterDefeat()` (−30% supporters, timer/competitors reset).

### Election & prestige flow

**Elections:** City Council (500) → Mayor (10K) → State Legislature (100K) → Governor (1M) → Senate (25M) → President (270M)

Each election lasts 365 in-game days (1 day = 10 real seconds ≈ 1 hour per election). `winElection()` resets the timer and generates new competitors for the next tier. **Prestige is only available after winning the Presidency** (`getHasWonPresidency`).

**Minigames** unlock after winning elections: TV Ad (city council) → Debate (mayor) → Stump Speech (state legislature) → Fundraiser (governor). After prestige, previously unlocked minigames are re-unlocked immediately (tracked via `minigame.unlocked` carried over in `prestige()`).

### UI layer (`src/components/`)

Mobile-first, `h-dvh`, sticky header + `StatsBar` + scrollable main + sticky `TabBar`.

**Bottom tabs:** Campaign (`KnockPanel`) / Rewards (`UpgradesPanel`) / Staff (`BuildingsPanel`) / Outreach (`MinigamesPanel`)

**`KnockPanel`** — knock button with click animation (floating `+N supporters / +$X` particles), election countdown timer, live candidate leaderboard, charisma level-up card, prestige section (post-Presidency only), defeat modal.

**`UpgradesPanel`** — inner tabs: Upgrades (sorted cheapest-first, available above owned) / Milestones (activated → pending → locked) / Prestige (shown after first prestige). Badge counts on inner tabs.

**`StatsBar`** — always-visible strip between header and content: supporters + rate | cash + rate | volunteers + rate.

**`UnlockToast`** — watches for first-time unlocks of buildings, upgrades, and minigames; shows a dark slide-in toast from the bottom. Uses a `useRef<Set<string>>` to track which items have already been announced.

**Minigames** — all use `useMemo(() => snapshot, [])` to freeze resource amounts at open time; no live-updating numbers in option descriptions. Each has meaningful positive/negative tradeoffs.

### Save/load

Key: `the-long-game-save`. Upgrade `unlockCondition` functions are stripped on save. `competitors` array (with names + supporter counts) is preserved. Adding new upgrades to `upgrades.ts` is safe — they appear in existing saves automatically.
