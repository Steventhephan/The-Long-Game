<script lang="ts">
  import { gameStore } from '../state/store';
  import { resetRun } from '../state/gameState';
  import { saveGame } from '../persist/autosave';
  import { playerPct } from '../sim/election';
  import { computePrestigeGain } from '../sim/prestige';
  import { MAX_OFFICE_INDEX } from '../config/offices';

  $: state = $gameStore;
  $: result = state.electionResult;

  $: show = (result === 'win' || result === 'runoff_win')
    && state.officeIndex === MAX_OFFICE_INDEX
    && state.phase === 'general';

  $: pct = playerPct(state);
  $: pctDisplay = (pct * 100).toFixed(1);
  $: prestigeGain = show ? computePrestigeGain(state, true) : 0;
  $: pastRuns = state.runHistory ?? [];
  $: totalEarned = pastRuns.reduce((s, r) => s + r.prestigeEarned, 0) + prestigeGain;

  function onNewDynasty() {
    const fresh = resetRun(state, true);
    gameStore.set(fresh);
    saveGame(fresh);
  }
</script>

{#if show}
  <div class="pres-overlay" role="dialog" aria-modal="true" aria-label="Presidential Victory">
    <div class="scroll-content">

      <div class="seal" aria-hidden="true">🏛️</div>
      <div class="eyebrow">Run #{state.runNumber ?? 1}</div>
      <h1 class="title">PRESIDENT</h1>
      <p class="subtitle">of the United States</p>
      <p class="vote-line">Won with <strong>{pctDisplay}%</strong> of the vote</p>

      {#if prestigeGain > 0}
        <div class="prestige-banner">
          +{prestigeGain} prestige banked for your dynasty
        </div>
      {/if}

      {#if pastRuns.length > 0}
        <div class="history-section">
          <div class="history-heading">Dynasty Record</div>
          {#each pastRuns as run}
            <div class="run-row" class:victory={run.outcome === 'victory'}>
              <span class="run-num">Run {run.runNumber}</span>
              <span class="run-office">{run.officeName}</span>
              <span class="run-prestige {run.prestigeEarned > 0 ? 'pos' : 'zero'}">
                {run.prestigeEarned > 0 ? `+${run.prestigeEarned}` : '—'}
              </span>
            </div>
          {/each}
          {#if totalEarned > 0}
            <div class="run-row total">
              <span class="run-num">Total</span>
              <span class="run-office"></span>
              <span class="run-prestige pos">{totalEarned} pt</span>
            </div>
          {/if}
        </div>
      {/if}

      <button class="cta-btn" on:click={onNewDynasty}>
        Start a New Dynasty →
      </button>

    </div>
  </div>
{/if}

<style>
  .pres-overlay {
    position: absolute;
    inset: 0;
    background: #0A0705;
    z-index: 200;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    overflow-y: auto;
    overflow-x: hidden;
    animation: pres-fade-in 0.5s ease;
  }
  @keyframes pres-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .scroll-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 20px 40px;
    gap: 0;
    min-height: 100%;
    will-change: transform;
    animation: pres-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }
  @keyframes pres-rise {
    from { transform: translateY(20px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .seal {
    font-size: 3.5rem;
    line-height: 1;
    margin-bottom: 12px;
  }

  .eyebrow {
    font-size: 0.56rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #6A5640;
    margin-bottom: 6px;
  }

  .title {
    font-size: 2.2rem;
    letter-spacing: 0.22em;
    color: #c8a44a;
    text-transform: uppercase;
    margin: 0 0 2px;
    line-height: 1;
  }

  .subtitle {
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #6A5640;
    margin: 0 0 16px;
  }

  .vote-line {
    font-size: 0.85rem;
    color: #9E8870;
    margin: 0 0 16px;
  }
  .vote-line strong { color: #f0ece4; }

  .prestige-banner {
    background: #1C1510;
    border: 1px solid #c8a44a;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 0.72rem;
    color: #c8a44a;
    font-style: italic;
    letter-spacing: 0.04em;
    margin-bottom: 24px;
    text-align: center;
  }

  .history-section {
    width: 100%;
    max-width: 320px;
    border: 1px solid #2E2218;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 28px;
  }

  .history-heading {
    font-size: 0.54rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #6A5640;
    background: #130E09;
    padding: 6px 12px;
    border-bottom: 1px solid #2E2218;
  }

  .run-row {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    border-bottom: 1px solid #1E1610;
    gap: 8px;
  }
  .run-row:last-child { border-bottom: none; }
  .run-row.victory .run-office { color: #c8a44a; }
  .run-row.total {
    background: #130E09;
    border-top: 1px solid #2E2218;
  }

  .run-num {
    font-size: 0.56rem;
    color: #4A3C30;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    min-width: 44px;
    flex-shrink: 0;
  }
  .run-office {
    font-size: 0.68rem;
    color: #9E8870;
    flex: 1;
  }
  .run-prestige {
    font-size: 0.64rem;
    font-weight: bold;
    text-align: right;
    min-width: 36px;
  }
  .run-prestige.pos  { color: #c8a44a; }
  .run-prestige.zero { color: #4A3C30; }

  .cta-btn {
    padding: 13px 28px;
    background: #1C1510;
    border: 2px solid #c8a44a;
    border-radius: 8px;
    color: #c8a44a;
    font-family: inherit;
    font-size: 0.9rem;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    margin-top: auto;
  }
  .cta-btn:active {
    background: #c8a44a;
    color: #0A0705;
  }

  @media (prefers-reduced-motion: reduce) {
    .pres-overlay { animation: none; }
    .scroll-content { animation: none; }
  }
</style>
