import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAMPUS_BENCHMARK_DEFAULTS,
  calculateAnnualYield,
  calculateAnnualDemand,
  calculateTheoreticalDemandRatio,
  calculatePeakRunoffFlowRate,
  evaluateHydrology,
  ROOF_MATERIALS,
} from './hydrology';

test('Campus Benchmark defaults match Review 1 (30% Prototype) specifications', () => {
  assert.equal(CAMPUS_BENCHMARK_DEFAULTS.roofAreaSqm, 500);
  assert.equal(CAMPUS_BENCHMARK_DEFAULTS.runoffCoefficient, 0.80);
  assert.equal(CAMPUS_BENCHMARK_DEFAULTS.annualRainfallMm, 800);
  assert.equal(CAMPUS_BENCHMARK_DEFAULTS.dailyDemandLiters, 1000);
  assert.equal(CAMPUS_BENCHMARK_DEFAULTS.activeDemandDays, 200);
  assert.equal(CAMPUS_BENCHMARK_DEFAULTS.tankCapacityLiters, 20000);
  assert.equal(CAMPUS_BENCHMARK_DEFAULTS.peakIntensityMmHr, 50);
});

test('Quantitative benchmark formulas compute exact default outputs', () => {
  const res = evaluateHydrology(CAMPUS_BENCHMARK_DEFAULTS);

  // 1. Annual Harvestable Yield: V = 500 * 800 * 0.80 = 320,000 L/yr
  assert.equal(res.annualHarvestableYieldLiters, 320000);

  // 2. Annual Non-Potable Demand: 1,000 * 200 = 200,000 L/yr
  assert.equal(res.annualNonPotableDemandLiters, 200000);

  // 3. Theoretical Demand Ratio: (200,000 / 320,000) * 100 = 62.5%
  assert.equal(res.theoreticalDemandRatioPercent, 62.5);
  assert.equal(res.demandMetPercent, 100);

  // 4. Peak Runoff Flow Rate: Q = (500 * 50 * 0.80) / 3600 = 5.56 L/s
  assert.equal(res.peakRunoffFlowRateLps, 5.56);

  // 5. Tank Turnover: 320,000 / 20,000 = 16x
  assert.equal(res.tankTurnoverMultiplier, 16);
  assert.equal(res.overflowStatus, 'high-overflow');
  assert.match(
    res.overflowAdvisoryMessage,
    /Overflow Advisory: Annual yield \(320,000 L\) is 16x the 20,000 L tank capacity/
  );
});

test('Material selector coefficients match Concrete (0.80), Tile (0.75), and Metal Sheet (0.90)', () => {
  const concrete = ROOF_MATERIALS.find((m) => m.id === 'concrete');
  const tile = ROOF_MATERIALS.find((m) => m.id === 'tile');
  const metal = ROOF_MATERIALS.find((m) => m.id === 'metal');

  assert.equal(concrete?.coefficient, 0.80);
  assert.equal(tile?.coefficient, 0.75);
  assert.equal(metal?.coefficient, 0.90);

  // Switching to Metal Sheet (C = 0.90) with 500 m² and 800 mm rainfall -> 360,000 L/yr
  assert.equal(calculateAnnualYield(500, 800, 0.90), 360000);
  // Switching to Tile Roof (C = 0.75) with 500 m² and 800 mm rainfall -> 300,000 L/yr
  assert.equal(calculateAnnualYield(500, 800, 0.75), 300000);
});

test('Non-potable water allocation splits into 45% flushing, 40% gardening, and 15% cleaning', () => {
  const res = evaluateHydrology(CAMPUS_BENCHMARK_DEFAULTS);
  assert.equal(res.allocations.length, 3);
  assert.equal(res.allocations[0].percentage, 45);
  assert.equal(res.allocations[0].annualVolumeLiters, 144000);
  assert.equal(res.allocations[1].percentage, 40);
  assert.equal(res.allocations[1].annualVolumeLiters, 128000);
  assert.equal(res.allocations[2].percentage, 15);
  assert.equal(res.allocations[2].annualVolumeLiters, 48000);
});

test('Deficit detection triggers when annual demand exceeds annual harvestable yield', () => {
  const deficitParams = {
    ...CAMPUS_BENCHMARK_DEFAULTS,
    roofAreaSqm: 150,
    annualRainfallMm: 400,
    dailyDemandLiters: 1500,
    activeDemandDays: 200,
  };
  const res = evaluateHydrology(deficitParams);
  // Yield = 150 * 400 * 0.8 = 48,000 L/yr; Demand = 300,000 L/yr
  assert.equal(res.annualHarvestableYieldLiters, 48000);
  assert.equal(res.annualNonPotableDemandLiters, 300000);
  assert.equal(res.feasibilityStatus, 'deficit');
  assert.equal(res.demandMetPercent, 16);
});
