<script lang="ts">
  import { gameStore } from '../state/store';
  import { INTEREST_GROUPS, blocsUnlockedForOffice } from '../config/blocs';
  import { IDEOLOGIES } from '../config/ideologies';
  import { issuesForEra } from '../config/issues';
  import { computePosition, eraForOffice, getIdeology, flipFlopCost } from '../sim/platform';
  import { openPolicyModal } from '../state/uiStore';

  $: state = $gameStore;
  $: era = eraForOffice(state.officeIndex);
  $: unlockedIssues = issuesForEra(era);
  $: unlockedBlocs = blocsUnlockedForOffice(state.officeIndex);
  $: position = computePosition(state.platform, era);
  $: ideology = getIdeology(position);
  $: positionPct = ((position + 1) / 2) * 100;

  function ideologyColor(id: string): string {
    const colors: Record<string, string> = {
      progressive: '#4a9eff', liberal: '#4ab8b0',
      moderate: '#c8a44a', conservative: '#e8944a', hard_liner: '#e74c3c',
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

  function supportPct(support: number): number {
    return ((support - 0.5) / 2.5) * 100;
  }

  function stanceColor(scalar: number): string {
    if (scalar <= -0.6) return '#4a9eff';
    if (scalar <= -0.1) return '#4ab8b0';
    if (scalar <   0.1) return '#c8a44a';
    if (scalar <   0.6) return '#e8944a';
    return '#e74c3c';
  }
</script>

<div class="platform-tab">

  <!-- Ideology + position -->
  <div class="ideology-header">
    <span class="ideology-badge" style="background:{ideologyColor(ideology.id)}20; border-color:{ideologyColor(ideology.id)}; color:{ideologyColor(ideology.id)}">
      {ideology.label}
    </span>
    <div class="position-wrap">
      <div class="axis-labels">
        <span>◀ Left</span><span>Center</span><span>Right ▶</span>
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

  <!-- Current platform promises -->
  {#if unlockedIssues.length > 0}
    <div class="promises-section">
      <div class="section-label">Your Platform</div>
      {#each unlockedIssues as issue}
        {@const stanceId = state.platform[issue.id] ?? 'center'}
        {@const stance = issue.stances.find(s => s.id === stanceId) ?? issue.stances[2]}
        {@const trust = state.flipFlopTrustMultipliers[issue.id] ?? 1.0}
        {@const flipCount = state.flipFlopCounts[issue.id] ?? 0}
        {@const nextCost = flipFlopCost(flipCount)}
        <button class="promise-card" class:unpromised={flipCount === 0} on:click={() => openPolicyModal(issue.id)}>
          <div class="promise-card-top">
            <span class="promise-issue">{issue.name}</span>
            {#if flipCount > 0}
              <span class="promise-label" style="color:{stanceColor(stance.scalar)}">{stance.label}</span>
            {/if}
          </div>
          {#if flipCount === 0}
            <div class="promise-cta">Promise a Policy →</div>
          {:else}
            <div class="promise-title" style="color:{stanceColor(stance.scalar)}">{stance.title}</div>
            <div class="promise-meta">
              {#if trust < 1.0}
                <span class="trust-pill">⚠ Trust {Math.round(trust * 100)}%</span>
              {/if}
              {#if nextCost > 0}
                <span class="cost-pill">Change: ${nextCost}</span>
              {/if}
              <span class="change-hint">Tap to change →</span>
            </div>
          {/if}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Coalition support bars -->
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


<style>
  .platform-tab {
    position: absolute; inset: 0;
    overflow-y: auto;
    padding: 8px 12px;
    display: flex; flex-direction: column; gap: 10px;
  }

  /* Ideology header */
  .ideology-header {
    background: #1a1a2e; border: 1px solid #2a2a4a;
    border-radius: 6px; padding: 6px 10px;
    display: flex; flex-direction: column; gap: 5px;
  }
  .ideology-badge {
    font-size: 0.68rem; font-weight: bold; letter-spacing: 0.07em;
    padding: 2px 8px; border-radius: 10px; border: 1px solid; flex-shrink: 0;
    align-self: center;
  }

  .position-wrap { display: flex; flex-direction: column; gap: 2px; }
  .axis-labels { display: flex; justify-content: space-between; font-size: 0.55rem; color: #666; }
  .position-bar {
    position: relative; height: 8px;
    background: #2a2a3e; border-radius: 4px; overflow: hidden;
  }
  .ideo-zone { position: absolute; top: 0; height: 100%; }
  .center-tick { position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: rgba(255,255,255,0.25); }
  .pos-marker {
    position: absolute; top: 1px; bottom: 1px; width: 5px;
    border-radius: 3px; transform: translateX(-50%); transition: left 0.3s ease;
  }

  /* Platform promises */
  .promises-section { display: flex; flex-direction: column; gap: 5px; }
  .section-label {
    font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em;
    color: #c8a44a; border-top: 1px solid #2a2a3e; padding-top: 3px;
  }
  .promise-card {
    background: #1a1a2e; border: 1px solid #2a2a4a; border-radius: 6px;
    padding: 6px 9px; text-align: left; cursor: pointer; font-family: inherit;
    display: flex; flex-direction: column; gap: 3px;
    transition: border-color 0.1s, background 0.1s;
  }
  .promise-card:active { background: #1e2a3e; border-color: #3a3a5a; }
  .promise-card-top { display: flex; justify-content: space-between; align-items: baseline; }
  .promise-issue { font-size: 0.65rem; color: #888; }
  .promise-label { font-size: 0.6rem; font-weight: bold; }
  .promise-title { font-size: 0.75rem; color: #f0ece4; font-weight: bold; }
  .promise-meta { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
  .trust-pill {
    font-size: 0.56rem; padding: 1px 5px; border-radius: 3px;
    background: #2a1208; border: 1px solid #e8944a; color: #e8944a;
  }
  .cost-pill { font-size: 0.56rem; color: #888; }
  .change-hint { font-size: 0.56rem; color: #444; margin-left: auto; }

  .promise-card.unpromised { border-color: #2a3a5a; background: #131320; }
  .promise-card.unpromised:active { background: #1a2a3a; }
  .promise-cta { font-size: 0.68rem; color: #4a9eff; font-style: italic; }

  /* Bloc support */
  .blocs-section { display: flex; flex-direction: column; gap: 4px; }
  .bloc-row { display: flex; align-items: center; gap: 5px; }
  .bloc-name {
    font-size: 0.62rem; color: #aaa;
    width: 95px; min-width: 95px; max-width: 95px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 0;
  }
  .support-bar-wrap { flex: 1; }
  .support-bar {
    position: relative; height: 5px;
    background: #2a2a3e; border-radius: 3px; overflow: hidden;
  }
  .support-fill { height: 100%; transition: width 0.3s; border-radius: 3px; opacity: 0.8; }
  .neutral-tick { position: absolute; left: 20%; top: 0; bottom: 0; width: 1px; background: rgba(255,255,255,0.2); }
  .support-val { font-size: 0.6rem; min-width: 30px; text-align: right; font-weight: bold; }
</style>
