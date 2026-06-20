<script lang="ts">
  import { gameStore, formatNum } from '../state/store';
  import { knockDoors } from '../sim/election';
  import { clearSave, saveGame } from '../persist/autosave';
  import { defaultState } from '../state/gameState';
  import { GENERATORS, generatorCost, generatorOutput, maxAffordable, bulkCost } from '../config/generators';
  import type { GeneratorDef } from '../types';

  $: state = $gameStore;

  // Knock button
  let critFlash = false;
  let knockFeedback = '';
  let feedbackKey = 0; // increments each tap to force animation reset
  let feedbackTimeout: ReturnType<typeof setTimeout> | null = null;

  function onKnock() {
    const prev = state.voters;
    const newState = knockDoors(state);
    gameStore.set(newState);
    saveGame(newState);

    const gained = Math.round(newState.voters - prev);
    critFlash = newState.lastCritHit;
    knockFeedback = newState.lastCritHit ? `★ CRIT! +${gained} ★` : `+${gained}`;
    feedbackKey += 1;

    if (feedbackTimeout) clearTimeout(feedbackTimeout);
    const duration = newState.lastCritHit ? 1200 : 700;
    feedbackTimeout = setTimeout(() => { knockFeedback = ''; critFlash = false; }, duration);

    if ('vibrate' in navigator) navigator.vibrate(newState.lastCritHit ? [30, 10, 30] : 15);
  }

  // Generators available at this office
  $: availableGenerators = GENERATORS.filter(g => g.unlockOffice === 'city_council');
  $: fieldGens = availableGenerators.filter(g => g.track === 'field');
  $: financeGens = availableGenerators.filter(g => g.track === 'finance');

  function buyGenerator(def: GeneratorDef, qty: number) {
    const owned = state.generators[def.id] ?? 0;
    const cost = bulkCost(def, owned, qty);
    if (state.cash < cost) return;
    const newState = {
      ...state,
      cash: state.cash - cost,
      generators: { ...state.generators, [def.id]: owned + qty },
    };
    gameStore.set(newState);
    saveGame(newState);
  }

  function buyMax(def: GeneratorDef) {
    const owned = state.generators[def.id] ?? 0;
    const qty = maxAffordable(def, owned, state.cash);
    if (qty > 0) buyGenerator(def, qty);
  }

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
</script>

