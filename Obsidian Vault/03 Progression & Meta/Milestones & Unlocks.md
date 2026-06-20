---
type: design-note
folder: 03 Progression & Meta
status: complete
order: 14
---

# Milestones & Unlocks

> **Purpose:** The cadence of reveals — what unlocks when, and what gates it. Controls the drip of novelty that keeps players engaged.
>
> **Depends on:** [[Progression Arc]], [[Eras & Phases]], [[Upgrades]]
> **Feeds into:** [[Pacing & Difficulty]]

## Unlock Trigger Model — Layered (C)

Three layers working together:

- **Office-gated (macro key).** Reaching a new **office / era** unlocks the headline systems and the era's new generator tiers — exactly the drip mapped in [[Eras & Phases]]. This is the master gate (interest groups at County, abilities at State, ideological forks at Federal, etc.).
- **Resource-threshold (micro drip).** *Within* an era, individual [[Generators]] and [[Upgrades]] reveal as the player crosses voter/cash thresholds (classic "you have X cash → the next rung appears"). Keeps a steady trickle of novelty *between* promotions, so no era goes dry.
- **Win-based.** Winning a primary/general advances offices (and banks [[Prestige & Reset System|Prestige]]).

## Achievements — Reward-Bearing

Achievements grant **permanent gameplay rewards** (small boosts/multipliers, Cookie-Clicker style) — another thing genre fans chase. They feed the multiplier stack from [[Primary Resources]].

Example categories *(content TBD)*:
- **Production:** own N of a generator; reach X voters/sec or cash/sec.
- **Tap:** total knocks; total crits; a huge single crit.
- **Election:** win with 100% (shutout); win a general after a maximally-radical primary; win at least once with each ideology.
- **Economy / Prestige:** banked Prestige thresholds; perk-tree completion.

## Achievement Roster (starter set)
| Achievement | Condition | Reward |
|---|---|---|
| **First Steps** | Win your first election | small global multiplier |
| **Door to Door** | 10,000 total knocks | +tap yield |
| **Crit Storm** | Land a huge single crit | +crit chance |
| **Landslide** | Win an election with >70% | +global multiplier |
| **Shutout** | Win by reaching 100% | +Prestige |
| **Comeback Kid** | Win after being in last place | +global multiplier |
| **Big Tent** | Win with 5+ blocs in your coalition | +support gain |
| **Across the Aisle** | Win at least once as each ideology designation | large global multiplier |
| **Machine Politics** | Own 100 total generators | +passive output |
| **People-Powered** | Reach 10,000 Volunteers | +Volunteer accrual |
| **Mr./Madam President** | Win the Presidency | big Prestige + cosmetic |
| **Dynasty** | Win the Presidency in two different runs | capstone multiplier |

## Roguelite Re-Traversal (how unlocks behave across runs)

Because the operation resets each run ([[Prestige & Reset System]]):
- **Generator/system availability re-gates by office every run** — you still can't field a Super PAC at City Council. The climb is re-traversed (faster, thanks to Prestige).
- **Meta-unlocks persist** — achievements and their rewards, the Prestige perk tree, and the global multiplier carry across all runs.

## Reveal Cadence

- **Early/Local:** frequent, fast reveals (a new thing every short burst) for immediate dopamine and onboarding.
- **Later:** reveals stretch out as elections lengthen, but **the drip never fully stops** (Pillar 2 depth; Pillar 5a effort→visible progress).
- **Foreshadowing:** show locked/greyed next generators and the next era's hook to pull the player forward.

## Resolved Decisions & Tuning Targets
- ✅ **Achievement rewards persist across runs** (meta, like Prestige). → [[Prestige & Reset System]]
- ✅ **Multiplier stacking (resolved):** capped per era + diminishing-returns synergies + log Volunteers / validated Prestige curve. → [[Number Scaling & Curves]]
- **Exact thresholds and the full achievement list** are content/balance. → [[Pacing & Difficulty]], [[Number Scaling & Curves]]
- **First-run vs. later-run pacing differ** (later runs blow through Local) — ensure re-traversal stays satisfying, not tedious. → [[Pacing & Difficulty]]
