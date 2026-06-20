---
type: design-note
folder: 02 Core Gameplay
status: complete
order: 10
---

# Upgrades

> **Purpose:** The multiplicative and unlock-based improvements players buy. Defines the categories of upgrades and the decision structure that makes purchasing meaningful (Pillar 2).
>
> **Depends on:** [[Generators]], [[Primary Resources]], [[Tap Mechanic]]
> **Feeds into:** [[Economy Model]], [[Milestones & Unlocks]], [[Number Scaling & Curves]]

## Decision Structure — Blend (C)

- **Most upgrades are universal & buy-eventually** (Cookie Clicker model): obtainable in a single run, so the live decision is **sequencing under a cash constraint** — what to buy *now* vs. later.
- **A few key ideological forks are commitment choices:** mutually-exclusive upgrades tied to the player's chosen ideology/positions ([[Tone & Theme]]). Picking one locks out its alternatives, creating build identity and replay variety.
- 🎯 **Balance constraint (enforced):** ideological forks keep **every ideology equally winnable** (Pillar 5b) via symmetric bonus/malus packages and capped multipliers; validated in playtest. → [[Economy Model]], [[Number Scaling & Curves]], [[Pacing & Difficulty]]

## Upgrade Categories

| Category | What it boosts | Notes |
|---|---|---|
| **Tap upgrades** | per-knock voter/cash yield, **crit chance, crit magnitude** | keeps the [[Tap Mechanic]] scaling with tier |
| **Field multipliers** | Field generators (voters/sec) | per-generator ×N, à la Cookie Clicker building upgrades |
| **Finance multipliers** | Finance generators (cash/sec) | symmetric to Field |
| **Cross-track synergies** | Field↔Finance interplay | e.g., "each Donor Dinner adds X% to Canvasser output" — rewards investing in both tracks |
| **Ability upgrades** | the deployable active abilities | cooldown / magnitude / duration improvements |
| **Interest-group upgrades** | strength of interest-group support effects | amplifies the multiplier from courted blocs |
| **Ideological forks** *(the commitment layer)* | cut across the above | exclusive picks themed to the player's ideology |

## Persistence

Universal upgrades are part of the **persistent operation** and presumably **carry across elections** (like [[Generators]]). The **ideological forks** are tied to the per-playthrough ideology ([[Tone & Theme]]) — whether they re-choose each election or lock for the whole run is open (see below).

## Resolved Decisions & Tuning Targets

- 🎯 **Ideological-fork balance** — enforced via symmetric packages + caps; an ongoing playtest target, not an open design question. → [[Number Scaling & Curves]], [[Pacing & Difficulty]]
- ✅ **Synergy runaway (resolved):** cross-track synergies use **diminishing returns (~0.85× each)** under the per-era multiplier cap. → [[Number Scaling & Curves]]
- ✅ **Persistence:** universal upgrades **persist within a run** (reset on run loss); **ideological forks lock for the run** (re-choosable on the next run's platform). → [[Prestige & Reset System]], [[Economy Model]]
- ✅ **Volunteers/Charisma have no cash-upgrade path** — Charisma is moved only by minigames, and Volunteers accrue from Charisma. → [[Primary Resources]]
- ✅ **Achievement upgrades exist** — achievements grant permanent reward multipliers. → [[Milestones & Unlocks]]
- ✅ **Ideological forks** surface in a **Federal-era panel** (a few per ideology lean); exact count is content. → [[UX & UI Layout]], [[Milestones & Unlocks]]
