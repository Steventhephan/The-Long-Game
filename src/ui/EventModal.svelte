<script lang="ts">
  import { gameStore } from '../state/store';
  import { saveGame } from '../persist/autosave';
  import { resolveEvent } from '../state/gameState';
  import { getEvent } from '../config/events';

  $: state = $gameStore;
  $: event = state.activeEvent ? getEvent(state.activeEvent.eventId) : null;

  let selectedChoice: string | null = null;
  let _lastEventId: string | null = null;
  $: if (state.activeEvent?.eventId !== _lastEventId) {
    _lastEventId = state.activeEvent?.eventId ?? null;
    selectedChoice = null;
  }

  function onSelect(choiceId: string) { selectedChoice = choiceId; }

  function onConfirm() {
    if (!event || !state.activeEvent || !selectedChoice) return;
    const next = resolveEvent(state, state.activeEvent.eventId, selectedChoice);
    gameStore.set(next);
    saveGame(next);
    selectedChoice = null;
  }

  function valenceColor(valence: string): string {
    if (valence === 'positive') return '#4a8a4a';
    if (valence === 'negative') return '#c0392b';
    return '#c8a44a';
  }

  function valenceLabel(valence: string): string {
    if (valence === 'positive') return '★ Opportunity';
    if (valence === 'negative') return '⚠ Crisis';
    return '◆ Dilemma';
  }
</script>

{#if event && event.type === 'dilemma'}
  <div class="modal-overlay" role="dialog" aria-modal="true">
    <div class="modal">

      <div class="modal-header">
        <span class="event-badge" style="color:{valenceColor(event.valence)}; border-color:{valenceColor(event.valence)}44">
          {valenceLabel(event.valence)}
        </span>
        <span class="modal-title">{event.name}</span>
      </div>

      <div class="prompt-section">
        <p class="prompt-text">{event.prompt}</p>
        <div class="race-paused-note">⏸ Race paused</div>
      </div>

      <div class="choice-list">
        {#each (event.choices ?? []) as choice}
          {@const isSelected = selectedChoice === choice.id}
          <button
            class="choice-card"
            class:selected={isSelected}
            on:click={() => onSelect(choice.id)}
          >
            <div class="choice-text">{choice.text}</div>
          </button>
        {/each}
      </div>

      <div class="confirm-row">
        <button
          class="confirm-btn"
          class:danger={event.valence === 'negative'}
          disabled={!selectedChoice}
          on:click={onConfirm}
        >
          {selectedChoice ? 'Respond →' : 'Select a response'}
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
    max-height: 80vh;
    display: flex; flex-direction: column;
    overflow: hidden;
    animation: slide-up 0.2s cubic-bezier(0.34,1.2,0.64,1);
  }
  @keyframes slide-up {
    from { transform: translateY(40px); opacity: 0.6; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .modal-header {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px 8px;
    border-bottom: 1px solid #2E2218;
    flex-shrink: 0;
  }
  .event-badge {
    font-size: 0.62rem; font-weight: bold;
    background: transparent; border: 1px solid;
    border-radius: 4px; padding: 2px 7px;
    flex-shrink: 0;
  }
  .modal-title { font-size: 0.75rem; font-weight: bold; color: #f0ece4; }

  .prompt-section {
    padding: 10px 14px 8px;
    border-bottom: 1px solid #201912;
    flex-shrink: 0;
  }
  .prompt-text {
    font-size: 0.72rem; color: #c8c4bc; line-height: 1.5; margin: 0 0 5px;
  }
  .race-paused-note {
    font-size: 0.58rem; color: #555;
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
    transition: border-color 0.1s, background 0.1s;
  }
  .choice-card:active { background: #1e2a3e; }
  .choice-card.selected { border-color: #4a9eff; background: #1a2a3e; }

  .choice-text { font-size: 0.72rem; color: #f0ece4; line-height: 1.4; }

  .confirm-row {
    padding: 10px 14px;
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
  .confirm-btn.danger:not(:disabled) { background: #c0392b; }
  .confirm-btn:disabled { background: #2E2218; color: #555; cursor: not-allowed; }
  .confirm-btn:not(:disabled):active { opacity: 0.85; }
</style>
