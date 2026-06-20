---
type: design-note
folder: 03 Progression & Meta
status: complete
order: 13
---

# Prestige & Reset System

> **Purpose:** The meta-loop that gives the game longevity. Defines the dynasty/reset framing, what persists vs. resets, the win/lose conditions, and what Prestige buys. This note reframes the whole game as a **prestige-run (roguelite) climb.**
>
> **Depends on:** [[Progression Arc]], [[Primary Resources]]
> **Feeds into:** [[Economy Model]], [[Pacing & Difficulty]], [[Number Scaling & Curves]]

## Metaphor — Political Dynasty / New Generation

A **run** is one candidate's career, climbing the office ladder. When the career ends, a **new candidate inherits the dynasty's accumulated Prestige** and starts over at City Council — stronger than the last. Each new candidate may **choose a fresh ideology** (matching "ideology per playthrough" in [[Tone & Theme]]).

## The Run Structure (two levels of "underdog renewal")

- **Within a run** (while winning): the campaign operation — [[Generators]], universal [[Upgrades]], Charisma, Volunteers — **persists and compounds**; **voters reset each election**; difficulty scales (renewed underdog per election, Pillar 3).
- **Across runs** (on loss): a **full operational reset** to City Council with a new candidate; **Prestige persists** and powers the next run (renewed underdog per *run*).

## Win Conditions (per election)
- Hold **> 50%** of the total pool when the election-day timer expires, **or**
- Convert **100%** at any time (instant).

## Lose Conditions (end the run)
1. **Sub-50%** of the pool when the timer expires *(leading is not enough — absolute majority required)*.
2. **Lowest vote count** when the undecided pool is fully claimed in a multi-candidate race (elimination — applies to the player too).
3. **A rival reaches 100%** (you're shut out).

On any loss → **bank Prestige ∝ elections won this run** → restart at City Council with the dynasty's permanent bonuses applied.

## MVP Victory & Endless Seed
- Win all **16 elections → President = MVP victory** (credits).
- Then optionally **retire into a fresh dynasty** (New Game+) — the seam where the post-MVP **galactic republic** ladder will attach ([[Vision Statement]]).

## What Prestige Buys (A + C)
- **A) Permanent global multipliers** — e.g., +X% to all voter & cash output per Prestige point (the "heavenly chips" backbone).
- **C) A permanent perk/skill tree** — spend points on targeted persistent perks: faster crit, cheaper generators, friendlier interest groups, higher base Volunteer rate, etc. (perk list → [[Upgrades]] / [[Economy Model]]).

## Perk Tree (starter set)
Spent with Prestige points; costs scale, deeper perks gate on earlier ones.

| Perk | Effect | Cost | Prereq |
|------|--------|------|--------|
| **Head Start** | Begin each run with seed cash | low | — |
| **Ground Game** | +tap yield | low | — |
| **Field Efficiency** | Field generators cheaper | med | — |
| **Finance Efficiency** | Finance generators cheaper | med | — |
| **Charisma Prodigy** | +Volunteer accrual rate | med | — |
| **Crit Mastery** | +base crit chance | med | Ground Game |
| **Bloc Whisperer** | +interest-group support gain | high | Charisma Prodigy |
| **Iron Reputation** | reduces flip-flop costs | high | Bloc Whisperer |
| **Media Darling** | +passive conversion | high | Field Efficiency |
| **War Chest** | larger carried-cash cap | high | Finance Efficiency |
| **Fast-Forward** | auto-resolves already-won offices on later runs | high | Head Start |
| **Kingmaker** *(capstone)* | large permanent global output multiplier | very high | several above |

## What Resets vs. Persists

| | Within a run (per election) | Across runs (on loss) |
|---|---|---|
| **Voters** | reset | reset |
| **Cash, Generators, Upgrades, Charisma, Volunteers** | persist & compound | **reset** |
| **Prestige + perk tree + global multiplier** | persist | **persist** |
| **Chosen ideology** | locked for the run | re-choosable next run |

## Pillar Check
- **Pillar 5a (effort always pays off):** ✅ every run banks permanent Prestige, so losing is the loop, never a dead end. Meta-progress is guaranteed.
- **Pillar 3 (underdog):** ✅ doubly honored — renewed each election *and* each run.

## Resolved Decisions & Tuning Targets
- ✅ **Prestige formula:** higher offices grant disproportionately more — `officeWeight = 2^officeIndex` per election won. → [[Number Scaling & Curves]]
- ✅ **Prestige grant timing:** **tallied during the run and awarded at run end** (spendable on the next run). → [[Eras & Phases]]
- ✅ **Restart friction (resolved):** a Prestige perk **auto-resolves already-won offices** on later runs, plus head-start / cheaper-early-generator perks — replays fast-forward to the current frontier (Pillar 4 preserved). → [[Pacing & Difficulty]]
- ✅ **Feel-bad (resolved):** eliminations are tuned to consolidate >50%, and if the timer still ends with no majority a **short sudden-death runoff** decides it — never an instant loss while leading. → [[Core Loop]], [[Pacing & Difficulty]]
- ✅ **Perk tree authored** (12 nodes above). 🎯 exact point costs & multiplier magnitudes tuned. → [[Economy Model]], [[Number Scaling & Curves]]
