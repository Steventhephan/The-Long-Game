---
type: design-note
folder: 05 Economy & Balance
status: complete
order: 23
---

# Pacing & Difficulty

> **Purpose:** The tuning of time-to-reward across the whole game — the early hook, the roguelite run-loss curve, and where the walls sit. The felt rhythm of progress.
>
> **Depends on:** [[Economy Model]], [[Number Scaling & Curves]], [[Progression Arc]]
> **Feeds into:** [[Implementation Roadmap]]

## Early-Game Hook (first session)
- A new player should **win City Council (primary + general) within the first few minutes.** Minimal systems, tiny pool, one rival — teach the loop and deliver the **promotion dopamine fast.**
- The first run is deliberately generous; reveals come quickly ([[Milestones & Unlocks]]).

## The Roguelite Run-Loss Curve
- **~8–12 full runs** to a typical player's **first Presidency** — a meaty meta-grind where each run reaches **roughly one office further** on average.
- Early runs die at the first wall; mid runs reach State/Governor; later runs break into Federal; eventually a run **sweeps to President.**
- Every run banks **Prestige ∝ elections won** ([[Prestige & Reset System]]), so each restart is **stronger and faster** — losing is progress, not punishment (Pillar 5a).

## Walls at Scale Jumps (era boundaries)
Deliberate difficulty walls sit at the **era transitions**, where pool size (~4×+), rival toughness, and a **new headline system** all hit at once:

| Wall | Why it's hard | Broken by |
|---|---|---|
| **Local → County** | first interest-group/positioning system + bigger pool | early Prestige perks, learning coalitions |
| **County → State** *(biggest)* | local → **statewide** scale leap + abilities/events arrive | Prestige multipliers + perk tree + mastery |
| **State → Federal** | **national** scale + ideological forks + max rivals | deep Prestige stack + optimized coalition |

These are **investment + skill gates, not paywalls** (Pillar 2) — always surmountable through accumulated Prestige (Pillar 5a).

## Midgame Rhythm
Within a run: climb → hit the current wall → lose → bank Prestige → restart, blowing through *already-mastered* early offices quickly (Prestige head-start) so the **frontier (your current wall) is where the time is spent**, not re-grinding the bottom.

## Difficulty Levers (per office, from [[Number Scaling & Curves]])
Pool size · timer length · rival count + archetype toughness ([[Opposition & Conflict]]) · number of issues/blocs to juggle ([[Policy, Platform & Interest Groups]]).

## Feel-Bad Mitigations *(carried from earlier notes)*
- **Sub-50%-at-buzzer loss** and **late scheduled events** must feel *earned* — tune eliminations to usually consolidate the race and telegraph late events. ([[Prestige & Reset System]], [[Events & Crises]])

## Resolved Decisions & Tuning Targets
- **Exact Prestige needed to break each wall** — core balance target. → [[Number Scaling & Curves]]
- ✅ **Re-traversal tedium (resolved):** a Prestige perk **auto-resolves/fast-forwards already-won offices** on later runs, keeping play on the current frontier (Pillar 4 preserved). → [[Prestige & Reset System]]
- ✅ **Longest-election ceiling:** President ≈ 16 min of *active* play, completed across multiple full-pause sessions — accepted. → [[Number Scaling & Curves]]
- ✅ **Difficulty modes:** out of scope for MVP (post-MVP consideration).
