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
  flipFlopBaseCost: 50, // TUNING TARGET: cash cost of first stance flip; doubles each subsequent (×flipFlopCostGrowth)
} as const;

// Phase-1 tuning targets — adjust freely during playtesting.
export const PHASE1 = {
  tapVoters: 3,        // TUNING TARGET: 3/tap; at 4 taps/sec = 12/s — rival ~14.85/s, generators close the gap
  tapCash: 2,          // TUNING TARGET: proportionally reduced; first generator costs ~9s of tapping
  playerBaseConv: 0.5, // TUNING TARGET: passive player voters/sec per bloc (minor drip; tap is the driver)
  // rivalBaseRate removed — each office now has its own rivalRate in config/offices.ts
  // canvasserOutput / smallDollarOutput removed — live in GeneratorDef.baseOutput in config/generators.ts
} as const;