<div class="campaign-tab">
  <!-- Knock button -->
  <div class="knock-section">
    {#if knockFeedback}
      {#key feedbackKey}
        <div class="knock-feedback" class:crit={critFlash}>{knockFeedback}</div>
      {/key}
    {/if}
    <button
      class="knock-btn"
      class:crit={critFlash}
      on:pointerdown|preventDefault={onKnock}
      disabled={state.electionResult !== 'none'}
      aria-label="Knock on Doors"
    >
      <span class="knock-icon">🚪</span>
      <span class="knock-label">Knock on Doors</span>
    </button>
    <p class="knock-hint">5% chance of a ×5 crit</p>
  </div>

  <!-- Generators -->
  <div class="generators-section">
    {#if fieldGens.length > 0}
      <div class="gen-track-label">Field <span class="track-desc">voters/sec</span></div>
      {#each fieldGens as def}
        {@const owned = state.generators[def.id] ?? 0}
        {@const cost1 = generatorCost(def, owned)}
        {@const canBuy1 = state.cash >= cost1}
        {@const maxQty = maxAffordable(def, owned, state.cash)}
        <div class="generator-row" class:affordable={canBuy1}>
          <div class="gen-info">
            <span class="gen-name">{def.name}</span>
            <span class="gen-owned">×{owned}</span>
            <span class="gen-output">{formatNum(generatorOutput(def, owned))}/s</span>
          </div>
          <div class="gen-buttons">
            {#if maxQty > 1}
              <button
                class="buy-btn buy-max"
                on:click={() => buyMax(def)}
              >Max {maxQty}</button>
            {/if}
            <button
              class="buy-btn"
              disabled={!canBuy1}
              on:click={() => buyGenerator(def, 1)}
            >${formatNum(cost1)}</button>
          </div>
        </div>
      {/each}
    {/if}

    {#if financeGens.length > 0}
      <div class="gen-track-label">Finance <span class="track-desc">cash/sec</span></div>
      {#each financeGens as def}
        {@const owned = state.generators[def.id] ?? 0}
        {@const cost1 = generatorCost(def, owned)}
        {@const canBuy1 = state.cash >= cost1}
        {@const maxQty = maxAffordable(def, owned, state.cash)}
        <div class="generator-row" class:affordable={canBuy1}>
          <div class="gen-info">
            <span class="gen-name">{def.name}</span>
            <span class="gen-owned">×{owned}</span>
            <span class="gen-output">${formatNum(generatorOutput(def, owned))}/s</span>
          </div>
          <div class="gen-buttons">
            {#if maxQty > 1}
              <button
                class="buy-btn buy-max"
                on:click={() => buyMax(def)}
              >Max {maxQty}</button>
            {/if}
            <button
              class="buy-btn"
              disabled={!canBuy1}
              on:click={() => buyGenerator(def, 1)}
            >${formatNum(cost1)}</button>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Reset save -->
  <div class="reset-section">
    <button class="reset-btn" class:confirm={confirmReset} on:click={onResetClick}>
      {confirmReset ? '⚠️ Tap again to confirm reset' : 'Reset Save'}
    </button>
  </div>

  <!-- Bloc breakdown -->
  <div class="blocs-section">
    <div class="section-label">Blocs</div>
    {#each state.blocs as bloc}
      {@const pool = bloc.totalVoters}
      {@const playerShare = pool > 0 ? bloc.player / pool : 0}
      {@const rivalShare = pool > 0 ? (bloc.rivals[0] ?? 0) / pool : 0}
      <div class="bloc-row">
        <span class="bloc-name">{bloc.groupId.replace(/_/g, ' ')}</span>
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
    flex: 1;
    overflow-y: auto;
    padding: 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Knock button */
  .knock-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    position: relative;
  }
  .knock-feedback {
    position: absolute;
    /* Sits near the top of the 160px button, floats upward through it.
       Positive top keeps it inside .campaign-tab's overflow-y container. */
    top: 55px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 5;
    font-size: 1.05rem;
    font-weight: bold;
    color: #4a9eff;
    pointer-events: none;
    white-space: nowrap;
    animation: float-up 0.7s ease-out forwards;
  }
  .knock-feedback.crit {
    color: #f1c40f;
    font-size: 1.45rem;
    text-shadow: 0 0 12px rgba(241, 196, 15, 0.8);
    animation: crit-float 1.2s ease-out forwards;
  }
  /* translateX(-50%) must be included in every keyframe since it's on the element */
  @keyframes float-up {
    from { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
    to   { opacity: 0; transform: translateX(-50%) translateY(-44px) scale(0.85); }
  }
  @keyframes crit-float {
    0%   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.1); }
    15%  { opacity: 1; transform: translateX(-50%) translateY(-10px) scale(1.25); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-44px) scale(0.9); }
  }

  .knock-btn {
    width: 160px; height: 160px;
    border-radius: 50%;
    border: 4px solid #c8a44a;
    background: #1e2a4a;
    color: #f0ece4;
    font-family: inherit;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    touch-action: none;
    box-shadow: 0 0 0 0 rgba(241, 196, 15, 0);
    transition: transform 0.08s, background 0.1s, border-color 0.1s, box-shadow 0.15s;
    user-select: none;
  }
  .knock-btn:active { transform: scale(0.93); background: #263554; }
  .knock-btn.crit {
    border-color: #f1c40f;
    background: #2a2210;
    box-shadow: 0 0 22px 6px rgba(241, 196, 15, 0.4);
  }
  .knock-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .knock-icon { font-size: 2.5rem; line-height: 1; }
  .knock-label { font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; }
  .knock-hint { font-size: 0.65rem; color: #888; }

  /* Generators */
  .generators-section { display: flex; flex-direction: column; gap: 8px; }
  .gen-track-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #c8a44a;
    padding-top: 4px;
    border-top: 1px solid #2a2a3e;
  }
  .track-desc { color: #666; font-size: 0.65rem; }

  .generator-row {
    background: #1e1e30;
    border: 1px solid #2a2a3e;
    border-radius: 6px;
    padding: 8px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    opacity: 0.6;
    transition: opacity 0.1s, border-color 0.1s;
  }
  .generator-row.affordable { opacity: 1; border-color: #3a3a5a; }

  .gen-info { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
  .gen-name { font-size: 0.85rem; color: #f0ece4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .gen-owned { font-size: 0.7rem; color: #888; }
  .gen-output { font-size: 0.65rem; color: #4a9eff; }

  .gen-buttons { display: flex; gap: 4px; }
  .buy-btn {
    background: #2a3a5a;
    border: 1px solid #4a9eff;
    color: #4a9eff;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.72rem;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.1s;
    white-space: nowrap;
  }
  .buy-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .buy-btn:not(:disabled):active { background: #3a4a6a; }
  .buy-max { border-color: #c8a44a; color: #c8a44a; background: #2a2510; }

  /* Blocs */
  .blocs-section { display: flex; flex-direction: column; gap: 6px; }
  .section-label {
    font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em;
    color: #c8a44a; border-top: 1px solid #2a2a3e; padding-top: 4px;
  }
  .bloc-row { display: flex; align-items: center; gap: 6px; }
  .bloc-name { font-size: 0.68rem; color: #aaa; min-width: 90px; text-transform: capitalize; }
  .bloc-bar { flex: 1; height: 8px; background: #3a3a5a; border-radius: 4px; overflow: hidden; position: relative; }
  .bloc-fill { position: absolute; top: 0; height: 100%; transition: width 0.2s; border-radius: 4px; }
  .bloc-fill.you   { left: 0;  background: #4a9eff; }
  .bloc-fill.rival { right: 0; background: #e74c3c; }
  .bloc-pct { font-size: 0.68rem; color: #4a9eff; min-width: 30px; text-align: right; }

  .reset-section { display: flex; justify-content: center; padding-top: 8px; }
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
