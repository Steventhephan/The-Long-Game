import { BAL } from '../config/balance';
import { ISSUES, issuesForEra } from '../config/issues';
import { getIdeology } from '../config/ideologies';
import type { GameState, InterestGroupDef, IdeologyDef, Era } from '../types';

// ---------------------------------------------------------------------------
// Position & ideology
// ---------------------------------------------------------------------------

export function computePosition(platform: Record<string, string>, currentEra: Era): number {
  const unlocked = issuesForEra(currentEra);
  if (unlocked.length === 0) return 0;

  let sum = 0;
  let count = 0;
  for (const issue of unlocked) {
    const stanceId = platform[issue.id] ?? 'center';
    const stance = issue.stances.find(s => s.id === stanceId) ?? issue.stances[2]; // default center
    sum += stance.scalar;
    count++;
  }
  return sum / count;
}

export { getIdeology };

// ---------------------------------------------------------------------------
// Bloc support
// ---------------------------------------------------------------------------

export function computeGroupSupport(
  groupId: string,
  priorityIssues: InterestGroupDef['priorityIssues'],
  platform: Record<string, string>,
  trustMultipliers: Record<string, number>,
  ideology: IdeologyDef,
  currentEra: Era,
): number {
  const unlockedEraIds = new Set(issuesForEra(currentEra).map(i => i.id));
  const active = priorityIssues.filter(p => unlockedEraIds.has(p.issueId));

  let base: number;
  if (active.length === 0) {
    base = 1.0; // neutral when no active priority issues
  } else {
    let totalScore = 0;
    for (const priority of active) {
      const stanceId = platform[priority.issueId] ?? 'center';
      const issue = ISSUES.find(i => i.id === priority.issueId);
      const playerScalar = issue?.stances.find(s => s.id === stanceId)?.scalar ?? 0;
      // Alignment: 1.0 = perfect match, 0.5 = one is center, 0.0 = opposite
      const alignment = (playerScalar * priority.preferredScalar + 1) / 2;
      // Apply flip-flop trust multiplier for this issue
      const trust = trustMultipliers[priority.issueId] ?? 1.0;
      totalScore += alignment * trust;
    }
    const avgScore = totalScore / active.length;
    base = BAL.blocSupportMin + avgScore * (BAL.blocSupportMax - BAL.blocSupportMin);
  }

  const modifier = ideology.blocModifiers[groupId] ?? 0;
  const modified = base * (1 + modifier);
  return Math.max(BAL.blocSupportMin, Math.min(BAL.blocSupportMax, modified));
}

export function computeAllBlocSupport(
  platform: Record<string, string>,
  trustMultipliers: Record<string, number>,
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
      trustMultipliers,
      ideology,
      currentEra,
    );
  }
  return result;
}

// ---------------------------------------------------------------------------
// Flip-flop cost & trust erosion
// ---------------------------------------------------------------------------

/**
 * Cash cost to change a stance on an issue.
 * flipCount = number of previous changes on this issue.
 * First promise (count=0) is free. Each subsequent change costs more.
 */
export function flipFlopCost(flipCount: number): number {
  if (flipCount === 0) return 0;
  return BAL.flipFlopBaseCost * (BAL.flipFlopCostGrowth ** (flipCount - 1));
}

/**
 * Trust multiplier on a policy's effectiveness after N total changes.
 * First promise: 1.0 (full trust). Each flip erodes it.
 * count = new flipFlopCount AFTER this change.
 */
export function trustAfterFlip(count: number): number {
  // count=1 → first promise (free, full trust)
  // count=2 → first flip (paid, trust erodes to 0.7)
  // count=3 → second flip (trust = 0.49)
  const erosions = Math.max(0, count - 1);
  return Math.max(0.3, BAL.flipFlopTrustErosion ** erosions);
}

// ---------------------------------------------------------------------------
// Era helper
// ---------------------------------------------------------------------------

export function eraForOffice(officeIndex: number): Era {
  if (officeIndex <= 1) return 'local';
  if (officeIndex <= 3) return 'county';
  if (officeIndex <= 5) return 'state';
  return 'federal';
}

// ---------------------------------------------------------------------------
// Apply a stance change (returns new state or null if unaffordable)
// ---------------------------------------------------------------------------

export function applyStanceChange(
  state: GameState,
  issueId: string,
  newStanceId: string,
  groups: InterestGroupDef[],
): GameState | null {
  if (state.platform[issueId] === newStanceId) return state;

  const count = state.flipFlopCounts[issueId] ?? 0;
  const cost = flipFlopCost(count);

  if (state.cash < cost) return null;

  const newPlatform = { ...state.platform, [issueId]: newStanceId };
  const newCount = count + 1;
  const newFlipFlopCounts = { ...state.flipFlopCounts, [issueId]: newCount };
  const newTrustMultipliers = {
    ...state.flipFlopTrustMultipliers,
    [issueId]: trustAfterFlip(newCount),
  };
  const era = eraForOffice(state.officeIndex);
  const position = computePosition(newPlatform, era);
  const ideology = getIdeology(position);
  const newBlocSupport = computeAllBlocSupport(newPlatform, newTrustMultipliers, groups, era);

  return {
    ...state,
    cash: state.cash - cost,
    platform: newPlatform,
    flipFlopCounts: newFlipFlopCounts,
    flipFlopTrustMultipliers: newTrustMultipliers,
    ideologyId: ideology.id,
    blocSupport: newBlocSupport,
  };
}
