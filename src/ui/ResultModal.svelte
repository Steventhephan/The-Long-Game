<script lang="ts">
  import { gameStore } from '../state/store';
  import { advanceElection, resetRun } from '../state/gameState';
  import { saveGame } from '../persist/autosave';
  import { playerPct } from '../sim/election';

  $: state = $gameStore;
  $: result = state.electionResult;
  $: pct = (playerPct(state) * 100).toFixed(1);
  $: phaseName = state.phase === 'primary' ? 'Primary' : 'General';
  $: isRunoffSignal = result === 'runoff_start';

  $: show = result !== 'none';

  // Auto-dismiss the runoff_start signal after a beat (it's just a notification).
  let runoffTimer: ReturnType<typeof setTimeout> | null = null;
  $: if (result === 'runoff_start') {
    if (runoffTimer) clearTimeout(runoffTimer);
    runoffTimer = setTimeout(() => {
      gameStore.update(s => ({ ...s, electionResult: 'none' }));
    }, 2500);
  }

  function onContinue() {
    const next = advanceElection(state);
    gameStore.set(next);
    saveGame(next);
  }

  function onTryAgain() {
    const fresh = resetRun(state);
    gameStore.set(fresh);
    saveGame(fresh);
  }
</script>

{#if show}
  <div class="modal-overlay" role="dialog" aria-modal="true">
    <div class="modal" class:win={result === 'win' || result === 'runoff_win'} class:lose={result === 'lose' || result === 'runoff_lose'} class:runoff={isRunoffSignal}>

      {#if result === 'win' || result === 'runoff_win'}
        <div class="modal-icon">🎉</div>
        <h2>Victory!</h2>
        <p>City Council {phaseName}</p>
        <p class="pct-line">You earned <strong>{pct}%</strong> of the vote.</p>
        {#if result === 'runoff_win'}<p class="sub">Won in the runoff.</p>{/if}
        <button class="modal-btn primary" on:click={onContinue}>
          {state.phase === 'general' ? 'Start New Run →' : 'Advance to General →'}
        </button>

      {:else if result === 'lose' || result === 'runoff_lose'}
        <div class="modal-icon">📋</div>
        <h2>Defeated</h2>
        <p>City Council {phaseName}</p>
        <p class="pct-line">You got <strong>{pct}%</strong>.</p>
        {#if result === 'runoff_lose'}<p class="sub">Lost in the runoff.</p>{/if}
        <p class="prestige-note">Your campaign banked experience for next time.</p>
        <button class="modal-btn secondary" on:click={onTryAgain}>Try Again</button>

      {:else if isRunoffSignal}
        <div class="modal-icon">⚡</div>
        <h2>Runoff!</h2>
        <p>No majority at the buzzer.</p>
        <p class="sub">Top two candidates continue for {state.timerRemaining.toFixed(0)}s.</p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fade-in 0.2s ease;
  }
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

  .modal {
    background: #1a1a2e;
    border: 2px solid #c8a44a;
    border-radius: 12px;
    padding: 28px 24px;
    text-align: center;
    max-width: 300px;
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: pop-in 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes pop-in {
    from { transform: scale(0.8); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  .modal.win  { border-color: #27ae60; }
  .modal.lose { border-color: #c0392b; }
  .modal.runoff { border-color: #f39c12; }

  .modal-icon { font-size: 2.5rem; line-height: 1; }
  h2 { font-size: 1.5rem; color: #f0ece4; margin: 0; }
  p  { font-size: 0.9rem; color: #aaa; margin: 0; }
  .pct-line strong { color: #f0ece4; }
  .sub { font-size: 0.78rem; color: #888; }
  .prestige-note { font-size: 0.75rem; color: #c8a44a; font-style: italic; }

  .modal-btn {
    margin-top: 8px;
    padding: 10px 20px;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.9rem;
    cursor: pointer;
    border: none;
    transition: opacity 0.1s;
  }
  .modal-btn:active { opacity: 0.8; }
  .modal-btn.primary  { background: #27ae60; color: #fff; }
  .modal-btn.secondary { background: #2a3a5a; color: #f0ece4; border: 1px solid #4a9eff; }
</style>
