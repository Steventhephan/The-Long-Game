---
type: design-note
folder: 01 Foundation
status: complete
order: 5
---

# Design Pillars

> **Purpose:** The 3–5 inviolable principles that every design decision is tested against. When two features conflict, the pillars break the tie. This is the constitution of the project.
>
> **Depends on:** [[Vision Statement]], [[Player Fantasy]], [[Tone & Theme]], [[Target Audience & Platform]]
> **Feeds into:** *everything*

These are ordered, but all are binding. When a decision is unclear, apply them top to bottom.

---

## Pillar 1 — Theme is a gate, not a coat of paint

A feature must be **both fun and on-theme.** Fun alone is not enough.

- **Test:** *"Does this belong in a game about climbing the political ladder?"* If no → re-theme it to fit, or cut it.
- **Escape hatch:** reskinning an off-theme-but-fun mechanic so it *does* fit the politics theme counts as keeping it.
- **Forbids:** generic incremental features bolted on with no political justification; mini-games that could be in any clicker.

## Pillar 2 — Depth beats accessibility

When depth and accessibility collide, **serve the genre-literate player** ([[Target Audience & Platform]]). Do not dumb down.

- **Test:** *"Are we removing an interesting decision to make onboarding smoother?"* If yes → find another way to onboard; keep the decision.
- **Tension to manage (not a license to ignore):** this is a *mobile* game on a small screen. Depth must be delivered through good [[UX & UI Layout]], progressive disclosure, and [[Milestones & Unlocks|drip-fed complexity]] — not walls of text.
- **Forbids:** flattening upgrade synergies, prestige depth, or the policy/interest-group trade-off for the sake of simplicity.

## Pillar 3 — Protect the underdog climb

The **renewed rags-to-power feeling** ([[Player Fantasy]]) is sacred. Every election should begin feeling like an underdog and end feeling like a juggernaut, then renew at the next office.

- **Test:** *"Does this preserve the feeling of starting small and snowballing to dominance — and does it renew that feeling each rung?"*
- **Forbids:** anything that makes new elections feel trivial from the start (retained production trivializing the opening), or that erases the scrappy-beginning feeling. Directly governs [[Number Scaling & Curves]] and [[Pacing & Difficulty]].

## Pillar 4 — Active engagement is the soul

The game is **active-play-forward.** Idle/offline progress exists to *bridge the player's absence*, never to *replace playing*.

- **Test:** *"Does this give the player a more interesting thing to actively do — or an excuse to stop touching the game?"* Favor the former.
- **Implication:** automation should free attention for *higher-order active decisions* (which policies, which groups, which upgrades), not zero out interaction. Directly governs [[Offline & Idle Progress]] and [[Core Loop]].
- **Forbids:** designs where optimal play is "close the tab and wait."

## Pillar 5 — Neither cynical nor evangelical (and effort always pays off)

The game is a **warm, even-handed sandbox** that takes no stance on *real* politics. This pillar has two halves, both binding:

- **(a) Mechanical guarantee — grassroots effort visibly matters.** The game is built so that player effort *always* converts to visible progress. There are **no rigged-feeling walls, no dead ends, no "you can't win" states.** Friction and [[Opposition & Conflict|opposition]] must always be *surmountable through action.* This is the in-game antidote to nihilism.
- **(b) Symmetric real-world neutrality.** It must **never imply real politics is a hopeless, rigged machine where nothing matters** — *and equally* must **never preach that the player should go act/vote in real life.** Avoid both poles.
- **Test:** *"Would this feature make a player conclude real politics is rigged-and-pointless — OR make them feel preached at to take real-world action? If either, cut or change it."*
- **Forbids:** demoralizing "the system always wins" framings; get-out-the-vote messaging; satire so sharp it curdles into cynicism (guard the *warm* in [[Tone & Theme|warm satire]]).

---

## How Conflicts Are Resolved

When two pillars seem to conflict, the lower-numbered pillar does **not** automatically win — instead, find the design that honors both. The ordering only breaks genuine ties. Pillar 5 is special: it is a **hard line**, never traded away.

## Resolved Decisions & Tuning Targets

- **Pillar 2 vs. mobile constraints** is a standing UX challenge, not a contradiction — but watch for it. → [[UX & UI Layout]]
- **Pillar 5(a) constrains the entire economy:** no true progress walls. This must be honored in [[Economy Model]], [[Number Scaling & Curves]], and [[Opposition & Conflict]] — verify each against it.
