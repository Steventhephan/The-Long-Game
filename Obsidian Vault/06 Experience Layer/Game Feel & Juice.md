---
type: design-note
folder: 06 Experience Layer
status: complete
order: 26
---

# Game Feel & Juice

> **Purpose:** The micro-feedback that makes tapping and buying satisfying — the difference between a spreadsheet and a game. **Proposed spec (user delegated); the TAP gets the most juice** as the most-repeated action.
>
> **Depends on:** [[Tap Mechanic]], [[Visual & Audio Style]]
> **Feeds into:** [[Technical Architecture Requirements]]

## ⭐ The Tap (highest priority — must feel chunky every press)
- **Visual:** button squashes on press; a **ballot-stamp imprint** "thwacks" down; a **"+N" floats and arcs away**; a voter pip **flies into your share bar**; faint cream-paper ripple.
- **Crit:** much bigger — red/gold flash, bold **"CRIT! +5"**, **airhorn/cheer sting**, confetti burst, stronger haptic, the share bar visibly jumps.
- **Haptics:** light vibration per knock (where supported), heavier on crit.
- **Responsiveness:** feedback fires on **touchstart** (zero perceived lag); never gated on animation.
- **Rhythm, not punishment:** sustained tapping adds a subtle escalating stamp-pitch/shimmer streak — satisfying, never penalizing. Works with the hold/auto-knock option from [[Tap Mechanic]].

## Purchases & Unlocks
- **Generator buy:** cha-ching + register; row count ticks up, a worker/icon pops in; cost re-rolls. Bulk-buy = bigger pop.
- **Upgrade:** stamp + glow sweep.
- **Reveal/unlock:** new generator/system **stamps in with a "NEW" pin-back badge** and a brief spotlight (ties to [[Milestones & Unlocks]] drip).

## Abilities, Blocs, Events
- **Ability:** brass sting, icon pulse, a halftone poster banner ("HIT PIECE!"), cooldown sweep.
- **Bloc conversion:** bloc fills with your color + small cheer; **stealing a bloc from a rival** gives an extra-satisfying "flip" pop.
- **Event/scandal:** news-sting, newsprint lower-third banner, record-scratch for bad news; modal slides in.

## Climactic Moments
- **Election win:** crowd roar, **confetti/balloon drop**, big condensed **"WINNER"** banner, announcer VO, share bar slams past 50% with a gold sweep → results card (your %, blocs won).
- **Promotion:** the next office **poster stamps over the old**, marching-band flourish, the scale **visibly zooms out** (town → region → state → nation), any new tab/system reveals. The climb's payoff.
- **Run-end (loss):** warm, not punishing — a wry **"Concession Speech"** card, then the **Prestige tally animates up (⭐ +N)** and the perk tree beckons. Loss *feels like banking progress* (Pillars 5a & 3).

## Economy Feel
- Counters **roll/tick** (never hard-jump); K/M/B suffixes; juicy but readable.

## Performance & Restraint
- Juice via **cheap CSS/canvas transforms & opacity**; **object-pool** floating numbers; **cap particles on low-end**; hold 60fps ([[Visual & Audio Style]], [[Technical Architecture Requirements]]).
- **Respect reduced-motion**: scale effects down, keep core feedback.

## Resolved Decisions & Tuning Targets
- ✅ **Tap fatigue (resolved):** the **Auto-Knock upgrade** ([[Tap Mechanic]]) handles sustained play and still fires the full tap juice (stamp + pops) at its capped rate. 🎯 Validate intensity isn't over-stimulating in playtest.
- **Haptics support varies** (iOS Safari limited) — graceful fallback.
- **Particle/number-pop budget** on low-end devices — define caps. → [[Technical Architecture Requirements]]
