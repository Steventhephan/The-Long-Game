<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { gameStore, formatNum } from '../state/store';
  import { saveGame } from '../persist/autosave';
  import { INTEREST_GROUPS } from '../config/blocs';
  import { issuesForEra } from '../config/issues';
  import { applyStanceChange, flipFlopCost, eraForOffice } from '../sim/platform';
  import type { IssueDef, StanceDef } from '../types';

  const dispatch = createEventDispatcher<{ close: void }>();

  // Optional: open directly on a specific issue
  export let initialIssueId: string | null = null;

  $: state = $gameStore;
  $: era = eraForOffice(state.officeIndex);
  $: unlockedIssues = issuesForEra(era);

  // Step 1: issue selection; Step 2: stance selection
  let selectedIssue: IssueDef | null = null;
  let selectedStance: StanceDef | null = null;

  onMount(() => {
    gameStore.update(s => ({ ...s, isPaused: true }));
    if (initialIssueId) {
      selectedIssue = unlockedIssues.find(i => i.id === initialIssueId) ?? null;
    }
  });

  onDestroy(() => {
    gameStore.update(s => ({ ...s, isPaused: false }));
  });

  function close() {
    dispatch('close');
  }

  function selectIssue(issue: IssueDef) {
    selectedIssue = issue;
    selectedStance = null;
  }

  function back() {
    if (selectedIssue) { selectedIssue = null; selectedStance = null; }
    else close();
  }

  function confirmStance() {
    if (!selectedIssue || !selectedStance) return;
    const next = applyStanceChange(state, selectedIssue.id, selectedStance.id, INTEREST_GROUPS);
    if (next) {
      gameStore.set(next);
      saveGame(next);
    }
    close();
  }

  function stanceAxisPct(scalar: number): number {
    return ((scalar + 1) / 2) * 100;
  }

  function axisColor(scalar: number): string {
    if (scalar <= -0.6) return '#4a9eff';
    if (scalar <= -0.1) return '#4ab8b0';
    if (scalar <   0.1) return '#c8a44a';
    if (scalar <   0.6) return '#e8944a';
    return '#e74c3c';
  }

  $: currentStanceId = selectedIssue ? (state.platform[selectedIssue.id] ?? 'center') : null;
  $: flipCount = selectedIssue ? (state.flipFlopCounts[selectedIssue.id] ?? 0) : 0;
  $: changeCost = flipFlopCost(flipCount);
  $: canAfford = state.cash >= changeCost;
  $: isCurrentStance = selectedIssue && selectedStance
    ? state.platform[selectedIssue.id] === selectedStance.id
    : false;
</script>

