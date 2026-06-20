---
type: production-doc
folder: 07 Production
status: complete
---

# Project Summary — The Long Game

> **Self-contained synthesis.** This document, plus [[Technical Architecture Requirements]] and [[Implementation Roadmap]], is written so a developer or AI can build the MVP **without the design interview or the rest of the vault.** The design notes (sections 01–06) hold finer detail; this is the authoritative overview.

## 1. Elevator Pitch
**The Long Game** is a mobile-first, browser-based **active incremental game** — *Cookie Clicker's* bones, reskinned as a climb up the U.S. political ladder. You tap to **knock on doors** and win over **voters**, build an automated campaign operation, and win election after election to rise from **City Council to President**. It is a **warm satire** (Veep-but-gentler × The Onion), an **even-handed political sandbox** where the player picks their own ideology and the game never says who's right. Reaching President wins the MVP; a secret **galactic republic** extends the climb in future content.

## 2. Core Fantasy & Pillars
- **Fantasy:** a grassroots underdog who snowballs into an unstoppable movement — *renewed each election and each run.*
- **Design Pillars (the constitution):**
  1. **Theme is a gate, not a coat of paint.**
  2. **Depth beats accessibility** (audience = incremental-genre fans).
  3. **Protect the underdog climb.**
  4. **Active engagement is the soul** (idle bridges absence, never replaces play).
  5. **Neither cynical nor evangelical** — effort *always* visibly pays off (mechanical guarantee); symmetric real-world neutrality; warm, even-handed.

## 3. The Core Loop
1. **Tap "Knock on Doors"** → convert undecided **voters** + earn **cash** (small **crit** chance, upgradable).
2. Spend **cash** on two generator tracks — **Field** (voters/sec) and **Finance** (cash/sec) — Cookie-Clicker buy-many model (×1.15 cost/copy).
3. Earn-rates are multiplied by a stack: **interest-group support × Volunteers × Prestige × achievements.**
4. Win the election before the **timer** expires; promote; repeat at larger scale.

**Active, not idle:** passive income is deliberately weak; the game **full-pauses** when closed (no offline accrual). Elections are measured in *active-play time*, completed across sessions.

## 4. Structure
- **Spine:** linear, **8 offices**, each with a **Primary then a General** = **16 elections to President** (the MVP win).
  > City Council → Mayor → County Council → County Executive → State Legislature → Governor → Senate → President
- **4 Eras** (complexity drip): **Local** (core loop + Volunteers) → **County** (interest groups, positioning, Charisma/minigames) → **State** (abilities, events) → **Federal** (ideological forks, grand generators, max rivals).
- **Roguelite dynasty meta:** a **run** = one candidate's climb. Losing **restarts at City Council** with a new candidate, banking **Prestige ∝ elections won**. Prestige buys **permanent global multipliers + a perk tree.** ~**8–12 runs** to a first Presidency; walls sit at era scale-jumps.

## 5. The Election (the heart)
- Each election has a **countdown timer** and a **finite pool of undecided voters segmented into interest-group blocs.**
- You and **N AI rivals** (1 → capped, by office) convert blocs **in real time.**
- **Win:** hold **>50%** of the pool at timer end, **or** convert **100%** (instant). **Lose** (ends the run): sub-50% at timer end; lowest when the pool is fully claimed (elimination); or a rival hits 100%.
- **Elimination:** when the pool empties with no majority, the lowest candidate is knocked out and their voters return to undecided.

## 6. The Strategic System — Policy, Platform & Interest Groups
- The player builds a **platform** by choosing **stances on issues** (3 per era → **12 by Federal**).
- Stances aggregate to a position on a **single left–center–right axis** → an **emergent ideology designation** with bonus/malus packages.
- **Interest groups** prioritize specific issues; your alignment sets your **support** with each group; support = **conversion rate for that group's bloc** + its cash donations.
- **Primaries** weight the pool toward **partisan blocs (reward extremity)**; **generals** toward **moderate blocs (reward the center)** — producing the **radical→moderate squeeze.** Pivoting is allowed but **flip-flopping costs escalating cash + erodes trust** (support-swing effectiveness).
- **Even-handed:** every ideology/coalition must be equally winnable (the heaviest balance burden).

## 7. Supporting Systems
- **Resources:** Voters (per-election score, reset), Cash (spend), Prestige (meta), Interest-group support (multiplier), Charisma (stat, from minigames), Volunteers (global multiplier, Charisma-scaled).
- **Abilities:** cooldown-based, cash-cost, offensive + boost (e.g., Court Interest Group, Puffpiece, Fundraiser, Hitpiece). No defensive abilities.
- **Minigames:** choice-based, pause the race; build Charisma & shift support; mix of mandatory (debates) + optional.
- **Events & Crises:** choice dilemmas + struck modifiers; negative/neutral/positive; random/state-triggered/scheduled; always recoverable (no shields).
- **Opposition:** hybrid AI rivals as named **archetypes** (Establishment Favorite, Radical Insurgent, Charismatic Outsider, Self-Funding Mogul) — each strong somewhere, weak somewhere.

## 8. Presentation
- **Visual:** Vintage campaign-poster Americana (WPA/screen-print); red/white/blue patriotic frame; **non-partisan palette for the left-right axis** (even-handedness).
- **Audio:** folksy/marching-band Americana, crowd reactions, ballot-stamp tap "pop," news-stings.
- **Feel:** the **tap gets the most juice** (stamp, +N pop, crit airhorn); big win/promotion fanfares; loss feels like *banking Prestige*, not failure.
- **UI:** portrait, **bottom tabs** (Campaign / Operation / Platform / Legacy) with a **persistent live-race header**; **tabs reveal progressively** as systems unlock.

## 9. Numbers (realistic scale; standard K/M/B suffixes)
Pools **5K → 150M** (~4.3×/office); generators ×1.15/copy, ~8×/rung; timers 90s → ~16 min active; Prestige +2%/point (office-weighted). Magnitudes stay within JS-safe doubles — **no big-number library needed for MVP.** (See [[Number Scaling & Curves]] for formulas.)

## 10. Scope
- **MVP / v1:** the full 16-election ladder to **President = victory**, the dynasty/Prestige loop, all systems above. Free, client-side, **no monetization** (decided), English-only.
- **Deferred (post-MVP):** the **galactic republic** tier (data-driven extension — the "numbers-go-up-forever" payoff), monetization, cloud save, localization, difficulty modes.
- **Cut:** governing/policy-enactment and "societal transformation" — the game is about *winning* offices, not holding them.
```
```
