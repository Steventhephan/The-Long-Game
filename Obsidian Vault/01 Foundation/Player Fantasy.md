---
type: design-note
folder: 01 Foundation
status: complete
order: 2
---

# Player Fantasy

> **Purpose:** Defines the emotional and identity fantasy the player lives out — who they *become* over the course of play. This anchors theme, narrative, and reward psychology.
>
> **Depends on:** [[Vision Statement]]
> **Feeds into:** [[Tone & Theme]], [[Progression Arc]], [[Narrative & Flavor]], [[Prestige & Reset System]]

## The Fantasy (who the player becomes)

A **grassroots underdog who becomes a movement-leading juggernaut.** The dominant flavor is the warm, scrappy *"I started by knocking on doors and built a movement"* fantasy (underdog), with a snowballing *"I am becoming unstoppable"* power fantasy (juggernaut) layered on top as scale grows.

- **Primary:** Grassroots underdog → movement leader.
- **Secondary:** Unstoppable juggernaut (felt through sheer scale of the operation and the numbers).

These are not in tension — they are **sequential**, and they **repeat**.

## The Emotional Arc (start → middle → end)

The arc is a **repeating rags-to-power mini-cycle**, nested inside an overall one-way rise in stature:

1. **Each election begins as an underdog.** Voter count is reset to zero against a target far bigger than the last one — you feel small again ("big fish, bigger pond").
2. **You snowball to dominance within the phase** by leaning on your retained, ever-growing campaign operation and expanding it further.
3. **You win, get promoted, and the cycle renews** at a larger, harder scale.

So the *feeling* of being a scrappy challenger is **renewed every rung**, even as the player's objective stature (and machine) only ever grows. This deliberately mirrors the satisfying difficulty escalation of Cookie Clicker and similar incrementals.

## Power Fantasy vs. Stewardship Fantasy

This is a **growth / power fantasy, not a stewardship fantasy.** The player is *acquiring* power (winning offices), not *managing* it well. The hands-on feel shifts over the arc:

- **Early:** intimate and tactile — personally "knocking on doors" (tapping).
- **Later:** managerial and grand — commanding a large automated campaign operation, juggling [[Primary Resources|cash/fundraising]] and interest-group balancing.

## Mechanical Commitments This Note Locks In

*(These resolve the Vision note's open questions and constrain downstream design.)*

- **Voters reset to zero each election** — they are the per-phase victory score, not a permanent stockpile.
- **The campaign operation persists** across elections — generators/upgrades/production capacity carry forward and compound. See [[Prestige & Reset System]].
- **Election targets escalate faster than retained production**, forcing continued expansion each phase. See [[Number Scaling & Curves]] and [[Pacing & Difficulty]].

## Resolved Decisions & Tuning Targets

- **The "underdog renewal" can fail if retained production trivializes the early part of each new election** (you blow past the first chunk of the target instantly, skipping the scrappy feeling). The target-scaling curve must be tuned so the opening of each phase still feels like a climb. → [[Pacing & Difficulty]]
- ✅ **At promotion, only voters reset** (the operation persists). The full operational reset happens **on run loss**, banking Prestige — there is no separate optional prestige. → [[Prestige & Reset System]]
- ✅ **Tapping stays relevant late-game** — passive is deliberately weak and elections are real-time races, so the tap (plus the Auto-Knock upgrade) matters at every tier. → [[Tap Mechanic]]
