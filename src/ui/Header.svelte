<script lang="ts">
  import { gameStore, displayPct, displayTimer, displayTimerLabel, displayCash } from '../state/store';
  import { playerPct, totalPool } from '../sim/election';
  import { CITY_COUNCIL_RIVALS } from '../config/rivals';

  $: state = $gameStore;
  $: pct = playerPct(state);
  $: rivalName = CITY_COUNCIL_RIVALS[0]?.name ?? 'Opponent';
  $: rivalPct = state.rivals[0] && !state.rivals[0].eliminated
    ? (state.rivals[0].share / Math.max(totalPool(state), 1)) * 100
    : 0;
  $: officeName = 'City Council';
  $: phaseName = state.phase === 'primary' ? 'Primary' : 'General';
</script>

<header class="race-header">
  <div class="race-title">
    {officeName} {phaseName}
    {#if state.isRunoff}<span class="runoff-badge">RUNOFF</span>{/if}
  </div>

  <div class="progress-row">
    <div class="progress-bar-wrap">
      <div class="progress-bar">
        <div class="fill player" style="width: {Math.min(pct * 100, 100)}%"></div>
        <div class="fill rival" style="width: {Math.min(rivalPct, 100)}%"></div>
        <div class="threshold-line"></div>
      </div>
      <div class="progress-labels">
        <span class="player-pct">{$displayPct}</span>
        <span class="rival-pct">{rivalPct.toFixed(1)}% {rivalName}</span>
      </div>
    </div>
  </div>

  <div class="stats-row">
    <div class="stat">
      <span class="stat-label">{$displayTimerLabel}</span>
      <span class="stat-value timer" class:urgent={state.timerRemaining < 10}>
        {$displayTimer}
      </span>
    </div>
    <div class="stat">
      <span class="stat-label">Cash</span>
      <span class="stat-value">${$displayCash}</span>
    </div>
  </div>
</header>

<style>
  .race-header {
    background: #1a1a2e;
    border-bottom: 2px solid #c8a44a;
    padding: 10px 14px 8px;
    flex-shrink: 0;
  }
  .race-title {
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #c8a44a;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .runoff-badge {
    background: #c0392b;
    color: #fff;
    font-size: 0.65rem;
    padding: 1px 6px;
    border-radius: 3px;
    animation: pulse 0.8s ease-in-out infinite alternate;
  }
  @keyframes pulse { from { opacity: 0.7; } to { opacity: 1; } }

  .progress-bar-wrap { margin-bottom: 4px; }
  .progress-bar {
    position: relative;
    height: 14px;
    background: #2a2a3e;
    border-radius: 7px;
    overflow: hidden;
    margin-bottom: 3px;
  }
  .fill { position: absolute; top: 0; height: 100%; border-radius: 7px; transition: width 0.15s ease; }
  .fill.player { background: #4a9eff; left: 0; }
  .fill.rival  { background: #e74c3c; right: 0; }
  .threshold-line {
    position: absolute;
    left: 50%;
    top: 0; bottom: 0;
    width: 2px;
    background: rgba(255,255,255,0.4);
  }
  .progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    color: #aaa;
  }
  .player-pct { color: #4a9eff; font-weight: bold; }
  .rival-pct  { color: #e74c3c; }

  .stats-row {
    display: flex;
    gap: 24px;
  }
  .stat { display: flex; flex-direction: column; }
  .stat-label { font-size: 0.6rem; text-transform: uppercase; color: #888; letter-spacing: 0.08em; }
  .stat-value { font-size: 1rem; font-weight: bold; color: #f0ece4; }
  .timer.urgent { color: #e74c3c; animation: pulse 0.5s ease-in-out infinite alternate; }
</style>
