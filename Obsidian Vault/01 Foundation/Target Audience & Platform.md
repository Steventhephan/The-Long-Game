---
type: design-note
folder: 01 Foundation
status: complete
order: 4
---

# Target Audience & Platform

> **Purpose:** Defines who the game is for and the hard constraints of the platform (mobile-first browser). These constraints shape UI, session length, controls, and performance budgets.
>
> **Depends on:** [[Vision Statement]], [[Player Fantasy]]
> **Feeds into:** [[UX & UI Layout]], [[Core Loop]], [[Pacing & Difficulty]], [[Offline & Idle Progress]], [[Technical Architecture Requirements]]

## Target Player

**Primary: incremental / idle genre fans.** They come for the *numbers-go-up* loop; the political theme is the **flavor and hook**, not the reason they play.

**Implications of a genre-literate audience:**
- We can **assume fluency** with genre conventions — exponential cost curves, big-number notation (1.2M, 4.5e18…), prestige/reset layers, upgrade trees and synergies, "buy x10/x100." Less hand-holding needed on *how incrementals work*.
- The bar is **higher on depth and pacing**, not lower. These players will notice a shallow curve, a dead midgame, or a theme that's only skin-deep.
- **The political theme must add mechanical value** (the interest-group/policy trade-off, the office ladder) — not just relabel buildings. If you strip the theme and it's a generic clicker, we've underdelivered.

## Session Pattern

**Lean-in, focused sessions** (not idle-glance checkers):
- **Early elections:** a few minutes each to reach the next office — fast, punchy, lots of promotions.
- **Later/bigger elections:** progressively longer sessions, in classic incremental fashion, as targets and stakes scale up.

This is an **active-play-forward** game: the player is meant to be *doing things* (tapping, buying, choosing policies, courting groups), not just watching a meter fill.

## Platform Constraints (mobile-first browser)

- **Touch-first, small screen, likely one-handed portrait.** Tap target and key actions must be thumb-reachable. See [[UX & UI Layout]].
- **Browser, not app store.** Loads as a web page; persistence via local storage; no native install assumed. See [[Technical Architecture Requirements]].
- **Mid-range phone performance budget.** Big-number math, many generators, and juice/animation must stay smooth on modest hardware. See [[Game Feel & Juice]], [[Technical Architecture Requirements]].

## Resolved Decisions & Tuning Targets

- ✅ **RESOLVED — lean-in vs. long elections:** [[Offline & Idle Progress]] decision = **full pause**. The timer ticks only during active play, so long elections are completed **across multiple resumable sessions** — no tab-open grind, no marathon sitting, no losing while away. (A *ceiling* on the longest election is still a [[Pacing & Difficulty]] concern.)
- **Genre fans expect meta-depth** (prestige, synergies). The MVP (→ President) must still feel deep enough to satisfy them, or risk feeling like a thin demo. → [[Prestige & Reset System]], [[Upgrades]]
- **Theme-must-earn-its-place** is a standing bar for every system: relabeling alone is failure. → [[Design Pillars]]
