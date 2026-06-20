---
type: production-doc
folder: 07 Production
status: complete
---

# Implementation Roadmap — The Long Game

> Phased build order from a playable vertical slice to the full MVP, with acceptance criteria. **To start coding, open [[Build Quickstart]] first** (consolidated stack, data model, constants, tick algorithm, save schema, Phase-1 DoD). Read alongside [[Project Summary]] and [[Technical Architecture Requirements]]. Build **vertical first** (prove the fun), then widen.

## Phase 0 — Foundation & Setup
- Scaffold TypeScript + Svelte + Vite; lint/test/CI; PWA shell.
- Define the **data-driven config schema** ([[Technical Architecture Requirements]] §4) and the **central balance-constants file** ([[Number Scaling & Curves]]).
- Implement the **fixed-timestep game loop** + **Page Visibility full-pause** + the **`Num` abstraction** and suffix formatter.
- **Done when:** an empty loop ticks at a stable rate, pauses on hide, and persists/loads a trivial state.

## Phase 1 — Vertical Slice: One Election (prove the fun)
Single office (**City Council**), Primary + General.
- Tap **Knock on Doors** → voters + cash, with crit.
- **Finite pool** with **1–2 interest-group blocs**, **1 AI rival**, **real-time conversion**, **countdown timer**, **win/lose/elimination**.
- One **Field** + one **Finance** generator (buy-many, ×1.15).
- Minimal UI: **Campaign tab** + **persistent race header**.
- **Done when:** a player can tap, buy, and win/lose a City Council primary+general that *feels* like a contested race. **This is the make-or-break milestone — playtest it before widening.**

## Phase 2 — The Incremental Spine
- Full **Field/Finance ladders** (8 rungs each) + **Upgrades** (multipliers, synergies, crit, tap).
- **Multiplier stack** wiring (placeholders for support/Volunteers/Prestige).
- **Operation tab**, number scaling per [[Number Scaling & Curves]], **save/load + autosave + migrations**.
- **Done when:** a satisfying buy-and-grow economy runs across a couple of offices with correct scaling and robust saves.

## Phase 3 — Policy, Platform & Interest Groups (the keystone)
- **Issues** (start with 3) + stance selection → **aggregate position** → **emergent ideology** + bonus/malus.
- **Interest-group blocs** with support meters; **segmented pool conversion** driven by support.
- **Primary vs. general bloc composition** (the radical→moderate squeeze) + **flip-flop cost** (escalating cash + trust erosion).
- **Platform tab.**
- **Done when:** coalition-building meaningfully decides elections and the primary/general squeeze is felt.

## Phase 4 — Dynasty / Prestige Meta (the roguelite)
- **Run reset on loss**, **Prestige banked ∝ elections won**, **global multiplier + perk tree**, **Legacy tab**.
- **Roguelite re-traversal** (re-gate content by office; fast replay of mastered offices).
- **Milestones/unlocks** (office-gated + threshold drip) and **reward-bearing achievements**.
- **Done when:** losing feels like progress, restarts are faster, and the ~8–12-run curve toward President is in place.

## Phase 5 — Depth Systems & Era Hooks
- **Minigames** (choice-based, pause race; Charisma + support) — County hook.
- **Charisma → Volunteers** scaling.
- **Abilities** (cooldown, cash, offensive + boost) — State hook.
- **Events & Crises** (dilemmas + modifiers; triggers) — State hook.
- **Opposition archetypes** (hybrid AI, leans, strengths/weaknesses; scaling rival counts) — Federal max fields.
- **Ideological forks** — Federal hook.
- **Done when:** each era introduces its headline system on schedule ([[Eras & Phases]]) and rivals feel distinct.

## Phase 6 — Full Content & Presentation
- All **8 offices / 16 elections**, all generators/issues/blocs/archetypes/events as config.
- **Vintage-Americana visual style**, **audio**, **juice** (tap-first), **flavor/narrative** (Veep-gentler × Onion), news ticker, characters, announcer.
- Win-state: **President = victory** + credits + "start a new dynasty."
- **Done when:** the complete MVP is content-complete and on-style.

## Phase 7 — Balance, Accessibility, Polish
- Tune the **8–12-run curve**, era **walls**, passive-weakness ratio, multiplier ceilings, **cash-sink sufficiency**, "equally winnable" across ideologies.
- Mitigate **feel-bads** (sub-50% buzzer loss, late events, re-traversal tedium → fast-forward perk).
- **Accessibility** (reduced-motion, color-blind-safe blocs, tap targets), performance pass to 60fps.
- **Done when:** playtests confirm pacing, fairness, even-handedness, and smoothness.

## Post-MVP (architected-for, not built)
- **Galactic republic tier** (data-driven offices beyond President; the endless "numbers-go-up" payoff) — may trigger the **big-number library** swap.
- **Monetization** decision, **cloud save**, **localization**, **difficulty modes**, **branching ladder**.

## Cross-Cutting Guardrails (apply every phase)
- Honor the **5 Design Pillars** ([[Design Pillars]]) — especially **even-handedness (5b)** and **effort-always-pays-off (5a)**.
- Keep **sim/ pure and unit-tested**; keep **content in config**; keep **saves migratable**.
