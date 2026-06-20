---
type: design-note
folder: 02 Core Gameplay
status: complete
order: 7
---

# Tap Mechanic

> **Purpose:** Defines the central tap/click interaction — the "cookie" of this game. What is tapped, what it produces, and how it stays satisfying and *relevant* on a touchscreen.
>
> **Depends on:** [[Core Loop]]
> **Feeds into:** [[Primary Resources]], [[Game Feel & Juice]], [[UX & UI Layout]], [[Number Scaling & Curves]]

## What Is Tapped (the metaphor)

**One big, persistent button** — the **"Knock on Doors"** button. The metaphor is the candidate personally canvassing: every tap is a door knocked, a hand shaken, a voter persuaded. It is the single, always-present, thumb-friendly primary action (see [[UX & UI Layout]]).

## What a Tap Produces

- **Converts undecided voter(s)** from the election's shared finite pool into the player's column.
- **Yields cash.**
- Base per-tap yield is amplified by [[Upgrades]] and [[Generators]].

## Tap Depth: Critical Taps

The skill/excitement layer is the **critical tap**:
- Each tap has a **small base chance to "crit,"** returning substantially more resources (voters + cash) for that tap.
- **Crit chance is upgradable with cash.**
- This gives the otherwise-simple button a reason to keep tapping and a satisfying variable-reward rhythm (see [[Game Feel & Juice]]).

## Auto-Knock (sustained play)
An **Auto-Knock upgrade** auto-taps at a **capped rate** (plus a hold-to-knock option) to prevent fatigue over long elections. It still fires the full tap feedback, and the player stays actively engaged choosing abilities, policy, and targets — so Pillar 4 holds.

## How Tapping Stays Relevant (vs. Cookie Clicker's fading cookie)

In Cookie Clicker the cookie becomes irrelevant once buildings dominate. Here it **stays central by design**, for two structural reasons:
1. **Passive income is deliberately weak ([[Core Loop]], Pillar 4)** — you cannot out-convert a live rival on autopilot, so active tapping matters in every contested election.
2. **Elections are real-time races** — tapping (plus abilities) is how you tip close contests and sprint toward 100%.

**Hard requirement this creates:** per-tap value and crit reward **must scale with office tier**, so a tap remains meaningful against ever-larger pools. → [[Number Scaling & Curves]].

## Resolved Decisions & Tuning Targets

- ✅ **Crit:** base **×5** magnitude; **no escalating crit tiers in MVP** (super-crit reserved for post-MVP). 🎯 exact value tuned. → [[Number Scaling & Curves]]
- ✅ **Tap fatigue (resolved): an Auto-Knock upgrade** auto-taps at a capped rate (plus a hold-to-knock option); the player still actively chooses abilities, policy, and targets, so Pillar 4 holds. → [[Game Feel & Juice]]
- ✅ **Generators produce passively** (per/sec), not per-tap; per-tap yield is raised by tap [[Upgrades]]. → [[Generators]]
- ✅ **Crit chance** is raised by cash upgrades and a **Prestige perk**; not by abilities in MVP. → [[Upgrades]], [[Prestige & Reset System]]
