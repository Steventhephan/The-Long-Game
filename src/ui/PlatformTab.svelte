<script lang="ts">
  import { gameStore, formatNum } from '../state/store';
  import { saveGame } from '../persist/autosave';
  import { INTEREST_GROUPS, blocsUnlockedForOffice } from '../config/blocs';
  import { IDEOLOGIES } from '../config/ideologies';
  import { issuesForEra } from '../config/issues';
  import { applyStanceChange, computePosition, flipFlopCost, eraForOffice, getIdeology } from '../sim/platform';

  $: state = $gameStore;
  $: era = eraForOffice(state.officeIndex);
  $: unlockedIssues = issuesForEra(era);
  $: unlockedBlocs = blocsUnlockedForOffice(state.officeIndex);
  $: position = computePosition(state.platform, era);
  $: ideology = getIdeology(position);

  // Position bar: map -1..+1 to 0..100%
  $: positionPct = ((position + 1) / 2) * 100;

  function ideologyColor(id: string): string {
    const colors: Record<string, string> = {
      progressive: '#4a9eff',
      liberal:     '#4ab8b0',
      moderate:    '#c8a44a',
      conservative:'#e8944a',
      hard_liner:  '#e74c3c',
    };
    return colors[id] ?? '#888';
  }

  function blocLeanColor(lean: number): string {
    if (lean < -0.6) return '#4a9eff';
    if (lean < -0.2) return '#4ab8b0';
    if (lean <=  0.2) return '#888';
    if (lean <=  0.6) return '#e8944a';
    return '#e74c3c';
  }

  // Stance change — show cost confirmation
  let pendingChange: { issueId: string; stanceId: 'left' | 'center' | 'right'; cost: number } | null = null;

  function onStanceClick(issueId: string, stanceId: 'left' | 'center' | 'right') {
    if (state.platform[issueId] === stanceId) return;
    const count = state.flipFlopCounts[issueId] ?? 0;
    const cost = flipFlopCost(count);

    if (cost === 0) {
      // First change: free, apply immediately
      const next = applyStanceChange(state, issueId, stanceId, INTEREST_GROUPS);
      if (next) { gameStore.set(next); saveGame(next); }
    } else {
      // Subsequent: show cost confirmation
      pendingChange = { issueId, stanceId, cost };
    }
  }

  function confirmChange() {
    if (!pendingChange) return;
    const next = applyStanceChange(state, pendingChange.issueId, pendingChange.stanceId, INTEREST_GROUPS);
    if (next) { gameStore.set(next); saveGame(next); }
    pendingChange = null;
  }

  function cancelChange() { pendingChange = null; }

  // Support bar: map 0.5..3.0 to 0..100%
  function supportPct(support: number): number {
    return ((support - 0.5) / 2.5) * 100;
  }
</script>

