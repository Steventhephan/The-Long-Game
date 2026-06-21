<script lang="ts">
  import { gameStore } from '../state/store';
  import { playWin, playLoss } from '../audio/sounds';
  import { advanceElection, resetRun } from '../state/gameState';
  import { saveGame } from '../persist/autosave';
  import { playerPct } from '../sim/election';
  import { computePrestigeGain } from '../sim/prestige';
  import { MAX_OFFICE_INDEX, getOffice } from '../config/offices';
  import { OFFICE_TITLE_CARDS } from '../config/flavor';

  $: state = $gameStore;
  $: result = state.electionResult;
  $: pct = playerPct(state);
  $: pctDisplay = (pct * 100).toFixed(1);
  $: phaseName = state.phase === 'primary' ? 'Primary' : 'General';
  $: isRunoffSignal = result === 'runoff_start';

  $: currentOfficeName = (() => {
    try { return getOffice(state.officeIndex).name; } catch { return ''; }
  })();

  // Is this the presidential general win? Special handling.
  $: isPresidencyWin = (result === 'win' || result === 'runoff_win')
    && state.officeIndex === MAX_OFFICE_INDEX
    && state.phase === 'general';

  // Prestige the player will bank on a loss (shown in lose modal).
  $: prestigeGain = computePrestigeGain(state, false);

  $: show = result !== 'none' && !isPresidencyWin;

  // Play sounds on result changes (only fires when result transitions, not on every render).
  let prevResult = 'none';
  $: {
    if (result !== prevResult) {
      if (result === 'win' || result === 'runoff_win') playWin();
      else if (result === 'lose' || result === 'runoff_lose') playLoss();
      prevResult = result;
    }
  }

  // Auto-dismiss the runoff_start signal after a beat (it's just a notification).
  let runoffTimer: ReturnType<typeof setTimeout> | null = null;
  $: if (result === 'runoff_start') {
    if (runoffTimer) clearTimeout(runoffTimer);
    runoffTimer = setTimeout(() => {
      gameStore.update(s => ({ ...s, electionResult: 'none' }));
    }, 2500);
  }

  function onContinue() {
    if (isPresidencyWin) {
      const fresh = resetRun(state, true);
      gameStore.set(fresh);
      saveGame(fresh);
    } else {
      const next = advanceElection(state);
      gameStore.set(next);
      saveGame(next);
    }
  }

  function onTryAgain() {
    const fresh = resetRun(state, false);
    gameStore.set(fresh);
    saveGame(fresh);
  }

  $: nextLabel = (() => {
    if (isPresidencyWin) return 'New Dynasty →';
    if (state.phase === 'general') return 'Next Race →';
    return 'Advance to General →';
  })();

  // Title card for the next office — shown on general wins only (office advances)
  $: nextTitleCard = (() => {
    if (isPresidencyWin) return null;
    if (state.phase !== 'general') return null;
    const nextIndex = state.officeIndex + 1;
    try {
      const nextOffice = getOffice(nextIndex);
      return { office: nextOffice, card: OFFICE_TITLE_CARDS[nextOffice.id] ?? null };
    } catch { return null; }
  })();
</script>

{#if show}
  <div class="modal-overlay" role="dialog" aria-modal="true">
    <div class="modal"
      class:win={result === 'win' || result === 'runoff_win'}
      class:lose={result === 'lose' || result === 'runoff_lose'}
      class:runoff={isRunoffSignal}
      class:victory={isPresidencyWin}
    >

      {#if result === 'win' || result === 'runoff_win'}
        {#if isPresidencyWin}
          <div class="modal-icon">🏛️</div>
          <h2>President!</h2>
          <p class="office-line">The White House is yours.</p>
          <p class="pct-line">You earned <strong>{pctDisplay}%</strong> of the vote.</p>
          <p class="prestige-note">Your dynasty's legacy is complete. A new generation rises.</p>
        {:else}
          <div class="modal-icon">🎉</div>
          <h2>Victory!</h2>
          <p class="office-line">{currentOfficeName} {phaseName}</p>
          <p class="pct-line">You earned <strong>{pctDisplay}%</strong> of the vote.</p>
          {#if result === 'runoff_win'}<p class="sub">Won in the runoff.</p>{/if}
          {#if nextTitleCard}
            <div class="title-card">
              <div class="title-card-label">Up next: {nextTitleCard.office.name}</div>
              {#if nextTitleCard.card}
                <div class="title-card-tagline">{nextTitleCard.card.tagline}</div>
                <div class="title-card-quote">"{nextTitleCard.card.quote}"</div>
              {/if}
            </div>
          {/if}
        {/if}
        <button class="modal-btn primary" on:click={onContinue}>{nextLabel}</button>

      {:else if result === 'lose' || result === 'runoff_lose'}
        <div class="modal-icon">📋</div>
        <h2>Defeated</h2>
        <p class="office-line">{currentOfficeName} {phaseName}</p>
        <p class="pct-line">You got <strong>{pctDisplay}%</strong>.</p>
        {#if result === 'runoff_lose'}<p class="sub">Lost in the runoff.</p>{/if}
        {#if prestigeGain > 0}
          <p class="prestige-note">Banking <strong>+{prestigeGain}</strong> prestige for your dynasty.</p>
        {:else}
          <p class="prestige-note">Win at least one election to bank prestige.</p>
        {/if}
        <button class="modal-btn secondary" on:click={onTryAgain}>New Run →</button>

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
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fade-in 0.2s ease;
  }
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

  @media (prefers-reduced-motion: reduce) {
    .modal-overlay { animation: none; }
    .modal { animation: none; }
  }

  .modal {
    background: #1C1510;
    border: 2px solid #c8a44a;
    border-radius: 12px;
    padding: 28px 24px;
    text-align: center;
    max-width: 300px;
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    will-change: transform;
    animation: pop-in 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes pop-in {
    from { transform: scale(0.8); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  .modal.win     { border-color: #27ae60; }
  .modal.lose    { border-color: #c0392b; }
  .modal.runoff  { border-color: #f39c12; }
  .modal.victory { border-color: #c8a44a; box-shadow: 0 0 24px rgba(200,164,74,0.4); }

  .modal-icon { font-size: 2.5rem; line-height: 1; }
  h2 { font-size: 1.5rem; color: #f0ece4; margin: 0; }
  p  { font-size: 0.9rem; color: #aaa; margin: 0; }
  .office-line { font-size: 0.8rem; color: #888; }
  .pct-line strong { color: #f0ece4; }
  .sub { font-size: 0.78rem; color: #888; }
  .prestige-note { font-size: 0.75rem; color: #c8a44a; font-style: italic; }
  .prestige-note strong { color: #e8c46a; font-style: normal; }

  .title-card {
    background: #150F0A;
    border: 1px solid #2E2218;
    border-radius: 6px;
    padding: 8px 10px;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .title-card-label {
    font-size: 0.56rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #c8a44a;
  }
  .title-card-tagline {
    font-size: 0.72rem;
    color: #f0ece4;
    font-weight: bold;
    font-style: italic;
  }
  .title-card-quote {
    font-size: 0.62rem;
    color: #88786A;
    line-height: 1.4;
    font-style: italic;
  }

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
  .modal-btn.primary   { background: #27ae60; color: #fff; }
  .modal-btn.secondary { background: #2a3a5a; color: #f0ece4; border: 1px solid #4a9eff; }
</style>
