<script lang="ts">
  import { gameStore, formatNum } from '../state/store';
  import { computeStack, computeUpgradeEffects } from '../sim/election';
  import { computePerkEffects } from '../sim/prestige';
  import { BAL } from '../config/balance';
  import { generatorsForOffice, generatorCost, generatorOutput, maxAffordable, bulkCost } from '../config/generators';
  import { upgradesForOffice } from '../config/upgrades';
  import { saveGame } from '../persist/autosave';
  import type { GeneratorDef } from '../types';

  $: state = $gameStore;
  $: effects = computeUpgradeEffects(state);
  $: perkEffects = computePerkEffects(state);
  $: stack = computeStack(state);
  $: unlocked = generatorsForOffice(state.officeIndex);
  $: fieldGens = unlocked.filter(g => g.track === 'field');
  $: financeGens = unlocked.filter(g => g.track === 'finance');

  function genCostMult(g: GeneratorDef): number {
    return g.track === 'field' ? perkEffects.fieldCostMult : perkEffects.financeCostMult;
  }

  // Volunteer display
  $: volunteerRate = BAL.baseVolunteerRate + state.charisma * BAL.charismaVolunteerRate;

  // Live aggregate output rates (includes upgrades + global stack)
  $: totalFieldRate = fieldGens.reduce((sum, g) => {
    const owned = state.generators[g.id] ?? 0;
    return sum + owned * g.baseOutput * effects.fieldMult * stack;
  }, 0);
  $: totalCashRate = financeGens.reduce((sum, g) => {
    const owned = state.generators[g.id] ?? 0;
    return sum + owned * g.baseOutput * effects.financeMult * stack;
  }, 0);

  function genOutputRate(g: GeneratorDef): number {
    const mult = g.track === 'field' ? effects.fieldMult : effects.financeMult;
    return generatorOutput(g, state.generators[g.id] ?? 0) * mult * stack;
  }

  function buyGenerator(def: GeneratorDef, qty: number) {
    const owned = state.generators[def.id] ?? 0;
    const cm = genCostMult(def);
    const cost = bulkCost(def, owned, qty, cm);
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
    const cm = genCostMult(def);
    const qty = maxAffordable(def, state.generators[def.id] ?? 0, state.cash, cm);
    if (qty > 0) buyGenerator(def, qty);
  }

  // Upgrades — unpurchased first (original order), purchased last grouped by category
  $: availableUpgrades = upgradesForOffice(state.officeIndex);
  const CATEGORY_ORDER: Record<string, number> = { tap: 0, field: 1, finance: 2, synergy: 3 };
  $: sortedUpgrades = [...availableUpgrades].sort((a, b) => {
    const aPurch = state.upgrades.includes(a.id);
    const bPurch = state.upgrades.includes(b.id);
    if (aPurch !== bPurch) return aPurch ? 1 : -1;
    if (aPurch) return (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99);
    return 0;
  });

  function buyUpgrade(id: string, cost: number) {
    if (state.cash < cost || state.upgrades.includes(id)) return;
    const newState = {
      ...state,
      cash: state.cash - cost,
      upgrades: [...state.upgrades, id],
    };
    gameStore.set(newState);
    saveGame(newState);
  }
</script>

