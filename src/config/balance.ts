// Locked v1 constants from Build Quickstart §4.
// Numbers marked TUNING TARGET may be adjusted during playtesting.

export const BAL = {
  generatorCostGrowth: 1.15,
  rungCostMultiplier: 8,
  rungOutputMultiplier: 7,
  critBaseChance: 0.05,
  critChanceCap: 0.50,
  critMultiplier: 5,
  prestigePerPoint: 0.02,
  officeWeight: (i: number) => 2 ** i,
  synergyDiminish: 0.85,
  blocSupportMin: 0.5,
  blocSupportMax: 3.0,
  multiplierCapByEra: { local: 50, county: 250, state: 1000, federal: 5000 } as Record<string, number>,
  volunteerMult: (v: number) => 1 + Math.log10(1 + v) / 2,
  flipFlopCostGrowth: 2,
  flipFlopTrustErosion: 0.7,
  generalTimerBase: 90,
  timerGrowth: 1.4,
  primaryTimerRatio: 0.6,
  primaryPoolRatio: 0.35,
  poolBase: 5000,
  poolGrowth: 4.3,
  runoffSeconds: 20,
} as const;

// Phase-1 tuning targets — adjust freely during playtesting.
export const PHASE1 = {
  tapVoters: 7,           // TUNING TARGET: calibrated for ~4 taps/sec human; 4×7=28/s ≈ rival's ~25/s
  tapCash: 2,             // TUNING TARGET: proportionally reduced so first generator still costs ~9s of tapping
  playerBaseConv: 0.5,    // TUNING TARGET: passive player voters/sec per bloc (drip only; tap is the driver)
  rivalBaseRate: 30,      // TUNING TARGET: rival base rate; with lean-matching gives ~25 effective/s — near a 1-tap/s player
  canvasserOutput: 2.0,   // TUNING TARGET: Field gen rung-0 voters/sec per owned (10× prev; 3 units = +6/s tiebreaker)
  smallDollarOutput: 2.0, // TUNING TARGET: Finance gen rung-0 cash/sec per owned (4× prev; funds field purchases)
} as const;
