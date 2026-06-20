---
type: design-note
folder: 04 Thematic Systems
status: complete
order: 20
---

# Opposition & Conflict

> **Purpose:** The rival candidates — the live opponents in the bloc race. Defines how rivals behave, how they scale, and how the player out-maneuvers them. The friction that makes the race a contest.
>
> **Depends on:** [[Core Loop]], [[Events & Crises]], [[Policy, Platform & Interest Groups]]
> **Feeds into:** [[Pacing & Difficulty]], [[Economy Model]]

## Rival Model — Hybrid (C)
Each rival is a **named archetype** with:
- a **simple ideology lean** — the blocs it favors and converts faster ([[Policy, Platform & Interest Groups]]);
- a **behavior profile** (aggression, fundraising strength, ability usage) — *simplified*, not full agent AI;
- a **difficulty rating.**

**Positioning matters against them:** a rival dominates blocs near its lean, so you win by **contesting the center, picking up blocs they neglect, and out-converting in shared blocs** — avoid a head-on brawl on a stronger rival's home blocs.

## Archetype Roster
`Lean` is relative to the race's side; every archetype is **strong somewhere and weak somewhere** (Pillar 5a).

| Archetype | Lean | Funding | Aggression | Difficulty | Strong blocs | Weak blocs |
|---|---|---|---|---|---|---|
| **Establishment Favorite** | center | high | low | med | Moderates, Seniors, Healthcare | base / fringe blocs |
| **Radical Insurgent** | extreme | low | high | med | partisan base blocs (deadly in primaries) | the center (folds in generals) |
| **Charismatic Outsider** | center-ish | low | med | med | many blocs (broad but shallow) | thin funding, no staying power |
| **Self-Funding Mogul** | varies | very high | high (ability spam) | high | anything money buys | grassroots / Volunteer blocs |
| **Career Politician** | center | med | med | low | Moderates + their side's core bloc | enthusiasm / base blocs |
| **Single-Issue Crusader** | edge on one axis | low | med | low | one bloc (overwhelming) | every other bloc |

**Design rule (Pillar 5a):** every archetype is **strong somewhere and weak somewhere** — a counter-strategy always exists. No rival is an unbeatable wall.

## Rival Actions
- Rivals can use **offensive abilities against the player** (e.g., Hitpiece you) — reciprocal with [[Campaigns & Abilities]].
- Rivals are **subject to [[Events & Crises]]** — a rival scandal is your opportunity.
- The **elimination mechanic** applies: when the pool empties with no majority, the lowest candidate (possibly the player) is knocked out and their blocs return to undecided ([[Core Loop]], [[Prestige & Reset System]]).

## Scaling & Context
- **Rival count rises with office** (1 at Local → capped multi-candidate fields at Federal — [[Eras & Phases]]); tougher archetypes appear higher up.
- **Primary vs. general:** primaries pit you against **same-side** rivals (fighting over base blocs); generals against the **opposing side** (fighting over the center) — slotting archetypes into the [[Progression Arc]] squeeze.

## Resolved Decisions & Tuning Targets
- ✅ **Archetype roster authored** (6 above). 🎯 which appear at which office + exact stat values tuned.
- ✅ **Yes — rivals re-position between primary and general** (their lean shifts toward the center for the general), mirroring the player's squeeze.
- ✅ **Hitpiece targeting:** player-chosen (tap-to-target). 🎯 Rival ability *frequency* is a tuning value.
- ✅ **Rival lean:** fixed per archetype with a **small random offset within a band** for variety.
- 🎯 **Exact conversion-rate / funding / difficulty numbers** per archetype (tuning). → [[Number Scaling & Curves]], [[Pacing & Difficulty]]
