<script lang="ts">
  import { gameStore } from '../state/store';
  import { buyPerk } from '../state/gameState';
  import { saveGame } from '../persist/autosave';
  import { PERKS } from '../config/perks';
  import { ACHIEVEMENTS } from '../config/achievements';
  import { prestigeLabel, computePrestigeGain } from '../sim/prestige';
  import type { PerkDef } from '../types';

  $: state = $gameStore;
  $: prestige = state.prestige;
  $: perks = state.perks;
  $: runHistory = state.runHistory ?? [];
  $: highestOffice = state.highestOfficeCompleted ?? -1;
  $: label = prestigeLabel(prestige);
  $: preview = computePrestigeGain(state, false);

  // Sort perks: available → owned → locked
  $: sortedPerks = [...PERKS].sort((a, b) => {
    const aOwned = perks.includes(a.id);
    const bOwned = perks.includes(b.id);
    const aAvail = !aOwned && prestige >= a.cost && a.prereqs.every(p => perks.includes(p));
    const bAvail = !bOwned && prestige >= b.cost && b.prereqs.every(p => perks.includes(p));
    if (aOwned !== bOwned) return aOwned ? 1 : -1;  // owned last
    if (aAvail !== bAvail) return aAvail ? -1 : 1;  // available first
    return 0;
  });

  function perkStatus(perk: PerkDef): 'owned' | 'available' | 'prereq' | 'locked' {
    if (perks.includes(perk.id)) return 'owned';
    const prereqsMet = perk.prereqs.every(p => perks.includes(p));
    if (!prereqsMet) return 'prereq';
    if (prestige >= perk.cost) return 'available';
    return 'locked';
  }

  function onBuyPerk(perkId: string) {
    const next = buyPerk(state, perkId);
    if (!next) return;
    gameStore.set(next);
    saveGame(next);
  }

  // Achievements
  $: unlockedAchieves = ACHIEVEMENTS.filter(a => state.achievements.includes(a.id));
  $: lockedAchieves = ACHIEVEMENTS.filter(a => !state.achievements.includes(a.id));
</script>