<div class="platform-tab">

  <!-- Ideology + position header -->
  <div class="ideology-header">
    <div class="ideology-badge" style="background: {ideologyColor(ideology.id)}20; border-color: {ideologyColor(ideology.id)}; color: {ideologyColor(ideology.id)}">
      {ideology.label}
    </div>
    <div class="position-wrap">
      <div class="axis-labels">
        <span>◀ Left</span>
        <span>Center</span>
        <span>Right ▶</span>
      </div>
      <div class="position-bar">
        {#each IDEOLOGIES as ideo}
          {@const left = ((ideo.axisMin + 1) / 2) * 100}
          {@const width = ((ideo.axisMax - ideo.axisMin) / 2) * 100}
          <div class="ideo-zone" style="left:{left}%; width:{width}%; background:{ideologyColor(ideo.id)}22"></div>
        {/each}
        <div class="pos-marker" style="left:{positionPct}%; background:{ideologyColor(ideology.id)}"></div>
        <div class="center-tick"></div>
      </div>
    </div>
  </div>

  <!-- Issue stances -->
  <div class="issues-section">
    <div class="section-label">Platform</div>
    {#each unlockedIssues as issue}
      {@const currentStance = state.platform[issue.id] ?? 'center'}
      {@const flipCount = state.flipFlopCounts[issue.id] ?? 0}
      <div class="issue-card">
        <div class="issue-name">{issue.name}</div>
        <div class="stance-buttons">
          {#each issue.stances as stance}
            {@const isActive = currentStance === stance.id}
            {@const isPending = pendingChange?.issueId === issue.id && pendingChange?.stanceId === stance.id}
            {@const costIfChanging = isActive ? 0 : flipFlopCost(flipCount)}
            <button
              class="stance-btn"
              class:active={isActive}
              class:pending={isPending}
              on:click={() => onStanceClick(issue.id, stance.id)}
              title={!isActive && costIfChanging > 0 ? `Costs $${formatNum(costIfChanging)} to change` : ''}
            >
              <span class="stance-label">{stance.label}</span>
              {#if !isActive && costIfChanging > 0}
                <span class="flip-cost">⚠ ${formatNum(costIfChanging)}</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <!-- Bloc support -->
  <div class="blocs-section">
    <div class="section-label">Coalition Support</div>
    {#each unlockedBlocs as group}
      {@const support = state.blocSupport[group.groupId] ?? 1.0}
      {@const pct = supportPct(support)}
      {@const color = blocLeanColor(group.lean)}
      <div class="bloc-row">
        <span class="bloc-name" title={group.name}>{group.shortName}</span>
        <div class="support-bar-wrap">
          <div class="support-bar">
            <div class="support-fill" style="width:{pct}%; background:{color}"></div>
            <div class="neutral-tick"></div>
          </div>
        </div>
        <span class="support-val" style="color:{color}">{support.toFixed(2)}×</span>
      </div>
    {/each}
  </div>

</div>

<!-- Flip-flop confirmation overlay -->
{#if pendingChange}
  <div class="confirm-overlay" role="dialog" aria-modal="true">
    <div class="confirm-card">
      <p class="confirm-title">Change position?</p>
      <p class="confirm-body">This costs <strong>${formatNum(pendingChange.cost)}</strong> — shifting positions erodes trust.</p>
      <div class="confirm-btns">
        <button class="confirm-btn cancel" on:click={cancelChange}>Cancel</button>
        <button
          class="confirm-btn proceed"
          disabled={state.cash < pendingChange.cost}
          on:click={confirmChange}
        >{state.cash < pendingChange.cost ? 'Not enough cash' : `Pay $${formatNum(pendingChange.cost)}`}</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .platform-tab {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Ideology header */
  .ideology-header {
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .ideology-badge {
    align-self: flex-start;
    font-size: 0.8rem;
    font-weight: bold;
    letter-spacing: 0.08em;
    padding: 3px 10px;
    border-radius: 12px;
    border: 1px solid;
  }
  .position-wrap { display: flex; flex-direction: column; gap: 3px; }
  .axis-labels { display: flex; justify-content: space-between; font-size: 0.6rem; color: #666; }
  .position-bar {
    position: relative;
    height: 12px;
    background: #2a2a3e;
    border-radius: 6px;
    overflow: hidden;
  }
  .ideo-zone { position: absolute; top: 0; height: 100%; }
  .center-tick { position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: rgba(255,255,255,0.25); }
  .pos-marker {
    position: absolute;
    top: 1px; bottom: 1px;
    width: 6px;
    border-radius: 3px;
    transform: translateX(-50%);
    transition: left 0.3s ease;
  }

  /* Issues */
  .issues-section { display: flex; flex-direction: column; gap: 8px; }
  .section-label {
    font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em;
    color: #c8a44a; border-top: 1px solid #2a2a3e; padding-top: 4px;
  }
  .issue-card {
    background: #1e1e30;
    border: 1px solid #2a2a3e;
    border-radius: 6px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .issue-name { font-size: 0.82rem; color: #f0ece4; font-weight: bold; }
  .stance-buttons { display: flex; gap: 4px; }
  .stance-btn {
    flex: 1;
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
    border-radius: 4px;
    padding: 5px 4px;
    font-size: 0.62rem;
    font-family: inherit;
    color: #888;
    cursor: pointer;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    transition: background 0.1s, border-color 0.1s, color 0.1s;
    line-height: 1.3;
  }
  .stance-btn:hover:not(.active) { border-color: #4a4a6a; color: #ccc; }
  .stance-btn.active {
    background: #2a3a5a;
    border-color: #4a9eff;
    color: #f0ece4;
    font-weight: bold;
  }
  .stance-label { font-size: 0.62rem; }
  .flip-cost { font-size: 0.58rem; color: #e8944a; }

  /* Bloc support */
  .blocs-section { display: flex; flex-direction: column; gap: 5px; }
  .bloc-row { display: flex; align-items: center; gap: 6px; }
  .bloc-name {
    font-size: 0.65rem;
    color: #aaa;
    width: 110px;
    min-width: 110px;
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .support-bar-wrap { flex: 1; }
  .support-bar {
    position: relative;
    height: 8px;
    background: #2a2a3e;
    border-radius: 4px;
    overflow: hidden;
  }
  .support-fill { height: 100%; transition: width 0.3s; border-radius: 4px; opacity: 0.8; }
  .neutral-tick { position: absolute; left: 20%; top: 0; bottom: 0; width: 1px; background: rgba(255,255,255,0.2); }
  .support-val { font-size: 0.65rem; min-width: 36px; text-align: right; font-weight: bold; }

  /* Flip-flop confirm overlay */
  .confirm-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    z-index: 200;
  }
  .confirm-card {
    background: #1a1a2e;
    border: 1px solid #e8944a;
    border-radius: 10px;
    padding: 20px;
    max-width: 280px;
    width: 90%;
    display: flex; flex-direction: column; gap: 12px;
    animation: pop-in 0.2s ease;
  }
  @keyframes pop-in {
    from { transform: scale(0.85); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
  }
  .confirm-title { font-size: 1rem; font-weight: bold; color: #f0ece4; }
  .confirm-body  { font-size: 0.82rem; color: #aaa; line-height: 1.4; }
  .confirm-body strong { color: #e8944a; }
  .confirm-btns { display: flex; gap: 8px; }
  .confirm-btn {
    flex: 1; padding: 8px; border-radius: 5px; font-family: inherit;
    font-size: 0.8rem; cursor: pointer; border: none;
  }
  .confirm-btn.cancel  { background: #2a2a3e; color: #aaa; }
  .confirm-btn.proceed { background: #e8944a; color: #fff; }
  .confirm-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
