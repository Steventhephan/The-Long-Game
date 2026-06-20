---
type: design-note
folder: 02 Core Gameplay
status: complete
order: 8
---

# Primary Resources

> **Purpose:** Enumerates the currencies/resources/stats, what each represents, how they are earned and spent, and how they relate. The resource set defines the shape of the whole economy.
>
> **Depends on:** [[Core Loop]], [[Tap Mechanic]]
> **Feeds into:** [[Generators]], [[Upgrades]], [[Economy Model]], [[Prestige & Reset System]], [[Campaigns]]

## Resource List

| Resource / Stat | Type | Represents | Earned by | Spent / Used on | Resets? |
|---|---|---|---|---|---|
| **Voters** | per-election score | electoral support in the current race | taps + weak passive, from the finite undecided pool | nothing (it *is* the win condition) | **each election** |
| **Cash** | soft spend currency | campaign war chest | taps (+crit), weak passive | [[Generators]], [[Upgrades]], abilities, crit-chance upgrades | TBD (persist?) |
| **Prestige** | meta currency | enduring political legacy | winning elections | permanent cross-election bonuses | **persists (whole game)** |
| **Interest-group support** | multiplier meters (per group) | how much each bloc likes you | policy positions + minigame answers | multiplies **voter & cash earn rates** | TBD |
| **Charisma** | leveled stat | the candidate's personal magnetism | minigames | sets the **rate of Volunteer gain** | TBD |
| **Volunteers** | global multiplier | grassroots manpower | passively, at a rate set by Charisma | boosts **per-tap and/or generator output** (everything) | TBD |

## How They Interrelate (the multiplier stack)

```
TAP (knock) ─► Voters + Cash  ──(×crit chance)
GENERATORS  ─► Voters + Cash  (weak passive)
        │
        ▼  all earn-rates are multiplied by:
  × Interest-group support (per-bloc, raised/lowered by your positions)
  × Volunteers (global, fed by Charisma)
  × Prestige bonuses (permanent, cross-election)
        │
        ▼
  Voters climb toward >50% of the finite pool before election day → WIN → Prestige
```

- **Cash is the engine's fuel** — the only thing you actively *spend* moment-to-moment.
- **Voters are the scoreboard**, not a wallet.
- **Interest-group support, Volunteers, and Prestige are all multipliers** layered on the base output — the classic incremental stack, tuned for genre-literate players.
- **Charisma is a stat, not a currency** — it indirectly powers the economy by feeding Volunteers.

## Soft vs. Hard / Premium Currencies

- **Soft:** Cash (freely earned and spent).
- **Meta/hard:** Prestige (rare, permanent, cross-run).
- **Premium (real-money):** **none — the MVP is free** (decided). No premium currency; architecture stays able to add monetization later.

## Resolved Decisions & Tuning Targets

- ✅ **Persist vs. reset (governs Pillar 3):** *within a run* — Cash (war chest), generators, upgrades, Charisma, Volunteers all **persist**; **voters reset each election**. *On run loss* — everything operational **resets**; **Prestige + perks persist**. **Interest-group support is established per election by your platform** (carried primary→general within an office with a flip-flop cost; reset at each new office). → [[Economy Model]], [[Prestige & Reset System]].
- ✅ **Volunteers don't trivialize new elections:** pool size scales ~4.3×/office, out-pacing retained multiplier growth, and era walls gate progress. → [[Number Scaling & Curves]], [[Pacing & Difficulty]].
- ✅ **Six-resource screen load:** handled by **progressive tab reveal** + the [[Milestones & Unlocks]] drip — each resource appears with the era that introduces it, never all at once. → [[UX & UI Layout]].
- ✅ **Minigames (Pillar 4):** resolved in [[Minigames]] — a mix of mandatory (debates, core to the climb) + optional (gated by cooldown + cash cost). Not hollow side content.
- ✅ **Monetization:** **none — MVP is free.** → [[Technical Architecture Requirements]].
- ✅ **Interest-group mechanics** fully specified in [[Policy, Platform & Interest Groups]].
