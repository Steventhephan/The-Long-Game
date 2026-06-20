---
type: design-note
folder: 02 Core Gameplay
status: complete
order: 6
---

# Core Loop

> **Purpose:** Describes the repeating action–reward cycle at the second-to-second and minute-to-minute scale, plus the per-election phase container. This is the heartbeat of the game.
>
> **Depends on:** [[Design Pillars]], [[Player Fantasy]]
> **Feeds into:** [[Tap Mechanic]], [[Primary Resources]], [[Generators]], [[Economy Model]], [[Opposition & Conflict]]

## The Loop, at three scales

### Second-to-second (active)
**Tap = "knock on doors."** Each tap converts one (or more) **undecided voter** from the election's shared pool into *your* column, and yields **cash**. Per-tap yield grows via [[Upgrades]] and [[Generators]]. Cash also funds **abilities** — active, deployable boosts for bursts of conversion (detailed in [[Campaigns]] / [[Upgrades]]).

### Minute-to-minute (reinvest)
Accumulate cash (from taps + weak passive income) → buy [[Generators]] and [[Upgrades]] to raise voters-per-second, voters-per-tap, and cash income → convert undecideds **faster than your rivals** → make **policy promises** to court interest-group segments for a conversion edge → push your share toward the majority before election day.

### Per-election (the phase container)
Each office is won through a single election with these rules:

- **A countdown timer** ("days until election day") runs the whole phase. **Timers lengthen at higher offices.**
- **One shared, finite pool of undecided voters.** You and **N AI rivals** convert from it **in real time**. (N starts at 1 and grows with office height, up to a cap — see [[Opposition & Conflict]].)
- **Passive income is deliberately weak (Pillar 4).** You *cannot* win a contested election on autopilot; active tapping and ability use are mandatory to out-convert a live rival. Passive only bridges absence.
- **Elimination & re-scramble:** if the undecided pool ever hits **0** before anyone holds a majority, the **lowest-placed candidate is knocked out and their captured voters return to the undecided pool**, reigniting the race with fewer rivals — repeat.
- **Win conditions:**
  - **Hold > 50% of the total electorate when the timer expires**, *or*
  - **Convert 100%** of the electorate at any time (rivals fully shut out) → instant win.
- **On victory:** promote to the next office. The **campaign operation persists**; **voters reset to zero**; a **new, larger pool + longer timer + more rivals** awaits → the renewed underdog climb (Pillar 3).

## Active vs. Idle Balance

**Hybrid, active-dominant (Q3 = option C).** Generators auto-convert and auto-fundraise so the "automated empire" fantasy ([[Vision Statement]]) exists — but passive rates are tuned *weak enough that a contested election still requires hands-on play*. Automation buys the player time and frees attention for higher-order active choices (which policies, which groups, which abilities, when to tap), it never replaces them. See [[Offline & Idle Progress]].

## Currencies in the Loop *(full treatment in [[Primary Resources]])*

- **Voters** — the per-election victory score. Drawn from a **finite shared pool**, contested in real time, **reset each election**. Not spent.
- **Cash** — earned from taps + passive; spent on [[Generators]], [[Upgrades]], and abilities. (Persists as a war chest within a run; resets on run loss.)

## Resolved Decisions & Tuning Targets

- ✅ **Lose condition (resolved in [[Prestige & Reset System]]):** failing to hold >50% at the timer, being eliminated, or a rival hitting 100% **ends the run** — you restart at City Council banking Prestige ∝ elections won. Recoverable and progress-banking by design (Pillar 5a).
- ✅ **Plurality edge case (resolved):** if the timer expires with **no candidate above 50%**, a **short sudden-death runoff** (a brief bonus-time round between the top two) decides it — never an arbitrary loss while leading.
- ✅ **Cash persists as a war chest within a run** (resets on run loss). → [[Economy Model]], [[Prestige & Reset System]]
- ✅ **The pool is segmented into interest-group blocs;** your platform/support sets conversion rate per bloc. → [[Policy, Platform & Interest Groups]]
- ✅ **Generator outputs:** Field → voters/sec, Finance → cash/sec. 🎯 The passive-vs-active ratio (how weak "weak" is) is tuned in playtest. → [[Generators]], [[Number Scaling & Curves]]
