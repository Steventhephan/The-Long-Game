<script lang="ts">
  import { gameStore, formatNum } from '../state/store';
  import { knockDoors, computeStack, computeUpgradeEffects } from '../sim/election';
  import { GENERATORS } from '../config/generators';
  import { BAL, PHASE1 } from '../config/balance';
  import { blocsUnlockedForOffice, INTEREST_GROUPS } from '../config/blocs';
  import { abilitiesForOffice, getAbility } from '../config/abilities';
  import { TOWN_HALLS, FUNDRAISING_GALAS } from '../config/minigames';
  import { clearSave, saveGame } from '../persist/autosave';
  import { defaultState, activateAbility, openOptionalMinigame, devSkipToElection } from '../state/gameState';
  import { getOffice, MAX_OFFICE_INDEX } from '../config/offices';
  import { playTap, playCrit } from '../audio/sounds';

  $: state = $gameStore;

  // Knock button — each tap spawns an independent floater
  interface Floater { id: number; text: string; isCrit: boolean; dx: number; }
  interface CritRing { id: number; }
  let floaters: Floater[] = [];
  let critRings: CritRing[] = [];
  let nextFloaterId = 0;
  let critFlash = false; // keeps button glow while any recent crit is active
  let critGlowTimeout: ReturnType<typeof setTimeout> | null = null;

  function onKnock() {
    const prev = state.voters;
    const newState = knockDoors(state);
    gameStore.set(newState);
    saveGame(newState);

    const gained = Math.round(newState.voters - prev);
    const isCrit = newState.lastCritHit;
    const spread = isCrit ? 80 : 54;
    const dx = (Math.random() - 0.5) * spread;
    const id = nextFloaterId++;

    floaters = [...floaters, { id, text: isCrit ? `⚡ +${gained}` : `+${gained}`, isCrit, dx }];

    const duration = isCrit ? 1200 : 800;
    setTimeout(() => { floaters = floaters.filter(f => f.id !== id); }, duration);

    // Each crit spawns its own expanding ring (stacks correctly for rapid crits)
    if (isCrit) {
      const ringId = nextFloaterId++;
      critRings = [...critRings, { id: ringId }];
      setTimeout(() => { critRings = critRings.filter(r => r.id !== ringId); }, 550);

      critFlash = true;
      if (critGlowTimeout) clearTimeout(critGlowTimeout);
      critGlowTimeout = setTimeout(() => { critFlash = false; }, 600);
    }

    if (isCrit) playCrit(); else playTap();
    if ('vibrate' in navigator) navigator.vibrate(isCrit ? [30, 10, 30] : 15);
    recordTap();
  }

  // Production rate display
  const TAP_WINDOW_MS = 2000; // rolling window for tap rate estimate
  let tapTimestamps: number[] = [];
  let isActive = false;
  let activeTimeout: ReturnType<typeof setTimeout> | null = null;

  function recordTap() {
    const now = Date.now();
    tapTimestamps = [...tapTimestamps.filter(t => now - t < TAP_WINDOW_MS), now];
    isActive = true;
    if (activeTimeout) clearTimeout(activeTimeout);
    activeTimeout = setTimeout(() => { isActive = false; }, 600);
  }

  function formatRate(n: number): string {
    if (n < 10) return n.toFixed(1);
    return formatNum(n);
  }

  $: isWin = state.electionResult === 'win' || state.electionResult === 'runoff_win';

  $: effects = computeUpgradeEffects(state);
  $: stack = computeStack(state);

  $: passiveVoterRate = GENERATORS
    .filter(g => g.track === 'field')
    .reduce((s, g) => s + (state.generators[g.id] ?? 0) * g.baseOutput * effects.fieldMult, 0) * stack;

  $: passiveCashRate = GENERATORS
    .filter(g => g.track === 'finance')
    .reduce((s, g) => s + (state.generators[g.id] ?? 0) * g.baseOutput * effects.financeMult, 0) * stack;

  $: rollingTapRate = tapTimestamps.length / (TAP_WINDOW_MS / 1000);
  $: expectedCritMult = 1 + effects.critChance * (BAL.critMultiplier - 1);
  $: tapScale = BAL.timerGrowth ** state.officeIndex;
  $: tapVotersPerSec = Math.round(PHASE1.tapVoters * tapScale) * effects.tapMult * expectedCritMult * stack * rollingTapRate;
  $: tapCashPerSec   = Math.round(PHASE1.tapCash   * tapScale) * effects.tapMult * expectedCritMult * stack * rollingTapRate;

  $: displayVoterRate = passiveVoterRate + (isActive ? tapVotersPerSec : 0);
  $: displayCashRate  = passiveCashRate  + (isActive ? tapCashPerSec  : 0);

  // Reset save
  let confirmReset = false;
  let confirmTimeout: ReturnType<typeof setTimeout> | null = null;

  function onResetClick() {
    if (!confirmReset) {
      confirmReset = true;
      confirmTimeout = setTimeout(() => { confirmReset = false; }, 3000);
    } else {
      if (confirmTimeout) clearTimeout(confirmTimeout);
      confirmReset = false;
      clearSave();
      gameStore.set(defaultState());
    }
  }

  // Dev skip-to-election dropdown
  const devStages = Array.from({ length: MAX_OFFICE_INDEX + 1 }, (_, i) => {
    const name = getOffice(i).name;
    return [
      { value: `${i}:primary`,  label: `${name} — Primary` },
      { value: `${i}:general`,  label: `${name} — General` },
    ];
  }).flat();

  function onDevSkip(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    if (!val) return;
    const [offStr, phase] = val.split(':');
    const next = devSkipToElection(state, parseInt(offStr, 10), phase as 'primary' | 'general');
    gameStore.set(next);
    saveGame(next);
    (e.target as HTMLSelectElement).value = '';
  }

  // Abilities (State era+, officeIndex >= 4)
  $: isStateEra = state.officeIndex >= 4;
  $: activeAbilities = isStateEra ? abilitiesForOffice(state.officeIndex) : [];

  // Ability targeting: track which ability needs a target before firing
  let targetingAbilityId: string | null = null;

  function onAbilityClick(abilityId: string) {
    const ability = getAbility(abilityId);
    if (!ability) return;
    if (ability.target === 'self') {
      fireAbility(abilityId);
    } else {
      targetingAbilityId = targetingAbilityId === abilityId ? null : abilityId;
    }
  }

  function fireAbility(abilityId: string, targetId?: string) {
    const next = activateAbility(state, abilityId, targetId);
    if (!next) return;
    gameStore.set(next);
    saveGame(next);
    targetingAbilityId = null;
  }

  function abilityCooldownPct(abilityId: string): number {
    const ability = getAbility(abilityId);
    if (!ability) return 0;
    const remaining = state.abilityCooldowns[abilityId] ?? 0;
    return remaining / ability.baseCooldown;
  }

  function abilityCostDisplay(abilityId: string): string {
    const ability = getAbility(abilityId);
    if (!ability) return '';
    const cost = Math.round(ability.baseCost * BAL.timerGrowth ** state.officeIndex);
    return `$${formatNum(cost)}`;
  }

  // Optional minigames (County era+)
  $: isCountyEra = state.officeIndex >= 2;
  $: townHalls = isCountyEra ? TOWN_HALLS : [];
  $: galas = isCountyEra ? FUNDRAISING_GALAS : [];

  function onOptionalMinigame(minigameId: string) {
    const next = openOptionalMinigame(state, minigameId);
    if (!next) return;
    gameStore.set(next);
    saveGame(next);
  }

  function minigameCooldownDisplay(type: string): string {
    const cd = state.minigameCooldowns[type] ?? 0;
    if (cd <= 0) return '';
    return `${Math.ceil(cd)}s`;
  }

  // Active event modifiers
  $: activeModifiers = state.eventModifiers ?? [];

  function modifierLabel(mod: { label: string; kind: string; magnitude: number; duration: number }): string {
    const sign = mod.magnitude >= 1 ? '+' : '−';
    if (mod.kind === 'conversionMult') {
      const pct = Math.round(Math.abs(mod.magnitude - 1) * 100);
      return `${mod.magnitude >= 1 ? '▲' : '▼'} ${pct}% conv`;
    }
    if (mod.kind === 'cashMult') {
      const pct = Math.round(Math.abs(mod.magnitude - 1) * 100);
      return `${mod.magnitude >= 1 ? '▲' : '▼'} ${pct}% $`;
    }
    if (mod.kind === 'blocSupportDelta') return `${sign}${mod.magnitude.toFixed(1)} bloc`;
    if (mod.kind === 'rivalConvMult') {
      const pct = Math.round(Math.abs(mod.magnitude - 1) * 100);
      return `rival ${mod.magnitude >= 1 ? '+' : '−'}${pct}% conv`;
    }
    return mod.label;
  }
