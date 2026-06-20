---
type: design-note
folder: 02 Core Gameplay
status: complete
order: 9
---

# Generators

> **Purpose:** The automated producers — this game's equivalent of Cookie Clicker's buildings. Each generates resources passively. Defines the two thematic ladders of producers.
>
> **Depends on:** [[Primary Resources]], [[Core Loop]]
> **Feeds into:** [[Upgrades]], [[Economy Model]], [[Number Scaling & Curves]], [[Eras & Phases]]

## Output Structure — Two Tracks

Generators split into two parallel tracks producing different outputs:

- **Field track → Voters/sec.** Auto-converts undecided voters (the "automated voter-attracting empire" of the [[Vision Statement]]).
- **Finance track → Cash/sec.** Auto-fundraises the war chest.

The player **balances investment across both**: Field converts the pool *now*, Finance funds the expansion that wins *later*. (Remember: passive output is deliberately **weak** per [[Core Loop]] / Pillar 4 — generators support active play, they don't replace it.)

## Purchase Model (Cookie Clicker standard — confirmed)

- Each generator is **bought repeatedly** — you own 1, 2, 3 … *N* of it.
- **Each copy adds linear output**; **cost rises ~1.15× per copy** (exact rate → [[Number Scaling & Curves]]).
- **[[Upgrades]] multiply** a generator's per-unit output (×2, ×3, synergies, etc.).
- All output is then multiplied by the global stack: **× interest-group support × Volunteers × Prestige** (see [[Primary Resources]]).

## The Ladders (~8 rungs each, unlocking as offices climb)

New generators **unlock as the player climbs the office ladder** — a city-council race fields Canvassers; National Media Teams and Super PACs appear near the top. Unlock triggers detailed in [[Milestones & Unlocks]] / [[Eras & Phases]].

### Field track — Voters/sec
| # | Generator | Status |
|---|-----------|--------|
| 1 | Canvasser | ✅ confirmed |
| 2 | Phone Bank | ✅ confirmed |
| 3 | Regional Office | ✅ confirmed |
| 4 | Campaign Bus | ✅ confirmed |
| 5 | Rally Tour | ✅ |
| 6 | TV Ad Spot | ✅ |
| 7 | Micro-Targeting Data Team | ✅ |
| 8 | National Media Team | ✅ (grand rung) |

### Finance track — Cash/sec
| # | Generator | Status |
|---|-----------|--------|
| 1 | Small-Dollar Drive | ✅ confirmed |
| 2 | Email Fundraising List | ✅ confirmed |
| 3 | Donor Dinner | ✅ confirmed |
| 4 | Bundler Network | ✅ confirmed |
| 5 | National Fundraising Committee | ✅ confirmed |
| 6 | Corporate Sponsorships | ✅ |
| 7 | Lobbyist Alliance | ✅ |
| 8 | Super PAC | ✅ (grand rung) |

## Persistence

Generators are the **persistent campaign operation** — counts **carry across elections** (you keep your Canvassers when promoted). This is the retained-production that the renewed-underdog climb (Pillar 3) must out-scale.

## Resolved Decisions & Tuning Targets

- ✅ **All 16 rung names authored** (both ladders complete above).
- **Field-vs-Finance balance:** tuning must keep both tracks worth investing in; neither should dominate. → [[Economy Model]]
- ✅ **Retained generator counts vs. Pillar 3 (resolved):** pool size scales ~4.3×/office and era walls gate progress, out-pacing retained generator growth — each new election still opens as an underdog. → [[Number Scaling & Curves]], [[Pacing & Difficulty]]
- ✅ **Generators reset only on run loss** (they persist across elections within a run); no separate prestige reset. → [[Prestige & Reset System]]
- **Exact base costs, base outputs, and the 1.15× rate** are balance values. → [[Number Scaling & Curves]]
- ✅ **Unlock triggers:** office-gated (macro) + resource-threshold drip (micro). → [[Milestones & Unlocks]]
- 🎯 **Flavor check:** ensure "National Media Team" reads clearly as a *Field* (voter) producer in [[Narrative & Flavor]].
