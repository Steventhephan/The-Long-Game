<script lang="ts">
  import { gameStore, formatNum } from '../state/store';
  import { knockDoors } from '../sim/election';
  import { clearSave, saveGame } from '../persist/autosave';
  import { defaultState } from '../state/gameState';

  $: state = $gameStore;

  // Knock button — each tap spawns an independent floater
  interface Floater { id: number; text: string; isCrit: boolean; dx: number; }
  let floaters: Floater[] = [];
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

    const duration = isCrit ? 1200 : 750;
    setTimeout(() => { floaters = floaters.filter(f => f.id !== id); }, duration);

    // Button glow follows the most recent crit
    if (isCrit) {
      critFlash = true;
      if (critGlowTimeout) clearTimeout(critGlowTimeout);
      critGlowTimeout = setTimeout(() => { critFlash = false; }, 600);
    }

    if ('vibrate' in navigator) navigator.vibrate(isCrit ? [30, 10, 30] : 15);
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
      <span class="knock-crit-hint">5% crit</span>
    </button>
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
    top: 50px;
    left: 50%;
    z-index: 5;
    font-size: 1.4rem;
    font-weight: bold;
    color: #a8d8ff;
    -webkit-text-stroke: 1.5px #000;
    pointer-events: none;
    white-space: nowrap;
    animation: float-up 0.75s ease-out forwards;
  }
  .knock-feedback.crit {
    color: #f1c40f;
    font-size: 1.6rem;
    text-shadow: 0 0 14px rgba(241, 196, 15, 0.7);
    animation: float-up 1.0s ease-out forwards;
  }
  /* --dx drives the horizontal drift; translateX(-50%) centres the origin */
  @keyframes float-up {
    from { opacity: 1; transform: translateX(calc(-50% + 0px))       translateY(0)    scale(1); }
    to   { opacity: 0; transform: translateX(calc(-50% + var(--dx))) translateY(-48px) scale(0.8); }
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
  .knock-label { font-size: 0.85rem; letter-spacing: 0.12em; }
  .knock-crit-hint { font-size: 0.6rem; color: #888; letter-spacing: 0.05em; }

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
