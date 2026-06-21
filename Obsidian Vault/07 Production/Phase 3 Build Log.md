---
type: production-doc
folder: 07 Production
status: complete
---

# Phase 3 Build Log — Policy, Platform & Interest Groups

> Read after [[Phase 2 Addendum]]. Documents Phase 3 and all subsequent UI/UX work done in the same session. **Git head: `db8755e`. Next phase is Phase 4** (Dynasty / Prestige Meta).

---

## What Was Built

### Core systems

**12 Issues × 5 stances** (`config/issues.ts`):
- Scalars: −1 (Left), −0.5 (Center-Left), 0 (Center), +0.5 (Center-Right), +1 (Right)
- Each stance has `id`, `label`, `title` (policy name), `description` (flavor)
- **Do NOT use "Far Left"/"Far Right" — labels are just "Left"/"Right"**
- Unlocked by era: 3 Local → 6 County → 9 State → 12 Federal
- IDs: `far_left/center_left/center/center_right/far_right` (internal only; labels are clean)

**14 Interest-group blocs** (`config/blocs.ts`):
- Full roster with `shortName`, `lean`, `priorityIssues`, `primaryWeight`, `generalWeight`, `unlockOfficeIndex`
- Revealed progressively: 3 at City Council, +3 per office tier, all 14 at State Legislature
- ShortNames (final approved): Labor Unions, Environmentalists, Civil Rights, Teachers, Big Tech, Healthcare, Retirees, Suburbanites, Small Business, Farmers, Corporations, Public Safety, Religious, Developers
- Pool uses all 14 from day 1 (mechanics); UI reveal is display-only

**5 ideology designations** (`config/ideologies.ts`):
- Progressive, Liberal, Moderate, Conservative, Hard-liner
- Mirror-symmetric bloc modifiers (Pillar 5b: equally winnable)
- `getIdeology(position)` maps mean scalar → designation

**Platform sim** (`sim/platform.ts`):
- `computePosition(platform, era)` → mean scalar
- `computeAllBlocSupport(platform, trustMultipliers, groups, era)` → per-group multipliers
- `flipFlopCost(count)` → `BAL.flipFlopBaseCost × 2^(count−1)`, first promise free
- `trustAfterFlip(count)` → `max(0.3, 0.7^(count−1))` — policy effectiveness decays with flips
- `applyStanceChange(state, issueId, newStanceId, groups)` → returns null if unaffordable

**New GameState fields:**
- `flipFlopTrustMultipliers: Record<string, number>` — effectiveness per issue (1.0 decaying)
- `isPaused: boolean` — true while Promise modal open; `tick()` returns early
- `platform` now stores `StanceId` (`far_left | center_left | center | center_right | far_right`)

**Save version:** v4. Migration maps old `left→center_left`, `center→center`, `right→center_right`.

---

### Promise a Policy flow

**Platform tab** (`ui/PlatformTab.svelte`):
- Shows ideology badge + position bar + bloc support bars (no change)
- Issue cards default to "Promise a Policy →" when `flipFlopCounts[issueId] === 0`
- After promising, card shows policy title, axis label, trust/cost badges
- Tapping any card opens `PolicyModal` for that issue

**PolicyModal** (`ui/PolicyModal.svelte`) rendered in **`App.svelte`** (not inside PlatformTab):
- Two-step: issue list → 5 stance cards per issue
- Stance card shows: axis marker, label, title, description, `+ Bloc / – Bloc` effects (directional only)
- "Current" tag on active stance; confirm button shows cost if changing
- Game pauses on mount (`isPaused = true`), resumes on close
- Uses `position: absolute; inset: 0` scoped to `.app-shell` — NOT `position: fixed`

**UI store** (`state/uiStore.ts`): `policyModalIssueId` writable; `openPolicyModal(issueId)` / `closePolicyModal()`. PlatformTab calls the store; App.svelte renders the modal.

**`.app-shell` has `position: relative`** — required for the absolute modal overlay to scope correctly.

---

### UI density pass (same session)

All tabs compacted. Key values:

| Element | Before | After |
|---|---|---|
| Header padding | 10/14px | 6/12px |
| Progress bar | 14px | 9px |
| Stat value font | 1rem | 0.85rem |
| Tab bar padding | 10/4/8px | 7/4/5px |
| Knock button | 160px | 120px |
| Campaign padding | 16/14px | 10/12px |
| Generator row | 8/10px | 5/8px |
| Platform card | — | 5/8px padding, 0.56rem stance font |
| Support bars | 8px | 5px |

Each tab (`campaign-tab`, `operation-tab`, `platform-tab`) uses `position: absolute; inset: 0` (not `flex: 1`) so all tabs occupy the identical rectangle — eliminates height inconsistency when switching tabs.

---

### Other fixes in this session

- **Generator voter stealing bug** — `bestBloc` selection was negating rival total, causing generators to target blocs with 0 rival voters when undecided was exhausted. Fixed by removing negation.
- **Bloc short names** — see shortName list above. Approved by user.
- **Bloc reveal phased** — `unlockOfficeIndex` on each bloc; `blocsUnlockedForOffice()` filters display.
- **Bloc phase indicators removed** — stars and dimming removed. Fill speed naturally signals bloc size.
- **Platform card uniformity** — stance buttons use `white-space: nowrap; overflow: hidden` at 0.56rem; "Affordable-housing mandates" fits at this size.

---

## What's Next — Phase 4

Per Implementation Roadmap:
- Run reset on loss, Prestige banked ∝ elections won, global multiplier + perk tree, Legacy tab
- Roguelite re-traversal (re-gate content by office; fast replay)
- Milestones/unlocks and reward-bearing achievements
- **Done when:** losing feels like progress, restarts are faster, ~8–12-run curve toward President
