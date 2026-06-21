<script lang="ts">
  import { gameStore, displayPct, displayTimer, displayTimerLabel, displayCash } from '../state/store';
  import { playerPct, totalPool } from '../sim/election';
  import { getOffice } from '../config/offices';
  import { ARCHETYPE_BIOS } from '../config/flavor';

  // Stable per-slot colors (index = position in state.rivals array, so colors don't shift on elimination)
  // Color-blind safe: red stays for rival 0; slot 1 changed from orange → teal so
  // red+orange can't conflate for deutan/protan users. Labels are the primary ID anyway.
  const RIVAL_COLORS = ['#E74C3C', '#45A890', '#E8D840', '#9B59B6'];

  $: state = $gameStore;
  $: pct = playerPct(state);
  $: pool = totalPool(state);

  // Live rivals with original index preserved for stable color assignment.
  // Sorted largest→smallest so wider bars render first (behind) and narrower bars sit on top.
  $: liveRivals = state.rivals
    .map((r, i) => ({ ...r, colorIdx: i }))
    .filter(r => !r.eliminated)
    .sort((a, b) => b.share - a.share);

  $: leadRival = liveRivals[0] ?? null;
  $: leadRivalBio = leadRival ? (ARCHETYPE_BIOS[leadRival.archetypeId] ?? null) : null;

  $: isWin = state.electionResult === 'win' || state.electionResult === 'runoff_win';

  // Buzzer-loss warning: trailing with <15s left. Uses actual vote counts, not a fixed %
  // threshold, so it correctly handles multi-rival primaries (33% may still be a lead).
  $: atRisk = state.electionResult === 'none'
    && state.timerRemaining > 0
    && state.timerRemaining < 15
    && liveRivals.some(r => r.share > state.voters);

  $: office = (() => { try { return getOffice(state.officeIndex); } catch { return null; } })();
  $: officeName = office?.name ?? 'City Council';
  $: phaseName = state.phase === 'primary' ? 'Primary' : 'General';

  function rivalPctStr(share: number): string {
    return pool > 0 ? ((share / pool) * 100).toFixed(1) + '%' : '0.0%';
  }

  function lastName(fullName: string): string {
    const parts = fullName.trim().split(' ');
    return parts[parts.length - 1];
  }

  // Stack rivals from the right edge, largest first.
  // Each item gets a rightOffset (% from right) and width (% of total pool).
  $: stackedRivals = (() => {
    let offset = 0;
    return liveRivals.map(rival => {
      const width = pool > 0 ? (rival.share / pool) * 100 : 0;
      const item = { ...rival, width, rightOffset: offset };
      offset += width;
      return item;
    });
  })();
</script>

<header class="race-header">
  <div class="race-title">
    {officeName} · {phaseName}
    {#if state.isRunoff}<span class="runoff-badge">RUNOFF</span>{/if}
  </div>

  <div class="progress-row">
    <div class="progress-bar-wrap">
      <div class="progress-bar">
        <div class="fill player" class:celebrating={isWin} class:at-risk={atRisk} style="width: {Math.min(pct * 100, 100)}%"></div>
        {#each stackedRivals as rival}
          <div class="fill rival"
            style="right: {rival.rightOffset}%; width: {Math.min(rival.width, 100)}%; background: {RIVAL_COLORS[rival.colorIdx % RIVAL_COLORS.length]}"
          ></div>
        {/each}
        <div class="threshold-line"></div>
      </div>
      <div class="bar-labels">
        <span class="player-pct">{$displayPct}</span>
        {#each stackedRivals as rival}
          {@const color = RIVAL_COLORS[rival.colorIdx % RIVAL_COLORS.length]}
          {@const center = 100 - rival.rightOffset - rival.width / 2}
          <div class="rival-label" style="left: {center}%; color: {color}">
            <span class="rival-lname">{lastName(rival.name)}</span>
            <span class="rival-lpct">{rivalPctStr(rival.share)}</span>
          </div>
        {/each}
        {#if liveRivals.length === 0}
          <span class="no-rivals">No rivals</span>
        {/if}
      </div>
    </div>
  </div>

  <div class="stats-row">
    <div class="stat">
      <span class="stat-label">{$displayTimerLabel}</span>
      <span class="stat-value timer" class:at-risk={atRisk} class:urgent={state.timerRemaining < 10}>
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
    background: #1C1510;
    border-bottom: 2px solid #c8a44a;
    padding: 6px 12px 5px;
    flex-shrink: 0;
  }
  .race-title {
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #c8a44a;
    font-weight: bold;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .runoff-badge {
    background: #c0392b;
    color: #fff;
    font-size: 0.58rem;
    padding: 1px 5px;
    border-radius: 3px;
    animation: pulse 0.8s ease-in-out infinite alternate;
  }
  @keyframes pulse { from { opacity: 0.7; } to { opacity: 1; } }

  .progress-bar-wrap { margin-bottom: 3px; }
  .progress-bar {
    position: relative;
    height: 9px;
    background: #2E2218;
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 2px;
  }
  .fill { position: absolute; top: 0; height: 100%; border-radius: 5px; transition: width 0.15s ease; }
  .fill.player { background: #4a9eff; left: 0; }
  .fill.player.celebrating {
    animation: bar-win-pulse 0.55s ease-in-out 5 alternate;
  }
  @keyframes bar-win-pulse {
    from { filter: brightness(1); }
    to   { filter: brightness(1.8); box-shadow: 0 0 8px 3px rgba(74, 158, 255, 0.55); }
  }
  .fill.rival  { right: 0; /* background set by inline style */ }
  .threshold-line {
    position: absolute;
    left: 50%;
    top: 0; bottom: 0;
    width: 1px;
    background: rgba(255,255,255,0.35);
  }
  .bar-labels {
    position: relative;
    height: 26px;
    margin-top: 2px;
  }
  .player-pct {
    position: absolute;
    left: 0;
    top: 0;
    color: #4a9eff;
    font-weight: bold;
    font-size: 0.6rem;
  }
  .rival-label {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
  }
  .rival-lname {
    font-size: 0.55rem;
    font-weight: bold;
    white-space: nowrap;
    line-height: 1;
  }
  .rival-lpct {
    font-size: 0.52rem;
    white-space: nowrap;
    line-height: 1;
  }
  .no-rivals { position: absolute; right: 0; top: 2px; font-size: 0.6rem; color: #555; }

  .stats-row {
    display: flex;
    gap: 16px;
    margin-top: 2px;
  }
  .stat { display: flex; flex-direction: column; }
  .stat-label { font-size: 0.55rem; text-transform: uppercase; color: #888; letter-spacing: 0.07em; }
  .stat-value { font-size: 0.85rem; font-weight: bold; color: #f0ece4; }
  /* at-risk defined before urgent so urgent always overrides when both apply */
  .timer.at-risk { color: #c8a44a; }
  .fill.player.at-risk { animation: risk-pulse 1.2s ease-in-out infinite alternate; }
  @keyframes risk-pulse {
    from { filter: brightness(0.65); }
    to   { filter: brightness(1.0); }
  }

  .timer.urgent { color: #e74c3c; animation: pulse 0.5s ease-in-out infinite alternate; }

  @media (prefers-reduced-motion: reduce) {
    .runoff-badge { animation: none; opacity: 1; }
    .fill { transition: none; }
    .fill.player.celebrating { animation: none; }
    .fill.player.at-risk { animation: none; }
    .timer.urgent { animation: none; }
  }
</style>
