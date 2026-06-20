---
type: design-note
folder: 06 Experience Layer
status: complete
order: 27
---

# Narrative & Flavor

> **Purpose:** The voice of the game — flavor text, event writing, news ticker, recurring characters — and how the climb's story is told. **Proposed voice guide + samples (user delegated).**
>
> **Depends on:** [[Tone & Theme]], [[Player Fantasy]], [[Eras & Phases]]
> **Feeds into:** [[Project Summary]]

## Delivery Model — Mix (C)
Mostly **emergent flavor**, plus a few **recurring character voices**:
- **Flavor text** on every generator/upgrade (Cookie-Clicker style).
- **Satirical news ticker** reacting to your run state.
- **Event vignettes** ([[Events & Crises]]) and **[[Minigames]]** dialogue.
- **Announcer VO** at promotions/wins.
- **Recurring characters:** a wry, world-weary-but-fond **Campaign Manager** (narrator/tutor with personality) and a light **rival nemesis**.
- **One scripted beat:** the **galactic reveal** (post-MVP).

## Voice Guide
- **Calibration:** *Veep*'s wit **minus the venom**, plus *The Onion*'s deadpan absurd headlines. Warm, affectionate, hopeful undercurrent.
- **Punch at the process, not the politics:** jokes target robocalls, donor dinners, consultants, yard signs, PACs, undecided voters — **never left/right positions.**
- **Even-handed (Pillar 5b):** mock every archetype equally; never tell the player their politics are wrong. **Test:** *would a player of any politics laugh* with *it, not feel mocked?*
- **Keep it warm (Pillar 5a):** never tip into "it's all hopeless" cynicism.
- ✅ **Boundaries ([[Tone & Theme]]):** real *issues* yes (a few, even-handed); **real politicians — no; parties fictional but recognizable.**
- **Register:** PG-13 at most; punchy, short, mobile-readable.

## Sample Flavor Text
**Generators**
- *Canvasser:* "Knocks on doors with the unshakable optimism of someone who hasn't met the neighbors yet."
- *Phone Bank:* "'Hi, do you have five minutes to talk about—' *click.* Forty thousand times an hour."
- *Donor Dinner:* "$500 a plate for $9 chicken. The cause? Inspiring."
- *Super PAC:* "Legally not coordinating with you. *Winks in 30-second ad buy.*"

**News Ticker (Onion-style)**
- "Candidate Promises to Fix Everything, Specifies Nothing; Polls Surge"
- "Local Man Still Undecided, Mostly Enjoying the Attention"
- "Area Yard Sign Achieves Sentience, Endorses Itself"

**Event vignette (even-handed choices)**
- *Opposition Research:* "A photo surfaces of you at a 2009 costume party. → **Deny** / **Apologize** / **Lean In.**"

**Campaign Manager (narrator)**
- "Congrats on City Council. My nephew's on City Council. It's not nothing."
- "We can flip the suburbs, but it'll cost us the base. Politics is just disappointing people in the right order."

**Announcer (promotion):** "Ladies and gentlemen — your next **Mayor!**"

## Resolved Decisions & Tuning Targets
- ✅ **Real-names boundary (decided):** **fictional parties** (recognizable, never Democrat/Republican) and **no real people** — not as characters, not in the news ticker. → [[Tone & Theme]].
- ✅ **Localization:** **English only for MVP** (architect strings for later localization).
- 🎯 **Volume (production task):** all writing scheduled in [[Implementation Roadmap]] Phase 6.
- 🎯 **Even-handedness review:** recurring-character commentary stays neutral regardless of the player's platform; every line passes the even-handed test above.
