import { BAL } from '../config/balance';
import { ISSUES, issuesForEra } from '../config/issues';
import { getIdeology } from '../config/ideologies';
import type { GameState, InterestGroupDef, IdeologyDef, Era } from '../types';

// ---------------------------------------------------------------------------
// Position & ideology
// ---------------------------------------------------------------------------

/** Mean of all chosen stance scalars across currently-unlocked issues. */
export function computePosition(platform: Record<string, string>, currentEra: Era): number {
  const unlocked = issuesForEra(currentEra);
  if (unlocked.length === 0) return 0;

  let sum = 0;
  let count = 0;
  for (const issue of unlocked) {
    const stanceId = platform[issue.id] ?? 'center';
    const stance = issue.stances.find(s => s.id === stanceId) ?? issue.stances[1];
    sum += stance.scalar;
    count++;
  }
  return sum / count;
}

export { getIdeology };

// ---------------------------------------------------------------------------
// Bloc support
// ---------------------------------------------------------------------------

/**
 * Compute the support multiplier for a single group based on:
 *   1. How well the player's platform aligns with the group's priority issues
 *   2. The ideology modifier for that group
 *
 * Result is clamped to [blocSupportMin, blocSupportMax].
 */
export function computeGroupSupport(
  groupId: string,
  priorityIssues: InterestGroupDef['priorityIssues'],
  platform: Record<string, string>,
  ideology: IdeologyDef,
  currentEra: Era,
): number {
  const unlockedEraIds = new Set(issuesForEra(currentEra).map(i => i.id));

  // Filter to priority issues that are currently unlocked.
  const active = priorityIssues.filter(p => unlockedEraIds.has(p.issueId));

  let base: number;
  if (active.length === 0) {
    // No active priority issues for this group yet — neutral support.
    base = 1.0;
  } else {
    let totalScore = 0;
    for (const priority of active) {
      const stanceId = platform[priority.issueId] ?? 'center';
      const issue = ISSUES.find(i => i.id === priority.issueId);
      const playerScalar = issue?.stances.find(s => s.id === stanceId)?.scalar ?? 0;
      // Alignment: 1.0 = perfect match, 0.5 = one is center, 0.0 = opposite
      const alignment = (playerScalar * priority.preferredScalar + 1) / 2;
      totalScore += alignment;
    }
    const avgAlignment = totalScore / active.length; // 0..1
    // Map to support range: 0.5 (hostile) → 3.0 (champion)
    base = BAL.blocSupportMin + avgAlignment * (BAL.blocSupportMax - BAL.blocSupportMin);
  }

  // Apply ideology modifier.
  const modifier = ideology.blocModifiers[groupId] ?? 0;
  const modified = base * (1 + modifier);
  return Math.max(BAL.blocSupportMin, Math.min(BAL.blocSupportMax, modified));
}

/** Recompute blocSupport for all 14 groups. */
export function computeAllBlocSupport(
  platform: Record<string, string>,
  groups: InterestGroupDef[],
  currentEra: Era,
): Record<string, number> {
  const position = computePosition(platform, currentEra);
  const ideology = getIdeology(position);
  const result: Record<string, number> = {};
  for (const group of groups) {
    result[group.groupId] = computeGroupSupport(
      group.groupId,
      group.priorityIssues,
      platform,
      ideology,
      currentEra,
    );
  }
  return result;
}

// ---------------------------------------------------------------------------
// Flip-flop cost
// ---------------------------------------------------------------------------

/**
 * Cash cost to change a stance. First change on an issue is free
 * (setting initial position); each subsequent change costs more.
 * flipCount = number of previous changes on this issue.
 */
export function flipFlopCost(flipCount: number): number {
  if (flipCount === 0) return 0; // first pick is free
  // 1st flip: baseCost, 2nd: baseCost×2, 3rd: baseCost×4, …
  return BAL.flipFlopBaseCost * BAL.flipFlopCostGrowth ** (flipCount - 1);
}

// ---------------------------------------------------------------------------
// Derived era from office index
// ---------------------------------------------------------------------------

export function eraForOffice(officeIndex: number): Era {
  if (officeIndex <= 1) return 'local';
  if (officeIndex <= 3) return 'county';
  if (officeIndex <= 5) return 'state';
  return 'federal';
}

// ---------------------------------------------------------------------------
// Apply a stance change to GameState (returns new state or null if unaffordable)
// ---------------------------------------------------------------------------

export function applyStanceChange(
  state: GameState,
  issueId: string,
  newStanceId: 'left' | 'center' | 'right',
  groups: InterestGroupDef[],
): GameState | null {
  if (state.platform[issueId] === newStanceId) return state; // no change

  const count = state.flipFlopCounts[issueId] ?? 0;
  const cost = flipFlopCost(count);

  if (state.cash < cost) return null; // can't afford

  const newPlatform = { ...state.platform, [issueId]: newStanceId };
  const newFlipFlopCounts = { ...state.flipFlopCounts, [issueId]: count + 1 };
  const era = eraForOffice(state.officeIndex);
  const position = computePosition(newPlatform, era);
  const ideology = getIdeology(position);
  const newBlocSupport = computeAllBlocSupport(newPlatform, groups, era);

  return {
    ...state,
    cash: state.cash - cost,
    platform: newPlatform,
    flipFlopCounts: newFlipFlopCounts,
    ideologyId: ideology.id,
    blocSupport: newBlocSupport,
  };
}
