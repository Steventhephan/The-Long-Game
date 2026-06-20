---
type: design-note
folder: 03 Progression & Meta
status: complete
order: 15
---

# Offline & Idle Progress

> **Purpose:** Defines what happens while the player is away. **Decision: full pause — this is an *active* incremental, not an idle one.** There is deliberately **no offline accrual.**
>
> **Depends on:** [[Core Loop]], [[Generators]], [[Target Audience & Platform]]
> **Feeds into:** [[Economy Model]], [[Technical Architecture Requirements]]

## Decision — Full Pause (A)

When the player leaves, **everything freezes**: the election timer, rival conversion, and the player's own generators. On return, the game **resumes exactly where it left off.** There is **no "offline earnings" popup** because nothing accrues while away.

## How It Works

- The game state advances **only while the tab is open and in the foreground (visible).**
- **Backgrounding, locking the phone, or closing the tab → full pause.** (Implemented via the Page Visibility API; see [[Technical Architecture Requirements]].)
- The **"welcome back" moment is simply resuming** — optionally a brief "Welcome back, candidate" with a snapshot of the current race standings, *not* an idle-reward screen.

## Key Consequence — Elections Are Measured in *Active-Play Time*

The countdown timer ticks only during active play, so a **long election is completed across multiple sessions**, not one marathon sitting. This means:
- ✅ **Resolves the lean-in tension** flagged in [[Target Audience & Platform]]: long (e.g., Presidential) races never require a tab-open grind or a single long session — you can leave anytime and resume, losing nothing.
- ✅ **You can never lose a run while away** (Pillar 5a — fair).
- ✅ Leans fully into **Pillar 4** (active engagement is the soul).

## Technical & Integrity Upsides
- **No offline simulation needed** — no need to fast-forward generators or rivals on return. Simpler, deterministic, and far more **cheat-resistant** (no clock-manipulation exploits). → [[Technical Architecture Requirements]]
- Requires **frequent autosave** so closing mid-action loses nothing.

## Resolved Decisions & Tuning Targets
- ✅ **Genre-expectation (decided):** the game is positioned as **"an active campaign game"** in store copy and onboarding; the full-pause / no-offline-progress stance is intentional. Monitor reception in playtest. → [[Target Audience & Platform]]
- ✅ **Pause trigger:** pause on *visibility-hidden* (background/lock), not only on close — prevents any unfair drift while a rival "campaigns."
- ✅ **No idle layer anywhere in the MVP** — a run is a continuous chain of active elections with full-pause between sessions.
- **Resume UX:** after a long absence, re-orient the player to the in-progress race (standings, timer remaining). → [[UX & UI Layout]]