<div class="legacy-tab">

  <!-- Dynasty header -->
  <div class="dynasty-header">
    <div class="prestige-block">
      <div class="prestige-number">{prestige}</div>
      <div class="prestige-sub">Prestige · {label}</div>
    </div>
    {#if preview > 0}
      <div class="prestige-preview">
        <span class="preview-label">This run</span>
        <span class="preview-value">+{preview}</span>
      </div>
    {/if}
  </div>

  <!-- Perk tree -->
  <div class="section-header">Prestige Perks</div>
  <div class="perk-list">
    {#each sortedPerks as perk}
      {@const status = perkStatus(perk)}
      <div class="perk-row" class:owned={status === 'owned'} class:available={status === 'available'} class:locked={status === 'locked' || status === 'prereq'}>
        <div class="perk-meta">
          <div class="perk-name">{perk.name}</div>
          <div class="perk-desc">{perk.description}</div>
          {#if status === 'prereq'}
            <div class="perk-prereq">Requires: {perk.prereqs.join(', ').replace(/_/g, ' ')}</div>
          {/if}
        </div>
        {#if status === 'owned'}
          <span class="perk-badge owned">✓</span>
        {:else if status === 'available'}
          <button class="perk-btn" on:click={() => onBuyPerk(perk.id)}>
            {perk.cost} pt
          </button>
        {:else}
          <span class="perk-badge locked">{perk.cost} pt</span>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Achievements -->
  {#if unlockedAchieves.length > 0 || lockedAchieves.length > 0}
    <div class="section-header">Achievements</div>
    <div class="achieve-list">
      {#each unlockedAchieves as a}
        <div class="achieve-row unlocked">
          <span class="achieve-icon">★</span>
          <div class="achieve-meta">
            <span class="achieve-name">{a.name}</span>
            <span class="achieve-desc">{a.description}</span>
          </div>
        </div>
      {/each}
      {#each lockedAchieves as a}
        <div class="achieve-row locked">
          <span class="achieve-icon">☆</span>
          <div class="achieve-meta">
            <span class="achieve-name">{a.name}</span>
            <span class="achieve-desc">{a.description}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Run history -->
  {#if runHistory.length > 0}
    <div class="section-header">Run History</div>
    <div class="history-list">
      {#each [...runHistory].reverse() as run}
        <div class="history-row" class:victory={run.outcome === 'victory'}>
          <div class="history-meta">
            <span class="history-run">Run #{run.runNumber}</span>
            <span class="history-office">{run.officeName}</span>
          </div>
          <div class="history-stats">
            <span class="history-wins">{run.electionsWon}W</span>
            {#if run.prestigeEarned > 0}
              <span class="history-prestige">+{run.prestigeEarned}pt</span>
            {/if}
            {#if run.outcome === 'victory'}
              <span class="history-victory-badge">★</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

</div>

<style>
  .legacy-tab {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    padding: 8px 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* Dynasty header */
  .dynasty-header {
    background: #1a1a2e;
    border: 1px solid #c8a44a55;
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .prestige-number {
    font-size: 1.8rem;
    font-weight: bold;
    color: #c8a44a;
    line-height: 1;
  }
  .prestige-sub {
    font-size: 0.62rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 2px;
  }
  .prestige-preview {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
  }
  .preview-label {
    font-size: 0.55rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .preview-value {
    font-size: 0.9rem;
    color: #c8a44a88;
    font-weight: bold;
  }

  /* Section headers */
  .section-header {
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #c8a44a;
    border-top: 1px solid #2a2a3e;
    padding-top: 4px;
    margin-top: 2px;
  }

  /* Perk list */
  .perk-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .perk-row {
    background: #1e1e30;
    border: 1px solid #2a2a3e;
    border-radius: 5px;
    padding: 6px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    transition: border-color 0.15s, opacity 0.15s;
  }
  .perk-row.available {
    border-color: #c8a44a66;
    opacity: 1;
  }
  .perk-row.owned {
    opacity: 0.5;
    border-color: #2a2a3e;
  }
  .perk-row.locked {
    opacity: 0.4;
  }

  .perk-meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .perk-name {
    font-size: 0.78rem;
    color: #f0ece4;
    font-weight: 600;
  }
  .perk-desc {
    font-size: 0.62rem;
    color: #888;
    line-height: 1.3;
  }
  .perk-prereq {
    font-size: 0.56rem;
    color: #666;
    font-style: italic;
    text-transform: capitalize;
  }

  .perk-badge {
    font-size: 0.65rem;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .perk-badge.owned { color: #4a8a4a; }
  .perk-badge.locked { color: #555; }

  .perk-btn {
    background: #2a2510;
    border: 1px solid #c8a44a;
    color: #c8a44a;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.65rem;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: background 0.1s;
  }
  .perk-btn:active { background: #3a3518; }

  /* Achievements */
  .achieve-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .achieve-row {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 4px 6px;
    border-radius: 4px;
  }
  .achieve-row.unlocked { background: #1a1a2e; }
  .achieve-row.locked { opacity: 0.4; }
  .achieve-icon {
    font-size: 0.75rem;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .achieve-row.unlocked .achieve-icon { color: #c8a44a; }
  .achieve-row.locked .achieve-icon { color: #555; }
  .achieve-meta {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .achieve-name { font-size: 0.72rem; color: #f0ece4; font-weight: 600; }
  .achieve-desc { font-size: 0.6rem; color: #888; }

  /* Run history */
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .history-row {
    background: #1a1a2e;
    border: 1px solid #2a2a3e;
    border-radius: 4px;
    padding: 4px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .history-row.victory { border-color: #c8a44a55; }
  .history-meta {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .history-run { font-size: 0.6rem; color: #888; }
  .history-office { font-size: 0.72rem; color: #f0ece4; }
  .history-stats {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .history-wins { font-size: 0.65rem; color: #888; }
  .history-prestige { font-size: 0.65rem; color: #c8a44a; }
  .history-victory-badge { font-size: 0.75rem; color: #c8a44a; }
</style>
