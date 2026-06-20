---
type: design-note
folder: 05 Economy & Balance
status: complete
order: 22
---

# Number Scaling & Curves

> **Purpose:** The mathematical backbone — concrete formulas and starting constants the implementer codes against. **Magnitude = realistic electorate sizes; notation = standard suffixes (K/M/B/T).** All values below are **proposed starting points, tunable in playtest.**
>
> **Depends on:** [[Economy Model]], [[Generators]]
> **Feeds into:** [[Technical Architecture Requirements]], [[Pacing & Difficulty]]

> 📐 **These are the locked v1 formulas and constants** (user delegated the formula set). They are deliberately data-driven so new offices — and the post-MVP galactic tier, where the "numbers-go-up-forever" feel will live — can be appended as config, not code. See [[Vision Statement]] extensibility requirement. Concrete values are tuning targets, refined in playtest (§ Tuning Targets).

## 1. Electorate (Pool) Sizes — realistic, ~4.3× per office
General-election total pool per office (primary pool ≈ **35%** of it):

| Office | General pool | Primary pool |
|---|---|---|
| City Council | 5,000 | ~1,800 |
| Mayor | 22,000 | ~7,700 |
| County Council | 95,000 | ~33,000 |
| County Executive | 410,000 | ~145,000 |
| State Legislature | 1.75M | ~615,000 |
| Governor | 7.5M | ~2.6M |
| Senate | 32M | ~11M |
| President | 150M | ~52M |

Formula: `pool(office) ≈ 5,000 × 4.3^officeIndex` (index 0–7). **Win at >50%; instant win at 100%.**

## 2. Generator Costs — Cookie Clicker standard
- **Per-copy cost:** `cost(n) = baseCost × 1.15^(owned)` (confirmed 1.15×).
- **Per-rung base cost:** `baseCost(rung k) = baseCost0 × 8^k` (≈8× per rung up the 8-rung ladder).
  - Field example (Canvasser baseCost0 = 15 cash): 15 → 120 → 960 → 7.7K → 61K → 490K → 3.9M → 31M.
  - Finance track mirrors this with its own baseCost0.

## 3. Production Scaling
- **Per generator:** `output = baseOutput × count × upgradeMult × globalStack`.
- **Per-rung base output:** `baseOutput(rung k) = baseOutput0 × 7^k` (≈7× per rung — slightly below cost growth, so higher rungs are *efficient but gated*, the classic incremental pull).
- **Passive is deliberately weak** ([[Core Loop]]): tune total passive voters/sec to a small fraction of what active tapping + abilities can deliver in a contested race.

## 4. The Global Multiplier Stack
`effectiveOutput = baseOutput × Σbloc(support) × volunteerMult × prestigeMult × achievementMult`
- **Interest-group support** (per bloc): multiplier **0.5× (hostile) → 1× (neutral) → 3× (champion)** on that bloc's conversion + donations.
- **Volunteers (global, diminishing):** `volunteerMult = 1 + log10(1 + Volunteers)/2` (≈ controlled growth; avoids runaway — caps the [[Economy Model]] stacking risk).
- **Prestige:** `prestigeMult = 1 + 0.02 × Prestige` (+2%/point; revisit vs. a sqrt curve if it inflates).
- **Achievements:** small flat stack, **+1% each.**

## 5. Election Timer (active-play seconds)
- `generalTimer(office) = 90s × 1.4^officeIndex` → City Council ≈ 90s, President ≈ ~16 min of *active* play (spread across sessions, since the game [[Offline & Idle Progress|full-pauses]]).
- **Primary timer ≈ 0.6× the general.**

## 6. Tap & Crit
- **Base crit chance 5%**, upgradable toward a cap (~50%).
- **Crit magnitude ×5**, with per-tap base value scaling per office so taps stay relevant ([[Tap Mechanic]]).

## 7. Flip-Flop Cost Curve
- **Cash, escalating per policy:** `flipCost(k-th flip on a policy) = baseFlip(office) × 2^(k-1)` (doubles each successive flip of the *same* policy).
- **Support-swing erosion:** each flip multiplies *subsequent* support gains on that policy by **0.7** (compounding lost trust).

## 8. Prestige Earned per Run
`Prestige = Σ (officeWeight) over elections won`, with `officeWeight(office) = 2^officeIndex` — higher offices worth disproportionately more, so pushing deeper is the meta-incentive. → [[Prestige & Reset System]]

## 9. Caps & Guardrails *(resolve the cross-note runaway / overflow flags)*
- **Multiplier-stack ceiling:** the combined multiplier (support × Volunteers × Prestige × achievements) is **hard-capped per era** (≈ ×50 Local → ×5,000 Federal). Bloc support is capped at **3.0× (champion)**; excess is wasted.
- **Synergy upgrades use diminishing returns:** each additional cross-track synergy contributes **~0.85×** the previous one (soft cap), preventing exponential blow-up.
- **Volunteers** already use a log curve (§4); **Prestige** (+2%/pt) is validated against the cap and swaps to a diminishing curve if it breaches.
- **Guaranteed cash sink every tier:** the next generator rung **plus** an always-available, escalating **"Ad Blitz" ability** ensure cash always has somewhere to go — no overflow.

## Tuning Targets *(v1 values set above; refine in playtest — not open design questions)*
- 🎯 Pool/timer pacing, passive-weakness ratio, and the multiplier ceiling — validate against the ~8–12-run curve. → [[Pacing & Difficulty]]
- 🎯 Field-vs-Finance base constants so both tracks stay worthwhile. → [[Economy Model]]
- 🎯 Rival conversion/funding per archetype. → [[Opposition & Conflict]]
- 🎯 Prestige curve (+2%/pt) — validated against the cap.
