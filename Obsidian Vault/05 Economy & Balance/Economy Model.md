---
type: design-note
folder: 05 Economy & Balance
status: complete
order: 21
---

# Economy Model

> **Purpose:** The systemic view of all resource sources and sinks and how currencies flow — ensuring the economy is closed, balanced, and free of dead ends (Pillar 5a). Largely a synthesis of prior notes, plus the cash-persistence and flip-flop rules.
>
> **Depends on:** [[Primary Resources]], [[Generators]], [[Upgrades]], [[Prestige & Reset System]], [[Policy, Platform & Interest Groups]]
> **Feeds into:** [[Number Scaling & Curves]], [[Pacing & Difficulty]]

## Two Parallel Currencies, No Direct Conversion
- **Voters** (per-election score, finite segmented pool, reset each election) and **Cash** (the active-spend fuel) are produced **in parallel** — there is **no votes↔cash exchange.**
- **Cash funds the machine that produces both.** That's the spine of the economy.

## Sources
| Resource | Sources |
|---|---|
| **Voters** | taps (knock + crit) · Field generators (voters/sec) · bloc conversion scaled by interest-group support · boost abilities (Court Interest Group, Puffpiece) · positive [[Events & Crises]] |
| **Cash** | taps (+crit) · Finance generators (cash/sec) · Fundraiser ability · donor-bloc contributions · Fundraising Gala minigame · windfall events |
| **Prestige** | banked at **run end ∝ elections won** ([[Prestige & Reset System]]) |
| **Charisma / Volunteers / Support** | Charisma ← minigames; Volunteers ← passive (Charisma-scaled); interest-group support ← positions + minigame answers |

## Sinks
- **Cash is the universal sink:** [[Generators]] (escalating ~1.15×/copy) · [[Upgrades]] · ability uses (per-cast) · **flip-flop costs** · crit-chance upgrades.
- **Voters have no sink** — they *are* the win threshold.
- **Prestige sink:** permanent global multiplier + perk tree (between runs).

## The Multiplier Stack *(applied to taps & generators)*
```
base output × interest-group support × Volunteers × Prestige multiplier × achievement bonuses
```
(See [[Primary Resources]]; runaway-stacking is the key balance risk — [[Number Scaling & Curves]].)

## Persistence Rules
- **Within a run:** **Cash persists (war chest)** across elections; generators, upgrades, Charisma, Volunteers persist; **voters reset each election.**
- **On run loss:** cash, generators, upgrades, Charisma, Volunteers **reset**; **Prestige + perks persist.**

## Flip-Flop Cost *(no new resource)*
Repositioning between primary and general deducts:
1. **Cash — escalating per policy type:** each successive flip on the *same* policy costs **more** cash.
2. **Eroding support-swing effectiveness:** repeated flips yield **less** support benefit each time (simulating lost trust).

This makes pivoting viable but self-limiting — a cost curve, never a wall (Pillar 5a).

## Pillar Checks
- **5a (no dead ends):** cash always has sinks; effort always converts to progress; flip-flop and opposition are costs/contests, never unwinnable walls.
- **5b (even-handed):** the economy must be balanced so **every ideology/coalition is equally winnable** — the heaviest standing balance burden. → [[Number Scaling & Curves]]

## Resolved Decisions & Tuning Targets
- ✅ **Cash overflow (resolved):** a guaranteed sink every tier — the next generator rung plus an always-available, escalating **Ad Blitz ability**. → [[Number Scaling & Curves]]
- ✅ **Multiplier runaway (resolved):** per-era multiplier cap + diminishing-returns synergies + log/validated curves. → [[Number Scaling & Curves]]
- **Field-vs-Finance balance** so both generator tracks stay worth investing in.
- **All concrete values** (rates, costs, multiplier magnitudes, flip-flop curve) → [[Number Scaling & Curves]].
