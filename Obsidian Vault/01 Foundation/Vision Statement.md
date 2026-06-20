---
type: design-note
folder: 01 Foundation
status: complete
order: 1
---

# Vision Statement

> **Purpose:** Captures the single north-star idea of the game in one or two sentences, plus a short elevator pitch. Every other note must be traceable back to this. If a feature doesn't serve the vision, it gets cut.
>
> **Depends on:** *(nothing — this is the root)*
> **Feeds into:** [[Design Pillars]], [[Player Fantasy]], [[Tone & Theme]]

## North-Star Sentence

> You attract **voters** by tapping, then build an ever-growing automated voter-attraction machine to win each election and **climb the political ladder** — from a city-council hopeful all the way to **President** — with the ladder secretly continuing into a galactic republic beyond.

## Elevator Pitch

The Long Game is a mobile-first incremental game with the bones of *Cookie Clicker*, reskinned as a climb up the political hierarchy. **Voters** are the core currency: you earn them by tapping and, increasingly, by automated "voter-attracting" producers. Each rung of the ladder is an **election** you win by accumulating enough support; winning promotes you to the next, larger office, where the numbers — and the machine — scale up again.

The ladder runs roughly:

> **City Council → Mayor → County Council → County Executive → State Legislature → Governor → Senate → President**

Reaching **President is the victory condition for the MVP / v1.** After that, the long-term vision reveals a twist: the nation is secretly part of a **galactic republic** with its own ladder of elections, letting the climb continue indefinitely (galactic and beyond).

## Scope

- **MVP / v1:** the full Earthly ladder, ending at **President = win.** Self-contained, with an ending.
- **Beyond MVP:** the galactic-republic reveal and an open-ended set of higher offices.
- **Hard requirement this creates:** an "office / election rung" must be **generic, data-driven content**, not hardcoded. Adding President+ tiers (or galactic ones) must mean adding data, not re-architecting. See [[Technical Architecture Requirements]] and [[Eras & Phases]].

## What This Game Is NOT

- **Not a governance or policy simulator.** You are climbing *to* offices, not *running* them. Winning, not legislating, is the goal of each phase.
- **Not a *partisan* game, but ideology IS a core mechanic.** Per [[Tone & Theme]], the player picks an ideology *per playthrough* and makes real left-center-right policy promises to court interest groups — but the game is an **even-handed sandbox** that never declares which politics are correct, and every path is equally winnable. The game has no political opinions; the *player* does.
- **Not endless-by-default in v1.** The MVP is finite (ends at President); endlessness is an extension enabled by the data-driven architecture, not the launch experience.

## Resolved Decisions & Tuning Targets

- ✅ **RESOLVED (see [[Player Fantasy]]):** Voters reset to zero each election (per-phase victory score); the campaign operation/production *persists* and compounds; election targets escalate faster than retained production. Detailed in [[Prestige & Reset System]].
- ✅ **Ladder is strictly linear** (no branching in MVP; branching is a post-MVP option). → [[Progression Arc]]
- ✅ **Voters = a per-election high-score** drawn from a finite segmented pool; never spent. Win by holding >50% at the timer. → [[Primary Resources]], [[Core Loop]]
- **Tone risk:** a politics-themed climb can read as earnest, satirical, or cynical, and the choice changes everything downstream. → [[Tone & Theme]]
- ✅ **RESOLVED — "societal transformation" cut from MVP:** the game is about *winning* offices, not governing. Ideology is expressed solely through the campaign-time positioning/interest-group trade-off. Institutions & Societal Transformation notes were cut. → [[Policy, Platform & Interest Groups]]