<div class="operation-tab">

  <!-- Output summary -->
  <div class="summary-section">
    <div class="summary-row">
      <span class="summary-label">Volunteers</span>
      <span class="summary-value volunteers">{formatNum(state.volunteers)}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Accrual rate</span>
      <span class="summary-value vol-rate">+{volunteerRate.toFixed(1)}/s
        {#if state.charisma > 0}<span class="charisma-tag">(Charisma {state.charisma})</span>{/if}
      </span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Field output</span>
      <span class="summary-value field">{formatNum(totalFieldRate)} voters/s</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Finance output</span>
      <span class="summary-value finance">${formatNum(totalCashRate)}/s</span>
    </div>
    {#if effects.tapMult > 1 || effects.fieldMult > 1 || effects.financeMult > 1}
      <div class="summary-row mults">
        {#if effects.tapMult > 1}<span class="mult-tag">Tap ×{effects.tapMult}</span>{/if}
        {#if effects.fieldMult > 1}<span class="mult-tag field">Field ×{effects.fieldMult}</span>{/if}
        {#if effects.financeMult > 1}<span class="mult-tag finance">Finance ×{effects.financeMult}</span>{/if}
        <span class="mult-tag stack">Stack ×{stack.toFixed(2)}</span>
      </div>
    {/if}
  </div>

  <!-- Generator tracks -->
  {#each [{ label: 'Field', unit: 'voters/s', gens: fieldGens }, { label: 'Finance', unit: '$/s', gens: financeGens }] as track}
    <div class="gen-section">
      <div class="section-header">{track.label} <span class="unit">{track.unit}</span></div>
      {#each track.gens as g}
        {@const owned = state.generators[g.id] ?? 0}
        {@const cm = genCostMult(g)}
        {@const cost1 = generatorCost(g, owned, cm)}
        {@const canBuy1 = state.cash >= cost1}
        {@const maxQty = maxAffordable(g, owned, state.cash, cm)}
        {@const rate = genOutputRate(g)}
        <div class="gen-row" class:affordable={canBuy1}>
          <div class="gen-meta">
            <span class="gen-name">{g.name}</span>
            <div class="gen-stats">
              <span class="gen-owned">×{owned}</span>
              {#if owned > 0}
                <span class="gen-rate {g.track}">{formatNum(rate)}/s</span>
              {:else}
                <span class="gen-rate dim">{formatNum(g.baseOutput)}/s each</span>
              {/if}
            </div>
          </div>
          <div class="gen-buttons">
            {#if maxQty > 1}
              <button class="buy-btn buy-max" on:click={() => buyMax(g)}>Max {maxQty}</button>
            {/if}
            <button class="buy-btn" disabled={!canBuy1} on:click={() => buyGenerator(g, 1)}>
              ${formatNum(cost1)}
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/each}

  <!-- Upgrades -->
  {#if availableUpgrades.length > 0}
    <div class="gen-section">
      <div class="section-header">Upgrades</div>
      {#each sortedUpgrades as u}
        {@const purchased = state.upgrades.includes(u.id)}
        {@const canBuy = !purchased && state.cash >= u.cost}
        <div class="upgrade-row" class:purchased class:affordable={canBuy}>
          <div class="gen-meta">
            <span class="gen-name" class:dim={purchased}>{u.name}</span>
            <span class="gen-rate dim">{u.description}</span>
          </div>
          {#if purchased}
            <span class="bought-badge">✓ Bought</span>
          {:else}
            <button
              class="buy-btn"
              disabled={!canBuy}
              on:click={() => buyUpgrade(u.id, u.cost)}
            >${formatNum(u.cost)}</button>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

</div>

<style>
  .operation-tab {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Summary */
  .summary-section {
    background: #1C1510;
    border: 1px solid #2E2218;
    border-radius: 6px;
    padding: 6px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .summary-row { display: flex; justify-content: space-between; align-items: center; }
  .summary-row.mults { flex-wrap: wrap; gap: 3px; margin-top: 1px; }
  .summary-label { font-size: 0.6rem; color: #888; text-transform: uppercase; letter-spacing: 0.06em; }
  .summary-value { font-size: 0.85rem; font-weight: bold; color: #f0ece4; }
  .summary-value.field      { color: #4a9eff; }
  .summary-value.finance    { color: #c8a44a; }
  .summary-value.volunteers { color: #a0e080; }
  .summary-value.vol-rate   { color: #a0e080; font-size: 0.72rem; }
  .charisma-tag { font-size: 0.58rem; color: #70b060; margin-left: 3px; }
  .mult-tag {
    font-size: 0.58rem;
    padding: 1px 5px;
    border-radius: 3px;
    background: #2E2218;
    color: #aaa;
    letter-spacing: 0.04em;
  }
  .mult-tag.field   { color: #4a9eff; background: #1a2a3e; }
  .mult-tag.finance { color: #c8a44a; background: #2a1e10; }
  .mult-tag.stack   { color: #a0e080; background: #1a2a1a; }

  /* Generator sections */
  .gen-section { display: flex; flex-direction: column; gap: 4px; }
  .section-header {
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #c8a44a;
    border-top: 1px solid #2E2218;
    padding-top: 3px;
  }
  .unit { color: #666; font-size: 0.58rem; }

  .gen-row {
    background: #201912;
    border: 1px solid #2E2218;
    border-radius: 5px;
    padding: 5px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 6px;
    opacity: 0.75;
    transition: opacity 0.1s, border-color 0.1s;
  }
  .gen-row.affordable { opacity: 1; border-color: #3A2E1A; }

  .gen-meta { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
  .gen-name { font-size: 0.75rem; color: #f0ece4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .gen-name.dim { color: #777; }
  .gen-stats { display: flex; gap: 6px; align-items: center; }
  .gen-owned { font-size: 0.62rem; color: #888; }
  .gen-rate { font-size: 0.6rem; }
  .gen-rate.field   { color: #4a9eff; }
  .gen-rate.finance { color: #c8a44a; }
  .gen-rate.dim     { color: #555; }

  .gen-buttons { display: flex; gap: 3px; flex-shrink: 0; }
  .buy-btn {
    background: #2a3a5a;
    border: 1px solid #4a9eff;
    color: #4a9eff;
    border-radius: 3px;
    padding: 6px 8px;
    font-size: 0.65rem;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.1s;
    white-space: nowrap;
    min-height: 32px;
  }
  .buy-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .buy-btn:not(:disabled):active { background: #3a4a6a; }
  .buy-max { border-color: #c8a44a; color: #c8a44a; background: #2a2510; }

  /* Upgrades */
  .upgrade-row {
    background: #201912;
    border: 1px solid #2E2218;
    border-radius: 5px;
    padding: 5px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 6px;
    opacity: 0.55;
    transition: opacity 0.1s, border-color 0.1s;
  }
  .upgrade-row.affordable { opacity: 1; border-color: #3a5a3a; }
  .upgrade-row.purchased  { opacity: 0.4; border-color: #2E2218; }
  .bought-badge { font-size: 0.62rem; color: #4a8a4a; white-space: nowrap; }
</style>
