---
type: design-note
folder: 06 Experience Layer
status: complete
order: 24
---

# UX & UI Layout

> **Purpose:** The mobile-first screen layout, navigation, and information hierarchy. **Proposed layout (user delegated):** bottom-tab navigation, a persistent live-race header, and progressive tab reveal. Portrait, thumb-first.
>
> **Depends on:** [[Target Audience & Platform]], [[Tap Mechanic]], [[Generators]]
> **Feeds into:** [[Technical Architecture Requirements]], [[Visual & Audio Style]]

## Principles
- **Race status is always visible** (persistent header), so managing the operation/platform never loses the election context.
- **Progressive tab reveal** — early game shows only *Campaign*; *Platform* appears at County, *Abilities* row at State, *Legacy* after the first run. Mirrors [[Eras & Phases]] and protects against overwhelm while honoring Pillar 2 depth.
- **Thumb-first:** the Knock button sits low-center; abilities row above the tab bar; everything reachable one-handed.
- Numbers use **K/M/B suffixes** ([[Number Scaling & Curves]]).

## Persistent Header (every tab)
```
┌──────────────────────────────┐
│ MAYOR · PRIMARY        ⏱ 1:24 │  office · phase · timer
│ You 38% ▓▓▓▓▓░░░░  (50% wins) │  your share vs. majority
│ 💵 $4.2K   👥1.2K   ⭐12       │  cash · volunteers · prestige
└──────────────────────────────┘
```

## Tab 1 — CAMPAIGN (home / default)
```
│ LIVE RACE                     │
│  You         ▓▓▓▓▓░░░░ 38%    │
│  Insurgent   ▓▓▓░░░░░░ 22%    │
│  Undecided   ░░░░░░░░  40%    │
│                               │
│         ╭───────────╮         │
│         │   KNOCK    │  ← tap  │
│         │  ON DOORS  │         │
│         ╰───────────╯         │
│        +1   💥 CRIT +5         │
│                               │
│ ABILITIES                     │
│ [Court][Puff][Fund][Hit] ⏳   │
```

## Tab 2 — OPERATION (generators + upgrades)
```
│ FIELD ▸ 42 voters/sec         │
│  Canvasser    x12   $138  [+] │
│  Phone Bank   x5    $1.1K  [+]│
│  Regional Off x1    $9K    [+]│
│  …                            │
│ FINANCE ▸ $18/sec             │
│  Small-Dollar x8    $90    [+]│
│  …                            │
│ [ UPGRADES ▸ ]                │
```

## Tab 3 — PLATFORM (policy + blocs) — unlocks County
```
│ IDEOLOGY: Progressive         │
│ Position  ◀──●─────▶          │
│                               │
│ ISSUES (6/12)                 │
│  Taxes    [L][C][R]           │
│  Labor    [L][C][R]           │
│  …                            │
│ BLOCS (support)               │
│  Unions    ▓▓▓▓ champion 3.0× │
│  Business  ▓░░░ hostile  0.6× │
│  Farmers   ▓▓░░ neutral  1.0× │
```

## Tab 4 — LEGACY (Prestige/meta) — unlocks after run 1
```
│ DYNASTY                       │
│ Prestige ⭐128  → +256% output│
│ [ PERK TREE ▸ ]               │
│ Achievements  24 / 120        │
│ Furthest: Senate (run 7)      │
```

## Modals (pause the race)
```
DEBATE — "On taxes…"          ⚠ SCANDAL — leaked emails!
 ▸ Cut them deeply   (R)        ▸ Deny       (−Moderates)
 ▸ Keep them steady  (C)        ▸ Apologize  (−Base)
 ▸ Raise on the rich (L)        ▸ Spin       (−$$$)
        [race paused]                 [race paused]
```

## Bottom Tab Bar
```
[🏛 Campaign] [🏗 Operation] [📋 Platform] [⭐ Legacy]
```

## Resolved Decisions & Tuning Targets
- **Visual identity** of all this (color, type, icons) → [[Visual & Audio Style]].
- ✅ **Dense screens (resolved):** Federal uses **collapsible issue groups, a scrollable bloc list, and a compact multi-rival standings strip**; only unlocked content shows. 🎯 Validate readability in playtest.
- ✅ **Race viz at scale:** a toggle between **candidate-level** and **bloc-level** bars when many blocs/rivals are present.
- ✅ **Portrait phone only for MVP**; landscape/tablet is post-MVP.
- **Accessibility:** color-blind-safe bloc colors, tap-target sizing, reduced-motion. → [[Game Feel & Juice]]
- ✅ **Ability targeting UI:** tap the ability, then tap the target (rival/bloc) — a tap-to-target picker.
