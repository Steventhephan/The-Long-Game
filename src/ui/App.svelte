<script lang="ts">
  import Header from './Header.svelte';
  import CampaignTab from './CampaignTab.svelte';
  import OperationTab from './OperationTab.svelte';
  import PlatformTab from './PlatformTab.svelte';
  import LegacyTab from './LegacyTab.svelte';
  import ResultModal from './ResultModal.svelte';
  import PolicyModal from './PolicyModal.svelte';
  import MinigameModal from './MinigameModal.svelte';
  import EventModal from './EventModal.svelte';
  import PresidencyWinOverlay from './PresidencyWinOverlay.svelte';
  import { gameStore } from '../state/store';
  import { policyModalIssueId, closePolicyModal } from '../state/uiStore';
  import { eraForOffice } from '../sim/platform';
  import { TICKER_LINES } from '../config/flavor';
  import { unlockAudio } from '../audio/sounds';

  type Tab = 'campaign' | 'operation' | 'platform' | 'legacy';
  let activeTab: Tab = 'campaign';

  const operationUnlocked = true;
  const platformUnlocked = true; // Stances matter from City Council onward

  $: era = eraForOffice($gameStore.officeIndex);
  $: tickerContent = (TICKER_LINES[era] ?? TICKER_LINES['local']).join('  ·  ');
</script>

<div class="app-shell" on:pointerdown={unlockAudio}>
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

  <div class="ticker-wrap" aria-hidden="true">
    <div class="ticker-track">
      <span class="ticker-text">{tickerContent}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{tickerContent}</span>
    </div>
  </div>

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
  <PresidencyWinOverlay />

  {#if $policyModalIssueId !== null}
    <PolicyModal initialIssueId={$policyModalIssueId} on:close={closePolicyModal} />
  {/if}

  <MinigameModal />
  <EventModal />
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

  .ticker-wrap {
    flex-shrink: 0;
    min-width: 0;
    width: 100%;
    overflow: hidden;
    background: #0D0A06;
    border-top: 1px solid #1E1610;
    height: 22px;
    display: flex;
    align-items: center;
  }

  .ticker-track {
    white-space: nowrap;
    animation: ticker-scroll 55s linear infinite;
    will-change: transform;
  }

  .ticker-text {
    font-size: 0.52rem;
    color: #4A3C30;
    font-style: italic;
    letter-spacing: 0.03em;
    padding-left: 12px;
  }

  @keyframes ticker-scroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ticker-track { animation: none; }
  }

  .tab-bar {
    display: flex;
    background: #130E09;
    border-top: 1px solid #2E2218;
    flex-shrink: 0;
  }

  .tab-btn {
    flex: 1;
    padding: 9px 4px 7px;
    min-height: 36px;
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