<div class="modal-overlay" role="dialog" aria-modal="true">
  <div class="modal">

    <!-- Header -->
    <div class="modal-header">
      <span class="modal-title">
        {#if selectedIssue}{selectedIssue.name}{:else}Promise a Policy{/if}
      </span>
      <button class="close-btn" on:click={close}>✕</button>
    </div>

    <!-- Step 1: Issue list -->
    {#if !selectedIssue}
      <div class="issue-list">
        {#each unlockedIssues as issue}
          {@const currentId = state.platform[issue.id] ?? 'center'}
          {@const currentStance = issue.stances.find(s => s.id === currentId)}
          {@const fCount = state.flipFlopCounts[issue.id] ?? 0}
          {@const trust = state.flipFlopTrustMultipliers[issue.id] ?? 1.0}
          <button class="issue-row" on:click={() => selectIssue(issue)}>
            <div class="issue-row-info">
              <span class="issue-row-name">{issue.name}</span>
              {#if currentId !== 'center' || fCount > 0}
                <span class="issue-row-stance">{currentStance?.title ?? '—'}</span>
              {:else}
                <span class="issue-row-unpromised">Not promised</span>
              {/if}
              {#if trust < 1.0}
                <span class="trust-tag">Trust: {Math.round(trust * 100)}%</span>
              {/if}
            </div>
            <div class="issue-row-axis">
              {#each issue.stances as s}
                <div class="axis-dot" class:active={s.id === currentId} style="background:{axisColor(s.scalar)}"></div>
              {/each}
            </div>
            <span class="chevron">›</span>
          </button>
        {/each}
      </div>

    <!-- Step 2: Stance cards -->
    {:else}
      {#if flipCount > 0}
        <div class="flip-warning">
          {#if changeCost > 0}
            Changing costs <strong>${formatNum(changeCost)}</strong>
            {#if !canAfford}&nbsp;— not enough cash{/if}
            {#if (state.flipFlopTrustMultipliers[selectedIssue.id] ?? 1) < 1}
        · Repeated flip-flops erode bloc trust — making this policy weaker at converting voters.
      {/if}
          {:else}
            Setting your first position — free
          {/if}
        </div>
      {/if}

      <div class="stance-list">
        {#each selectedIssue.stances as stance}
          {@const isSelected = selectedStance?.id === stance.id}
          {@const isCurrent = currentStanceId === stance.id}
          <button
            class="stance-card"
            class:selected={isSelected}
            class:current={isCurrent}
            on:click={() => selectedStance = stance}
          >
            <div class="stance-axis-row">
              <div class="stance-axis">
                <div class="stance-marker" style="left:{stanceAxisPct(stance.scalar)}%; background:{axisColor(stance.scalar)}"></div>
              </div>
              <span class="stance-label-tag" style="color:{axisColor(stance.scalar)}">{stance.label}</span>
              {#if isCurrent}<span class="current-tag">Current</span>{/if}
            </div>
            <div class="stance-title">{stance.title}</div>
            <div class="stance-description">{stance.description}</div>
          </button>
        {/each}
      </div>

      <div class="confirm-row">
        <button
          class="confirm-btn"
          disabled={!selectedStance || isCurrentStance || !canAfford}
          on:click={confirmStance}
        >
          {#if !selectedStance}
            Select a position
          {:else if isCurrentStance}
            Already your position
          {:else if !canAfford}
            Can't afford (${formatNum(changeCost)})
          {:else if changeCost > 0}
            Promise · Pay ${formatNum(changeCost)}
          {:else}
            Promise This Position
          {/if}
        </button>
      </div>
    {/if}

  </div>
</div>

<style>
  .modal-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.8);
    display: flex; align-items: flex-end; justify-content: center;
    z-index: 200;
    animation: fade-in 0.15s ease;
  }
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

  .modal {
    background: #150F0A;
    border: 1px solid #2E2218;
    border-radius: 14px 14px 0 0;
    width: 100%; max-width: 480px;
    max-height: 88vh;
    display: flex; flex-direction: column;
    overflow: hidden;
    will-change: transform;
    animation: slide-up 0.2s cubic-bezier(0.34,1.2,0.64,1);
  }
  @keyframes slide-up {
    from { transform: translateY(60px); opacity: 0.6; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  /* Header */
  .modal-header {
    position: relative;
    display: flex; align-items: center;
    padding: 10px 12px 8px;
    border-bottom: 1px solid #2E2218;
    flex-shrink: 0;
  }
  .modal-title { flex: 1; font-size: 0.78rem; font-weight: bold; color: #f0ece4; text-align: center; }
  .close-btn {
    position: absolute; right: 12px;
    background: transparent; border: none; color: #888;
    font-size: 0.75rem; font-family: inherit; cursor: pointer; padding: 2px 4px;
  }

  /* Flip warning */
  .flip-warning {
    font-size: 0.65rem; color: #e8944a;
    padding: 5px 12px; background: #1a1208;
    border-bottom: 1px solid #3a2a10; flex-shrink: 0;
  }
  .flip-warning strong { color: #f1c40f; }

  /* Issue list */
  .issue-list {
    overflow-y: auto; overflow-x: hidden; flex: 1;
    display: flex; flex-direction: column;
  }
  .issue-row {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 12px;
    border: none; border-bottom: 1px solid #201912;
    background: transparent; cursor: pointer; text-align: left;
    transition: background 0.1s;
  }
  .issue-row:active { background: #201912; }
  .issue-row-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .issue-row-name { font-size: 0.75rem; color: #f0ece4; font-weight: bold; }
  .issue-row-stance { font-size: 0.62rem; color: #4a9eff; }
  .issue-row-unpromised { font-size: 0.62rem; color: #555; font-style: italic; }
  .trust-tag { font-size: 0.58rem; color: #e8944a; }
  .issue-row-axis { display: flex; gap: 3px; align-items: center; flex-shrink: 0; }
  .axis-dot {
    width: 6px; height: 6px; border-radius: 50%; opacity: 0.35;
    transition: opacity 0.1s;
  }
  .axis-dot.active { opacity: 1; transform: scale(1.3); }
  .chevron { font-size: 1rem; color: #444; flex-shrink: 0; }

  /* Stance cards */
  .stance-list {
    overflow-y: auto; overflow-x: hidden; flex: 1;
    padding: 8px 10px;
    display: flex; flex-direction: column; gap: 7px;
  }
  .stance-card {
    background: #1C1510; border: 1px solid #2E2218;
    border-radius: 8px; padding: 9px 11px;
    text-align: left; cursor: pointer; font-family: inherit;
    display: flex; flex-direction: column; gap: 5px;
    transition: border-color 0.1s, background 0.1s;
  }
  .stance-card:active { background: #1e2a3e; }
  .stance-card.selected { border-color: #4a9eff; background: #1a2a3e; }
  .stance-card.current  { border-color: #c8a44a; }

  .stance-axis-row { display: flex; align-items: center; gap: 8px; }
  .stance-axis {
    position: relative; flex: 1; height: 5px;
    background: #2E2218; border-radius: 3px; overflow: visible;
  }
  .stance-marker {
    position: absolute; top: -2px;
    width: 9px; height: 9px; border-radius: 50%;
    transform: translateX(-50%);
    border: 1px solid #000;
  }
  .stance-label-tag { font-size: 0.6rem; color: #aaa; white-space: nowrap; flex-shrink: 0; }
  .current-tag {
    font-size: 0.56rem; padding: 1px 5px;
    background: #2a2510; border: 1px solid #c8a44a;
    border-radius: 3px; color: #c8a44a; flex-shrink: 0;
  }

  .stance-title { font-size: 0.78rem; font-weight: bold; color: #f0ece4; }
  .stance-description { font-size: 0.65rem; color: #999; line-height: 1.4; }

  /* Confirm */
  .confirm-row {
    padding: 10px 12px;
    border-top: 1px solid #2E2218;
    flex-shrink: 0;
  }
  .confirm-btn {
    width: 100%; padding: 10px;
    border-radius: 6px; border: none;
    background: #4a9eff; color: #fff;
    font-family: inherit; font-size: 0.8rem; font-weight: bold;
    cursor: pointer; transition: opacity 0.1s;
  }
  .confirm-btn:disabled { background: #2E2218; color: #555; cursor: not-allowed; }
  .confirm-btn:not(:disabled):active { opacity: 0.85; }
</style>
