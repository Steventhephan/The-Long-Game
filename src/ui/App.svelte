<script lang="ts">
  import Header from './Header.svelte';
  import CampaignTab from './CampaignTab.svelte';
  import OperationTab from './OperationTab.svelte';
  import ResultModal from './ResultModal.svelte';
  import { gameStore } from '../state/store';

  type Tab = 'campaign' | 'operation';
  let activeTab: Tab = 'campaign';

  // Operation unlocks once the player has purchased any generator.
  $: operationUnlocked = Object.values($gameStore.generators).some(v => v > 0);
</script>

<div class="app-shell">
  <Header />

  <main class="tab-content">
    {#if activeTab === 'campaign'}
      <CampaignTab />
    {:else if activeTab === 'operation'}
      <OperationTab />
    {/if}
  </main>

  <nav class="tab-bar">
    <button
      class="tab-btn"
      class:active={activeTab === 'campaign'}
      on:click={() => activeTab = 'campaign'}
    >Campaign</button>
    <button
      class="tab-btn"
      class:active={activeTab === 'operation'}
      class:locked={!operationUnlocked}
      disabled={!operationUnlocked}
      on:click={() => activeTab = 'operation'}
      title={operationUnlocked ? '' : 'Buy a generator to unlock'}
    >Operation</button>
    <button class="tab-btn locked" disabled title="Unlocks later">Platform</button>
    <button class="tab-btn locked" disabled title="Unlocks later">Legacy</button>
  </nav>

  <ResultModal />
</div>

<style>
  .app-shell {
    height: 100%;
    display: flex;
    flex-direction: column;
    max-width: 480px;
    margin: 0 auto;
  }

  .tab-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .tab-bar {
    display: flex;
    background: #111122;
    border-top: 1px solid #2a2a3e;
    flex-shrink: 0;
  }

  .tab-btn {
    flex: 1;
    padding: 10px 4px 8px;
    background: transparent;
    border: none;
    border-top: 2px solid transparent;
    color: #888;
    font-family: inherit;
    font-size: 0.68rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }

  .tab-btn.active {
    color: #c8a44a;
    border-top-color: #c8a44a;
  }

  .tab-btn.locked {
    opacity: 0.25;
    cursor: not-allowed;
  }
</style>
