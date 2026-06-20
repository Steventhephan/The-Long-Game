---
type: design-note
folder: 04 Thematic Systems
status: complete
order: 16
---

# Policy, Platform & Interest Groups

> **Purpose:** The central strategic system — the left-right position axis, emergent ideology, interest-group blocs, the segmented voter pool, and the primary/general squeeze. This is where the politics theme *becomes* the core mechanic.
>
> **Depends on:** [[Primary Resources]], [[Progression Arc]], [[Tone & Theme]], [[Core Loop]]
> **Feeds into:** [[Campaigns & Abilities]], [[Minigames]], [[Opposition & Conflict]], [[Economy Model]]

## The Model in One Picture

```
ISSUES (3 per era → 12 by Federal)
   │  player picks a STANCE on each issue (a point on the left↔right spectrum)
   ▼
PLATFORM  ──aggregate──►  POSITION on the single LEFT–CENTER–RIGHT scalar
   │                              │
   │                              ▼
   │                      IDEOLOGY DESIGNATION (emergent, named) → bonus/malus package
   ▼
INTEREST GROUPS each prioritize certain issues & a preferred stance
   │  alignment → your SUPPORT with that group
   ▼
The UNDECIDED POOL is SEGMENTED INTO BLOCS (one per group, each a chunk of voters)
   │  your support with a group = how fast you convert THAT bloc (rivals have their own)
   ▼
WIN by assembling enough blocs to clear >50% before election day
```

## The Position Axis
- **Single left ↔ center ↔ right scalar** (chosen for mobile readability and "equally winnable" balance — Pillar 5b).
- The player's position is the **aggregate of their issue stances**, not a pre-chosen slider.

## Platform & Issues
- A **platform** is the player's set of **stances across the currently-unlocked issues.**
- **Issues unlock by era:** 3 (Local) → 6 (County) → 9 (State) → **12 (Federal)** — coalition complexity grows with office. ([[Eras & Phases]])
- Each issue offers stance options along the spectrum (e.g., taxes, healthcare, labor, guns, agriculture…). *(Exact stance granularity per issue — open below.)*

## Emergent Ideology
- The platform's aggregate position maps to a **named ideology designation** (e.g., a Progressive, a Moderate, a Conservative…), each carrying a **bonus/malus package** (e.g., a designation that boosts one bloc's conversion but penalizes another).
- **Ideology is a consequence of choices, never picked up front.** Each run can land on a different designation. (Connects to the Federal-era **ideological forks** in [[Upgrades]], which gate on your designation.)

## Emergent Party & the Base *(accepted reconciliation)*
- The player does **not** pick a party. Their platform's **lean** sorts them into that side's **primary**.
- **Primaries reward leaning *further* in your platform's direction**; a near-centrist has a weak base and a harder primary (realistic).

## Interest Groups as Blocs *(the keystone)*
- Each interest group **prioritizes specific issues** and a preferred stance on them; your alignment sets your **support** with that group.
- The **undecided pool is segmented into blocs**, one per group, each a sized chunk of voters.
- **Support with a group = your conversion rate for that bloc** (voters) *and* that group's **cash contributions** — this is the "support multiplies voter & cash earn rates" from [[Primary Resources]], made concrete.
- **Coalition-building is literal:** you win by assembling enough blocs to clear a majority. You can't satisfy every group, so you pick your battles.

## Primary vs. General = Different Bloc Composition *(the squeeze, mechanically)*
- **Primary:** the pool is weighted toward **partisan/base blocs** that reward **extremity** in your direction.
- **General:** the pool is weighted toward **moderate/independent blocs** that reward the **center**.
- This is what *produces* the radical→moderate squeeze from [[Progression Arc]] — it's emergent from bloc makeup, not faked.
- **Flip-flopping** (changing stances between primary and general to chase the new bloc mix) **costs you** (model C — lost support/credibility/cash, scaled to the swing).

## Content Roster A — The 12 Issues (3 per era; stances L/C/R = scalar −1/0/+1)
Stance labels are written **neutrally** — no option is "the correct politics" (Pillar 5b).

| # | Era | Issue | Left (−1) | Center (0) | Right (+1) |
|---|-----|-------|-----------|------------|------------|
| 1 | Local | Property Taxes | Raise to fund services | Hold steady | Cut |
| 2 | Local | Policing | Reform & reinvest | Maintain & fund | Expand & toughen |
| 3 | Local | Development | Affordable-housing mandates | Balanced zoning | Developer-friendly |
| 4 | County | Transit | Expand transit | Roads + transit mix | Prioritize roads |
| 5 | County | Small Business | Worker protections | Balanced | Deregulate & cut taxes |
| 6 | County | Education | Boost public schools | Maintain | School choice / vouchers |
| 7 | State | Healthcare | Public option | Mixed system | Market-based |
| 8 | State | Energy & Environment | Green transition | All-of-the-above | Industry-first |
| 9 | State | Guns *(hot-button)* | Stricter regulation | Background checks | Protect gun rights |
| 10 | Federal | Taxes & Spending | Tax wealth, expand programs | Balance the budget | Cut taxes & spending |
| 11 | Federal | Immigration *(hot-button)* | Pathway & expansion | Security + reform | Restriction & enforcement |
| 12 | Federal | Social Policy *(hot-button)* | Expansive rights | Moderate | Traditional values |

