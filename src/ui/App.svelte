<script lang="ts">
  import Header from './Header.svelte';
  import CampaignTab from './CampaignTab.svelte';
  import OperationTab from './OperationTab.svelte';
  import PlatformTab from './PlatformTab.svelte';
  import LegacyTab from './LegacyTab.svelte';
  import ResultModal from './ResultModal.svelte';
  import PolicyModal from './PolicyModal.svelte';
  import { gameStore } from '../state/store';
  import { policyModalIssueId, closePolicyModal } from '../state/uiStore';

  type Tab = 'campaign' | 'operation' | 'platform' | 'legacy';
  let activeTab: Tab = 'campaign';

  const operationUnlocked = true;
  const platformUnlocked = true; // Stances matter from City Council onward
</script>

<div class="app-shell">
  <Header />

  <main class="tab-content">
    {#if activeTab === 'campaign'}
      <CampaignTab />
    {:else if activeTab === 'operation'}
      <OperationTab />
    {:else if activeTab === 'platform'}
      <PlatformTab />
    {:else if activeTab === 'legacy'}
      <LegacyTab />
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
    <button
      class="tab-btn"
      class:active={activeTab === 'platform'}
      on:click={() => activeTab = 'platform'}
    >Platform</button>
    <button
      class="tab-btn"
      class:active={activeTab === 'legacy'}
      on:click={() => activeTab = 'legacy'}
    >Legacy</button>
  </nav>

  <ResultModal />

  {#if $policyModalIssueId !== null}
    <PolicyModal initialIssueId={$policyModalIssueId} on:close={closePolicyModal} />
  {/if}
</div>

<style>
  .app-shell {
    height: 100%;
    display: flex;
    flex-direction: column;
    max-width: 480px;
    margin: 0 auto;
    overflow: hidden;
    position: relative; /* scopes position:absolute overlays to game container */
  }

  .tab-content {
    flex: 1;
    min-height: 0;
    position: relative; /* each tab is absolutely positioned to the same rectangle */
    overflow: hidden;
  }

  .tab-bar {
    display: flex;
    background: #111122;
    border-top: 1px solid #2a2a3e;
    flex-shrink: 0;
  }

  .tab-btn {
    flex: 1;
    padding: 7px 4px 5px;
    background: transparent;
    border: none;
    border-top: 2px solid transparent;
    color: #888;
    font-family: inherit;
    font-size: 0.62rem;
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