</script>

<div class="campaign-tab">

  <!-- Active event modifier banners -->
  {#if activeModifiers.length > 0}
    <div class="modifier-banners">
      {#each activeModifiers as mod (mod.id)}
        {@const isPositive = (mod.kind === 'conversionMult' || mod.kind === 'cashMult' || mod.kind === 'blocSupportDelta')
          ? mod.magnitude >= 1
          : mod.magnitude <= 1}
        <div class="modifier-row" class:positive={isPositive} class:negative={!isPositive}>
          <span class="mod-label">{mod.label} · {modifierLabel(mod)}</span>
          <span class="mod-timer">{Math.ceil(mod.duration)}s</span>
          <div class="mod-bar">
            <div class="mod-fill" style="width:{Math.min(mod.duration / 30, 1) * 100}%"></div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Knock button -->
  <div class="knock-section">
    {#each critRings as ring (ring.id)}
      <div class="crit-ring" aria-hidden="true"></div>
    {/each}
    {#each floaters as floater (floater.id)}
      <div
        class="knock-feedback"
        class:crit={floater.isCrit}
        style="--dx: {floater.dx}px"
      >{floater.text}</div>
    {/each}
    <button
      class="knock-btn"
      class:crit={critFlash}
      on:pointerdown|preventDefault={onKnock}
      disabled={state.electionResult !== 'none'}
      aria-label="Knock on Doors"
    >
      <span class="knock-icon">🚪</span>
      <span class="knock-label">KNOCK</span>
      <span class="knock-crit-hint">{Math.round(effects.critChance * 100)}% ⚡</span>
    </button>

    <div class="rate-display" class:active={isActive}>
      <span class="rate voters">👥 {formatRate(displayVoterRate)}/s</span>
      <span class="rate cash">💰 ${formatRate(displayCashRate)}/s</span>
    </div>
  </div>

  <!-- Optional minigames (County era+) -->
  {#if isCountyEra && (townHalls.length > 0 || galas.length > 0)}
    <div class="optional-section">
      <div class="section-label">Outreach</div>
      <div class="optional-row">
        {#each [...townHalls, ...galas] as mg}
          {@const cd = state.minigameCooldowns[mg.type] ?? 0}
          {@const canAfford = state.cash >= (mg.cashCost ?? 0)}
          {@const onCooldown = cd > 0}
          <button
            class="optional-btn"
            disabled={onCooldown || !canAfford || state.electionResult !== 'none'}
            on:click={() => onOptionalMinigame(mg.id)}
            title={mg.title}
          >
            <span class="opt-icon">{mg.type === 'town_hall' ? '🏛' : '🥂'}</span>
            <span class="opt-name">{mg.title}</span>
            {#if onCooldown}
              <span class="opt-status cd">{minigameCooldownDisplay(mg.type)}</span>
            {:else if !canAfford}
              <span class="opt-status cost">${mg.cashCost ?? 0}</span>
            {:else}
              <span class="opt-status ready">${mg.cashCost ?? 0}</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Abilities (State era+) -->
  {#if isStateEra && activeAbilities.length > 0}
    <div class="abilities-section">
      <div class="section-label">Abilities</div>
      {#each activeAbilities as ability}
        {@const cd = state.abilityCooldowns[ability.id] ?? 0}
        {@const cost = Math.round(ability.baseCost * BAL.timerGrowth ** state.officeIndex)}
        {@const canAfford = state.cash >= cost}
        {@const onCooldown = cd > 0}
        {@const disabled = onCooldown || !canAfford || state.electionResult !== 'none'}
        <div class="ability-row" class:targeting={targetingAbilityId === ability.id}>
          <div class="ability-meta">
            <span class="ability-name">{ability.name}</span>
            <span class="ability-desc">{ability.description}</span>
          </div>
          <div class="ability-right">
            {#if onCooldown}
              <div class="cd-bar">
                <div class="cd-fill" style="width:{abilityCooldownPct(ability.id) * 100}%"></div>
              </div>
              <span class="cd-label">{Math.ceil(cd)}s</span>
            {:else}
              <button
                class="ability-btn"
                class:active={targetingAbilityId === ability.id}
                disabled={disabled}
                on:click={() => onAbilityClick(ability.id)}
              >
                {abilityCostDisplay(ability.id)}
                {#if !canAfford}<span class="no-cash"> ✗</span>{:else}<span class="ready-dot"> ✓</span>{/if}
              </button>
            {/if}
          </div>
        </div>

        <!-- Target picker (bloc or rival) -->
        {#if targetingAbilityId === ability.id && ability.target === 'bloc'}
          <div class="target-picker">
            <span class="target-label">Pick a bloc to court:</span>
            <div class="target-options">
              {#each blocsUnlockedForOffice(state.officeIndex) as group}
                <button class="target-btn" on:click={() => fireAbility(ability.id, group.groupId)}>
                  {group.shortName}
                </button>
              {/each}
            </div>
          </div>
        {:else if targetingAbilityId === ability.id && ability.target === 'rival'}
          <div class="target-picker">
            <span class="target-label">Pick a target:</span>
            <div class="target-options">
              {#each state.rivals as rival, ri}
                {#if !rival.eliminated}
                  <button class="target-btn rival-target" on:click={() => fireAbility(ability.id, String(ri))}>
                    {rival.name}
                  </button>
                {/if}
              {/each}
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {/if}

  <!-- Reset save + dev skip -->
  <div class="reset-section">
    <button class="reset-btn" class:confirm={confirmReset} on:click={onResetClick}>
      {confirmReset ? '⚠️ Tap again to confirm reset' : 'Reset Save'}
    </button>
    <select class="dev-skip" on:change={onDevSkip} title="DEV: skip to election">
      <option value="">⚙ Skip to…</option>
      {#each devStages as stage}
        <option value={stage.value}>{stage.label}</option>
      {/each}
    </select>
  </div>

  <!-- Bloc breakdown -->
  <div class="blocs-section" class:celebrating={isWin}>
    <div class="section-label blocs-header">
      Blocs
      <span class="bloc-legend" aria-hidden="true">
        <span class="legend-swatch you"></span>You
        <span class="legend-swatch opp"></span>Opp
      </span>
    </div>
    {#each blocsUnlockedForOffice(state.officeIndex) as group}
      {@const bloc = state.blocs.find(b => b.groupId === group.groupId)}
      {@const pool = bloc?.totalVoters ?? 0}
      {@const playerShare = pool > 0 ? (bloc?.player ?? 0) / pool : 0}
      {@const rivalShare = pool > 0 ? ((bloc?.rivals[0] ?? 0)) / pool : 0}
      <div class="bloc-row">
        <span class="bloc-name" title={group.name}>{group.shortName}</span>
        <div class="bloc-bar">
          <div class="bloc-fill you" style="width:{playerShare*100}%"></div>
          <div class="bloc-fill rival" style="width:{rivalShare*100}%"></div>
        </div>
        <span class="bloc-pct">{(playerShare*100).toFixed(0)}%</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .campaign-tab {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Knock button */
  .knock-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    position: relative;
  }
  .knock-feedback {
    position: absolute;
    top: 50px;
    left: 50%;
    z-index: 5;
    font-size: 1.4rem;
    font-weight: bold;
    color: #F0E8D8;
    -webkit-text-stroke: 1.5px #000;
    pointer-events: none;
    white-space: nowrap;
    will-change: transform;
    animation: float-up 0.75s ease-out forwards;
  }
  .knock-feedback.crit {
    color: #f1c40f;
    font-size: 1.6rem;
    text-shadow: 0 0 14px rgba(241, 196, 15, 0.7);
    animation: float-up 1.0s ease-out forwards;
  }
  .crit-ring {
    position: absolute;
    top: 0; left: 50%;
    width: 120px; height: 120px;
    margin-left: -60px;
    border-radius: 50%;
    border: 3px solid #f1c40f;
    pointer-events: none;
    z-index: 4;
    will-change: transform;
    animation: ring-expand 0.55s cubic-bezier(0.2, 0.8, 0.4, 1) forwards;
  }
  @keyframes ring-expand {
    from { transform: scale(0.88); opacity: 0.9; }
    to   { transform: scale(1.85); opacity: 0; }
  }

  /* --dx drives the horizontal drift; pop on spawn then float up */
  @keyframes float-up {
    0%   { opacity: 1; transform: translateX(calc(-50% + 0px))                           translateY(0)     scale(1.2); }
    18%  { opacity: 1; transform: translateX(calc(-50% + calc(var(--dx) * 0.2)))         translateY(-10px) scale(1.0); }
    100% { opacity: 0; transform: translateX(calc(-50% + var(--dx)))                     translateY(-60px) scale(0.75); }
  }

  .knock-btn {
    width: 120px; height: 120px;
    border-radius: 50%;
    border: 3px solid #c8a44a;
    background: #1e2a4a;
    color: #f0ece4;
    font-family: inherit;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    touch-action: none;
    box-shadow: 0 0 0 0 rgba(241, 196, 15, 0);
    transition: transform 0.08s, background 0.1s, border-color 0.1s, box-shadow 0.15s;
    user-select: none;
  }
  .knock-btn:active { transform: scale(0.93); background: #263554; }
  .knock-btn.crit {
    border-color: #f1c40f;
    background: #2a2210;
    box-shadow: 0 0 18px 5px rgba(241, 196, 15, 0.4);
  }
  .knock-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .knock-icon { font-size: 1.8rem; line-height: 1; }
  .knock-label { font-size: 0.72rem; letter-spacing: 0.18em; font-weight: bold; }
  .knock-crit-hint { font-size: 0.55rem; color: #888; letter-spacing: 0.05em; }

  /* Production rate display */
  .rate-display {
    display: flex;
    gap: 14px;
    margin-top: 1px;
  }
  .rate {
    font-size: 0.68rem;
    font-weight: bold;
    color: #3A3028;
    transition: color 0.2s ease;
  }
  .rate-display.active .rate.voters { color: #4a9eff; }
  .rate-display.active .rate.cash   { color: #c8a44a; }

  /* Blocs */
  .blocs-section { display: flex; flex-direction: column; gap: 3px; }
  .blocs-section.celebrating .bloc-fill.you {
    animation: bloc-shimmer 0.5s ease-in-out 6 alternate;
  }
  @keyframes bloc-shimmer {
    from { filter: brightness(1); }
    to   { filter: brightness(2.0) saturate(1.3); }
  }
  .section-label {
    font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em;
    color: #c8a44a; border-top: 1px solid #2E2218; padding-top: 3px;
    margin-bottom: 1px;
  }
  .bloc-row { display: flex; align-items: center; gap: 4px; }

  .bloc-name {
    font-size: 0.62rem;
    color: #aaa;
    width: 80px;
    min-width: 80px;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .bloc-bar { flex: 1; height: 5px; background: #302418; border-radius: 3px; overflow: hidden; position: relative; }
  .section-label.blocs-header { display: flex; align-items: center; }
  .bloc-legend {
    margin-left: auto;
    display: flex; align-items: center; gap: 4px;
    font-size: 0.55rem; color: #888; letter-spacing: 0.04em;
    text-transform: none;
  }
  .legend-swatch {
    display: inline-block; width: 7px; height: 7px; border-radius: 1px;
  }
  .legend-swatch.you { background: #4a9eff; }
  .legend-swatch.opp { background: #c8832a; }

  .bloc-fill { position: absolute; top: 0; height: 100%; transition: width 0.2s; border-radius: 3px; }
  .bloc-fill.you   { left: 0;  background: #4a9eff; }
  .bloc-fill.rival { right: 0; background: #c8832a; }
  .bloc-pct { font-size: 0.6rem; color: #4a9eff; min-width: 24px; text-align: right; }

  /* Event modifier banners */
  .modifier-banners {
    display: flex; flex-direction: column; gap: 2px;
  }
  .modifier-row {
    display: flex; align-items: center; gap: 5px;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.62rem;
    border: 1px solid;
  }
  .modifier-row.positive { background: #0a1a10; border-color: #2a4a2a; color: #4a9a4a; }
  .modifier-row.negative { background: #1a0a0a; border-color: #4a2a2a; color: #c05050; }
  .mod-label { flex: 1; font-weight: bold; }
  .mod-timer { flex-shrink: 0; font-size: 0.58rem; opacity: 0.7; }
  .mod-bar { width: 40px; height: 3px; background: #2E2218; border-radius: 2px; flex-shrink: 0; overflow: hidden; }
  .mod-fill { height: 100%; background: currentColor; border-radius: 2px; transition: width 0.5s linear; }

  @media (prefers-reduced-motion: reduce) {
    .knock-feedback { animation: none; opacity: 0; }
    .crit-ring { animation: none; opacity: 0; }
    .knock-btn { transition: none; }
    .bloc-fill { transition: none; }
    .blocs-section.celebrating .bloc-fill.you { animation: none; }
    .mod-fill { transition: none; }
  }

  /* Optional minigames */
  .optional-section { display: flex; flex-direction: column; gap: 4px; }
  .optional-row { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
  .optional-btn {
    background: #1C1510; border: 1px solid #2a3a5a;
    border-radius: 5px; padding: 5px 8px;
    display: flex; flex-direction: column; align-items: flex-start; gap: 1px;
    cursor: pointer; font-family: inherit;
    transition: border-color 0.1s, background 0.1s;
  }
  .optional-btn:not(:disabled):active { background: #1e2a3e; }
  .optional-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .opt-icon { font-size: 1rem; }
  .opt-name { font-size: 0.6rem; color: #aaa; }
  .opt-status { font-size: 0.62rem; font-weight: bold; }
  .opt-status.ready { color: #c8a44a; }
  .opt-status.cd { color: #888; }
  .opt-status.cost { color: #555; }

  /* Abilities */
  .abilities-section { display: flex; flex-direction: column; gap: 3px; }
  .section-label {
    font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em;
    color: #c8a44a; border-top: 1px solid #2E2218; padding-top: 3px;
    margin-bottom: 1px;
  }

  .ability-row {
    background: #201912; border: 1px solid #2E2218;
    border-radius: 5px; padding: 5px 8px;
    display: flex; align-items: center; gap: 8px;
    transition: border-color 0.1s;
  }
  .ability-row.targeting { border-color: #c8a44a44; }

  .ability-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .ability-name { font-size: 0.72rem; color: #f0ece4; font-weight: 600; }
  .ability-desc { font-size: 0.58rem; color: #666; line-height: 1.3; }

  .ability-right {
    display: flex; align-items: center; gap: 4px; flex-shrink: 0;
  }
  .ability-btn {
    background: #1a2a4a; border: 1px solid #4a9eff;
    color: #4a9eff; border-radius: 4px;
    padding: 6px 10px; font-size: 0.65rem;
    font-family: inherit; cursor: pointer;
    white-space: nowrap; min-height: 32px;
    transition: background 0.1s;
  }
  .ability-btn.active { background: #2a3a5a; border-color: #c8a44a; color: #c8a44a; }
  .ability-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .ability-btn:not(:disabled):active { background: #2a3a5a; }
  .ready-dot { color: #4a8a4a; }
  .no-cash { color: #c05050; }

  .cd-bar { width: 32px; height: 3px; background: #2E2218; border-radius: 2px; overflow: hidden; }
  .cd-fill { height: 100%; background: #888; border-radius: 2px; transition: width 0.5s linear; }
  .cd-label { font-size: 0.6rem; color: #666; min-width: 22px; text-align: right; }

  .target-picker {
    background: #150F0A; border: 1px solid #c8a44a44;
    border-radius: 5px; padding: 5px 8px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .target-label { font-size: 0.58rem; color: #888; }
  .target-options { display: flex; flex-wrap: wrap; gap: 3px; }
  .target-btn {
    background: #1e2a3e; border: 1px solid #3a4a6a;
    color: #aaa; border-radius: 3px;
    padding: 6px 9px; font-size: 0.62rem;
    font-family: inherit; cursor: pointer; min-height: 32px;
    transition: background 0.1s, color 0.1s;
  }
  .target-btn:active, .target-btn:hover { background: #2a3a5a; color: #f0ece4; }
  .target-btn.rival-target { border-color: #7a2a2a; color: #e47a7a; }
  .target-btn.rival-target:active { background: #3a2020; }

  .reset-section { display: flex; justify-content: center; align-items: center; gap: 8px; padding-top: 8px; flex-wrap: wrap; }
  .dev-skip {
    background: #130E09;
    border: 1px solid #2E1E1E;
    color: #4A3030;
    border-radius: 4px;
    padding: 5px 6px;
    font-family: inherit;
    font-size: 0.62rem;
    cursor: pointer;
  }
  .dev-skip:focus { outline: 1px solid #5a3a3a; color: #886666; }
  .reset-btn {
    background: transparent;
    border: 1px solid #3a2a2a;
    color: #555;
    border-radius: 4px;
    padding: 5px 14px;
    font-family: inherit;
    font-size: 0.68rem;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
  .reset-btn:hover { border-color: #7a3a3a; color: #c0392b; }
  .reset-btn.confirm { border-color: #c0392b; color: #e74c3c; background: #1a0a0a; }
</style>