## Content Roster B — Interest Groups (blocs)
Real-world *categories* (fictional parties, no real people). `Lean` = where the bloc sits; `Pri/Gen` = share weighting in primary vs. general (base blocs heavier in primaries, moderates in generals).

| Bloc | Lean | Priority Issues (preferred stance) | Pri | Gen |
|------|------|-----------------------------------|-----|-----|
| Labor Unions | Left | Small Business (L), Healthcare (L), Taxes (L) | High | Med |
| Environmental Groups | Left | Energy (L), Transit (L) | High | Low |
| Civil-Liberties Advocates | Left | Social (L), Policing (L) | High | Low |
| Teachers | Center-Left | Education (L), Taxes (L) | Med | Med |
| Tech / Knowledge Workers | Center-Left | Energy (L), Immigration (L), Social (L) | Low | Med |
| Healthcare Industry | Center | Healthcare (C), Taxes (C) | Low | High |
| Retirees / Seniors | Center | Healthcare (C), Taxes (C), Social (C) | Med | High |
| Suburban Moderates / Independents | Center | Taxes (C), Policing (C), Social (C) | Low | **Very High** |
| Small Business Owners | Center-Right | Small Business (R), Taxes (R), Development (R) | Med | High |
| Farmers / Agriculture | Center-Right | Transit (R), Energy (C), Immigration (C) | Med | Med |
| Energy / Industry | Right | Energy (R), Taxes (R) | High | Low |
| Law Enforcement | Right | Policing (R), Guns (R) | High | Med |
| Faith & Community Groups | Right | Social (R), Education (R) | High | Low |
| Developers / Real Estate | Right | Development (R), Taxes (R) | Med | Med |

## Content Roster C — Ideology Designations (mean of stances → label + symmetric bonus/malus)
Emergent from the platform's mean position on [−1, +1]. Bonuses/maluses are **mirror-symmetric** across the spectrum so every path is equally winnable (Pillar 5b).

| Mean range | Designation | Bonus | Malus |
|------------|-------------|-------|-------|
| −1.00 … −0.60 | **Progressive** | +50% support gain with left base blocs (Labor, Environmental, Civil-Liberties) | −40% with right blocs (Energy, Faith, Law Enforcement) |
| −0.60 … −0.20 | **Liberal** | +25% with center-left blocs | −20% with right blocs |
| −0.20 … +0.20 | **Moderate** | +40% with Suburban Moderates/Seniors (general-strong) | Weak base → primaries are harder (−25% base-bloc gain) |
| +0.20 … +0.60 | **Conservative** | +25% with center-right blocs (Small Business, Farmers) | −20% with left blocs |
| +0.60 … +1.00 | **Populist/Hard-liner** | +50% with right base blocs (Energy, Faith, Law Enforcement) | −40% with left blocs |

## Pillar Checks
- **5b (even-handed):** every ideology designation is balanced (bonuses *and* maluses); every coalition path must be winnable. **Heaviest ongoing balance burden in the game.**
- **5a (effort pays off):** no coalition is an unwinnable wall; flip-flop lets you re-coalition at a cost. No rigged dead ends.
- **1 (theme is a gate):** this is the system that makes the politics theme *mechanical*, not cosmetic.

## Resolved Decisions & Tuning Targets
- ✅ **Stance granularity: 3 discrete positions per issue** (Left / Center / Right), with scalar values **−1 / 0 / +1**. Mobile-clear, easy to balance.
- ✅ **Position aggregate = the mean of chosen stances** across unlocked issues → the left-right scalar → ideology designation.
- ✅ **Flip-flop cost = escalating cash + eroding support-swing trust** (no "credibility" stat). → [[Economy Model]].
- ✅ **Issue scope** decided in [[Tone & Theme]]: mostly economics/governance, a few even-handed hot-buttons; **fictional parties**, no real people.
- ✅ **UX load:** the Platform tab uses **collapsible issue groups and a scrollable bloc list** (see [[UX & UI Layout]]); only unlocked issues show, growing 3→12 by era.
- ✅ **Issues, interest-group blocs, and ideology designations authored** (Rosters A–C above). 🎯 exact bonus/malus magnitudes & per-office bloc sizes tuned in playtest. → [[Number Scaling & Curves]].
- ✅ **Rival positioning** handled by the archetype-lean model in [[Opposition & Conflict]].
