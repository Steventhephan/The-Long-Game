// Synthesized game audio via Web Audio API.
// All functions are no-ops until unlockAudio() is called on the first user gesture.

let ctx: AudioContext | null = null;
let unlocked = false;

function ac(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch { return null; }
  }
  return ctx;
}

export function unlockAudio(): void {
  if (unlocked) return;
  const c = ac();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  unlocked = true;
}

function tone(
  freq: number,
  freqEnd: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  startDelay = 0,
): void {
  const c = ac();
  if (!c || !unlocked) return;
  const t0 = c.currentTime + startDelay;

  const osc  = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd !== freq) osc.frequency.exponentialRampToValueAtTime(freqEnd, t0 + duration);

  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

  osc.start(t0);
  osc.stop(t0 + duration + 0.01);
}

// ---------------------------------------------------------------------------
// Tap — short percussive knock
// ---------------------------------------------------------------------------

export function playTap(): void {
  tone(300, 150, 0.06, 'triangle', 0.22);
}

// ---------------------------------------------------------------------------
// Crit — upward sweep + sparkle overtone
// ---------------------------------------------------------------------------

export function playCrit(): void {
  tone(420, 900,  0.14, 'sawtooth', 0.18);
  tone(1300, 1300, 0.18, 'sine',    0.10, 0.05);
}

// ---------------------------------------------------------------------------
// Win — ascending C-E-G-C arpeggio
// ---------------------------------------------------------------------------

export function playWin(): void {
  const notes = [261.63, 329.63, 392.00, 523.25];
  notes.forEach((f, i) => tone(f, f, 0.28, 'sine', 0.22, i * 0.1));
}

// ---------------------------------------------------------------------------
// Loss — descending G-Eb-C-G minor phrase
// ---------------------------------------------------------------------------

export function playLoss(): void {
  const notes = [392.00, 311.13, 261.63, 196.00];
  notes.forEach((f, i) => tone(f, f * 0.98, 0.38, 'sine', 0.18, i * 0.16));
}
