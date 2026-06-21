<script lang="ts">
  import { gameStore } from '../state/store';
  import { saveGame } from '../persist/autosave';
  import { applyMinigameChoice } from '../state/gameState';
  import { getMinigame } from '../config/minigames';
  import { INTEREST_GROUPS } from '../config/blocs';
  import type { MinigameDef } from '../types';

  $: state = $gameStore;
  $: minigame = state.pendingMinigame ? getMinigame(state.pendingMinigame) : null;

  // Track which choice the player has highlighted before confirming.
  // Reset only when the minigame ID changes, not on every state tick.
  let selectedChoice: string | null = null;
  let _lastMinigameId: string | null = null;
  $: if (state.pendingMinigame !== _lastMinigameId) {
    _lastMinigameId = state.pendingMinigame;
    selectedChoice = null;
  }

  function onSelect(choiceId: string) { selectedChoice = choiceId; }

  function onConfirm() {
    if (!minigame || !selectedChoice) return;
    const next = applyMinigameChoice(state, minigame.id, selectedChoice);
    gameStore.set(next);
    saveGame(next);
    selectedChoice = null;
  }

  function typeBadge(type: MinigameDef['type']): string {
    if (type === 'debate') return 'Debate';
    if (type === 'town_hall') return 'Town Hall';
    return 'Fundraising Gala';
  }

  function typeIcon(type: MinigameDef['type']): string {
    if (type === 'debate') return '🎙';
    if (type === 'town_hall') return '🏛';
    return '🥂';
  }

  function effectSummary(choiceId: string): string {
    if (!minigame) return '';
    const choice = minigame.choices.find(c => c.id === choiceId);
    if (!choice) return '';
    const parts: string[] = [];
    for (const e of choice.effects) {
      if (e.kind === 'charisma' && e.delta !== 0)
        parts.push(`${e.delta > 0 ? '+' : ''}${e.delta} Charisma`);
      if (e.kind === 'cash' && e.amount !== 0)
        parts.push(`${e.amount > 0 ? '+$' : '-$'}${Math.abs(e.amount).toLocaleString()}`);
      if (e.kind === 'blocSupport') {
        const bloc = INTEREST_GROUPS.find(g => g.groupId === e.groupId);
        const name = bloc?.shortName ?? e.groupId.replace(/_/g, ' ');
        parts.push(`${e.delta > 0 ? '+' : ''}${e.delta.toFixed(1)} ${name}`);
      }
      if (e.kind === 'stanceCommit')
        parts.push(`Sets ${e.issueId.replace(/_/g, ' ')} stance`);
    }
    return parts.join(' · ');
  }
</script>

{#if minigame}
  <div class="modal-overlay" role="dialog" aria-modal="true">
    <div class="modal">

      <!-- Header -->
      <div class="modal-header">
        <span class="type-badge">{typeIcon(minigame.type)} {typeBadge(minigame.type)}</span>
        <span class="modal-title">{minigame.title}</span>
      </div>

      <!-- Prompt -->
      <div class="prompt-section">
        <p class="prompt-text">{minigame.prompt}</p>
      </div>

      <!-- Choices -->
      <div class="choice-list">
        {#each minigame.choices as choice}
          {@const isSelected = selectedChoice === choice.id}
          <button
            class="choice-card"
            class:selected={isSelected}
            on:click={() => onSelect(choice.id)}
          >
            <div class="choice-text">{choice.text}</div>
            {#if isSelected}
              <div class="choice-effects">{effectSummary(choice.id)}</div>
            {/if}
          </button>
        {/each}
      </div>

      <!-- Confirm -->
      <div class="confirm-row">
        <button
          class="confirm-btn"
          disabled={!selectedChoice}
          on:click={onConfirm}
        >
          {selectedChoice ? 'Commit to this position →' : 'Pick a response above'}
        </button>
      </div>


    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.85);
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

  .modal-header {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px 8px;
    border-bottom: 1px solid #2E2218;
    flex-shrink: 0;
  }
  .type-badge {
    font-size: 0.65rem; color: #c8a44a;
    background: #2a2510; border: 1px solid #c8a44a44;
    border-radius: 4px; padding: 2px 7px;
    flex-shrink: 0;
  }
  .modal-title {
    font-size: 0.75rem; font-weight: bold; color: #f0ece4;
  }

  .prompt-section {
    padding: 10px 14px 6px;
    flex-shrink: 0;
    border-bottom: 1px solid #201912;
  }
  .prompt-text {
    font-size: 0.72rem; color: #c8c4bc; line-height: 1.5;
    margin: 0; font-style: italic;
  }

  .choice-list {
    overflow-y: auto; flex: 1;
    padding: 8px 10px;
    display: flex; flex-direction: column; gap: 6px;
  }

  .choice-card {
    background: #1C1510; border: 1px solid #2E2218;
    border-radius: 8px; padding: 10px 12px;
    text-align: left; cursor: pointer; font-family: inherit;
    display: flex; flex-direction: column; gap: 4px;
    transition: border-color 0.1s, background 0.1s;
  }
  .choice-card:active { background: #1e2a3e; }
  .choice-card.selected { border-color: #c8a44a; background: #201912; }

  .choice-text {
    font-size: 0.72rem; color: #f0ece4; line-height: 1.4;
  }
  .choice-effects {
    font-size: 0.6rem; color: #c8a44a;
    border-top: 1px solid #2E2218; padding-top: 4px; margin-top: 2px;
  }

  .confirm-row {
    padding: 10px 14px;
    border-top: 1px solid #2E2218;
    flex-shrink: 0;
  }
  .confirm-btn {
    width: 100%; padding: 10px;
    border-radius: 6px; border: none;
    background: #c8a44a; color: #13131f;
    font-family: inherit; font-size: 0.8rem; font-weight: bold;
    cursor: pointer; transition: opacity 0.1s;
  }
  .confirm-btn:disabled { background: #2E2218; color: #555; cursor: not-allowed; }
  .confirm-btn:not(:disabled):active { opacity: 0.85; }
</style>
