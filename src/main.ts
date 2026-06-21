import App from './ui/App.svelte';
import { gameStore, initStore } from './state/store';
import { tick } from './sim/election';
import { startAutosave, saveGame } from './persist/autosave';

// ── Bootstrap ────────────────────────────────────────────────────────────────

initStore();

const app = new App({ target: document.getElementById('app')! });

// ── Game loop (fixed-timestep, 20 Hz tick, decoupled from render) ─────────────

const TICK_STEP = 1 / 20; // seconds
let lastTime = performance.now();
let accumulator = 0;

function gameLoop(now: number): void {
  if (!document.hidden) {
    const dt = Math.min((now - lastTime) / 1000, 0.1); // cap spiral at 100ms
    accumulator += dt;

    while (accumulator >= TICK_STEP) {
      try {
        gameStore.update(s => tick(s, TICK_STEP));
      } catch (e) {
        console.error('[tick]', e);
      }
      accumulator -= TICK_STEP;
    }
  }
  lastTime = now;
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// ── Autosave ─────────────────────────────────────────────────────────────────

let latestState = null as Parameters<typeof saveGame>[0] | null;
gameStore.subscribe(s => { latestState = s; });

startAutosave(() => latestState ?? ({} as Parameters<typeof saveGame>[0]));

// Save on page hide (visibilitychange handled inside startAutosave).
window.addEventListener('beforeunload', () => {
  if (latestState) saveGame(latestState);
});

export default app;
