---
type: design-note
folder: 04 Thematic Systems
status: complete
order: 17
---

# Campaigns & Abilities

> **Purpose:** The deployable active tools that let the player spend cash to tip the live, bloc-based vote race (the State-era hook). The active-skill layer that makes contested elections hands-on.
>
> **Depends on:** [[Core Loop]], [[Primary Resources]], [[Upgrades]], [[Policy, Platform & Interest Groups]]
> **Feeds into:** [[Economy Model]], [[Opposition & Conflict]]

## Activation Model — Cooldown-Based Reusable (A)
- Abilities are **reusable**, fired **when off cooldown**, each use **costs cash.**
- They are **upgradeable** (cooldown ↓ / magnitude ↑ / duration ↑) via [[Upgrades]].
- They debut as the **State-era** headline ([[Eras & Phases]]) and expand through Federal.
- Their cash cost reinforces cash as the active-spend fuel and creates real **"when do I deploy?" decisions** (Pillar 4).

## Categories — Offensive + Economic/Boost (no Defensive)
- **Offensive:** act on a **rival** (slow their bloc conversion, cut their support, damage their standing).
- **Economic / Boost:** act on **yourself or a bloc** (surge conversion, court a group, burst cash).
- **No defensive abilities** by design — see the [[Events & Crises]] constraint below.

## Ability Roster
Cash costs & cooldowns scale per office tier ([[Number Scaling & Curves]]).

| Ability | Category | Target | Effect | Unlocks |
|---|---|---|---|---|
| **Court Interest Group** | Boost | bloc | Surge your support/conversion with a chosen bloc | State |
| **Puffpiece** | Boost | self | Temporary boost to overall conversion | State |
| **Fundraiser** | Boost | self | Burst of cash | State |
| **Ad Blitz** | Boost | self | Big escalating-cost conversion burst — the **guaranteed cash sink** ([[Economy Model]]) | State |
| **Grassroots Surge** | Boost | self | Temporary Volunteer + tap multiplier | Governor |
| **Hitpiece** | Offense | rival | Negative media — slows the target rival's conversion | State |
| **Attack Ad** | Offense | rival + bloc | Cut a rival's support within a chosen bloc | Senate |
| **Oppo Dump** | Offense | rival | Triggers a scandal [[Events & Crises\|event]] on the target rival | President |

## Scaling Across Offices
- More abilities (and stronger tiers) **unlock as offices climb**; cooldowns and cash costs scale with tier so abilities stay relevant at Presidential scale. → [[Number Scaling & Curves]]

## Pillar / System Notes
- ✅ **No defensive abilities (confirmed design rule):** [[Events & Crises]] cannot be shielded — they're survivable/recoverable through choices, offense, or boosts, never an unblockable wall (Pillar 5a).
- **Targeting:** offensive abilities (Hitpiece) and bloc-boosts (Court Interest Group) need a target — which rival / which bloc. → [[UX & UI Layout]], [[Opposition & Conflict]]

## Resolved Decisions & Tuning Targets
- ✅ **Ability roster authored** (8 abilities with unlock tiers above). 🎯 exact costs/cooldowns/magnitudes tuned.
- ✅ **Multi-rival targeting:** the player **picks the target rival** via a tap-to-target picker. → [[Opposition & Conflict]], [[UX & UI Layout]]
- ✅ **No ideology-gated abilities in MVP** — abilities are universal (simpler to balance). → [[Policy, Platform & Interest Groups]]
- 🎯 **Base cooldowns / cash costs / magnitudes** are balance values. → [[Number Scaling & Curves]]
- ✅ **Events are handled without shields** (consistent with the no-defense rule). → [[Events & Crises]]
