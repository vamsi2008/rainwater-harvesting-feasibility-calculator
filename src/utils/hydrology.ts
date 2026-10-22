export type RoofMaterialId = 'concrete' | 'tile' | 'metal' | 'custom';

export interface RoofMaterialOption {
  id: Exclude<RoofMaterialId, 'custom'>;
  name: string;
  coefficient: number;
  surfaceDescription: string;
  roughnessNotes: string;
}

export const ROOF_MATERIALS: RoofMaterialOption[] = [
  {
    id: 'concrete',
    name: 'Concrete Roof',
    coefficient: 0.80,
    surfaceDescription: 'Reinforced concrete slab (RCC) with standard waterproofing screed',
    roughnessNotes: 'Moderate absorption & evaporation loss (20% retention)',
  },
  {
    id: 'tile',
    name: 'Tile Roof',
    coefficient: 0.75,
    surfaceDescription: 'Interlocking clay or vitrified ceramic roofing tiles',
    roughnessNotes: 'Higher joint micro-retention & porous absorption (25% loss)',
  },
  {
    id: 'metal',
    name: 'Metal Sheet Roof',
    coefficient: 0.90,
    surfaceDescription: 'Corrugated GI / Galvalume coated profile sheets',
    roughnessNotes: 'Rapid laminar runoff with minimal surface wetting (10% loss)',
  },
];

export interface HydrologicalParameters {
  roofAreaSqm: number;          // A: 50 to 5000 m² (Default: 500)
  materialId: RoofMaterialId;   // Default: 'concrete'
  runoffCoefficient: number;    // C: 0.10 to 0.98 (Default: 0.80)
  annualRainfallMm: number;     // R: 100 to 3000 mm (Default: 800)
  dailyDemandLiters: number;    // Default: 1000 L/day
  activeDemandDays: number;     // Default: 200 days/year
  tankCapacityLiters: number;   // Default: 20000 L (1000 to 100000 L)
  peakIntensityMmHr: number;    // i: Default: 50 mm/hour
}

export const CAMPUS_BENCHMARK_DEFAULTS: HydrologicalParameters = {
  roofAreaSqm: 500,
  materialId: 'concrete',
  runoffCoefficient: 0.80,
  annualRainfallMm: 800,
  dailyDemandLiters: 1000,
  activeDemandDays: 200,
  tankCapacityLiters: 20000,
  peakIntensityMmHr: 50,
};

export interface PresetScenario {
  id: string;
  label: string;
  subtitle: string;
  params: HydrologicalParameters;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'campus-benchmark',
    label: 'Campus Academic Block (Benchmark)',
    subtitle: '500 m² Concrete Roof · 800 mm Rainfall',
    params: CAMPUS_BENCHMARK_DEFAULTS,
  },
  {
    id: 'lab-annex',
    label: 'Biotech Research Annex',
    subtitle: '1,200 m² Metal Sheet · 1,100 mm Rainfall',
    params: {
      roofAreaSqm: 1200,
      materialId: 'metal',
      runoffCoefficient: 0.90,
      annualRainfallMm: 1100,
      dailyDemandLiters: 2400,
      activeDemandDays: 250,
      tankCapacityLiters: 50000,
      peakIntensityMmHr: 65,
    },
  },
  {
    id: 'hostel-wing',
    label: 'Residential Hostel Wing B',
    subtitle: '850 m² Tile Roof · 650 mm Semi-Arid',
    params: {
      roofAreaSqm: 850,
      materialId: 'tile',
      runoffCoefficient: 0.75,
      annualRainfallMm: 650,
      dailyDemandLiters: 2200,
      activeDemandDays: 280,
      tankCapacityLiters: 35000,
      peakIntensityMmHr: 45,
    },
  },
];

export interface NonPotableAllocationItem {
  id: string;
  category: string;
  percentage: number;
  annualVolumeLiters: number;
  dailyActiveVolumeLiters: number;
  engineeringNote: string;
}

export interface HydrologicalResults {
  // 1. Annual Harvestable Yield (V = A * R * C)
  annualHarvestableYieldLiters: number;
  // 2. Annual Non-Potable Demand (Daily Demand * Active Days)
  annualNonPotableDemandLiters: number;
  // 3. Theoretical Demand Ratio ((Annual Non-Potable Demand / V) * 100)
  theoreticalDemandRatioPercent: number;
  // Percentage of demand met by harvestable yield (capped at 100% for practical coverage, plus raw ratio)
  demandMetPercent: number;
  yieldCoverageRatioPercent: number;
  // 4. Peak Runoff Flow Rate (Q = (A * i * C) / 3600)
  peakRunoffFlowRateLps: number;
  // Tank turnover / ratio (V / Tank Capacity)
  tankTurnoverMultiplier: number;
  // Surplus or deficit volume (V - Demand)
  netAnnualBalanceLiters: number;
  // Storage detention days (Tank Capacity / Daily Demand)
  autonomyBufferDays: number;
  // Overflow advisory status
  overflowStatus: 'high-overflow' | 'moderate-turnover' | 'oversized-storage';
  overflowAdvisoryTitle: string;
  overflowAdvisoryMessage: string;
  // Demand feasibility status
  feasibilityStatus: 'surplus' | 'balanced' | 'deficit';
  feasibilityMessage: string;
  // Sustainable Non-Potable Allocation Breakdown (based on usable harvested water)
  usableAllocatedVolumeLiters: number;
  allocations: NonPotableAllocationItem[];
}

export function calculateAnnualYield(
  roofAreaSqm: number,
  annualRainfallMm: number,
  runoffCoefficient: number
): number {
  return Math.round(roofAreaSqm * annualRainfallMm * runoffCoefficient);
}

export function calculateAnnualDemand(
  dailyDemandLiters: number,
  activeDemandDays: number
): number {
  return Math.round(dailyDemandLiters * activeDemandDays);
}

export function calculateTheoreticalDemandRatio(
  annualDemandLiters: number,
  annualYieldLiters: number
): number {
  if (annualYieldLiters <= 0) return 0;
  return Number(((annualDemandLiters / annualYieldLiters) * 100).toFixed(1));
}

export function calculatePeakRunoffFlowRate(
  roofAreaSqm: number,
  peakIntensityMmHr: number,
  runoffCoefficient: number
): number {
  const q = (roofAreaSqm * peakIntensityMmHr * runoffCoefficient) / 3600;
  return Number(q.toFixed(2));
}

export function evaluateHydrology(params: HydrologicalParameters): HydrologicalResults {
  const annualHarvestableYieldLiters = calculateAnnualYield(
    params.roofAreaSqm,
    params.annualRainfallMm,
    params.runoffCoefficient
  );

  const annualNonPotableDemandLiters = calculateAnnualDemand(
    params.dailyDemandLiters,
    params.activeDemandDays
  );

  const theoreticalDemandRatioPercent = calculateTheoreticalDemandRatio(
    annualNonPotableDemandLiters,
    annualHarvestableYieldLiters
  );

  const yieldCoverageRatioPercent =
    annualNonPotableDemandLiters > 0
      ? Number(((annualHarvestableYieldLiters / annualNonPotableDemandLiters) * 100).toFixed(1))
      : 100;

  const demandMetPercent = Math.min(100, yieldCoverageRatioPercent);

  const peakRunoffFlowRateLps = calculatePeakRunoffFlowRate(
    params.roofAreaSqm,
    params.peakIntensityMmHr,
    params.runoffCoefficient
  );

  const tankTurnoverMultiplier =
    params.tankCapacityLiters > 0
      ? Number((annualHarvestableYieldLiters / params.tankCapacityLiters).toFixed(1))
      : 0;

  const netAnnualBalanceLiters = annualHarvestableYieldLiters - annualNonPotableDemandLiters;

  const autonomyBufferDays =
    params.dailyDemandLiters > 0
      ? Number((params.tankCapacityLiters / params.dailyDemandLiters).toFixed(1))
      : 0;

  // Evaluate Storage & Overflow Advisory Rule
  let overflowStatus: HydrologicalResults['overflowStatus'] = 'moderate-turnover';
  let overflowAdvisoryTitle = 'Balanced Seasonal Turnover';
  let overflowAdvisoryMessage = '';

  const formattedYield = annualHarvestableYieldLiters.toLocaleString('en-US');
  const formattedTank = params.tankCapacityLiters.toLocaleString('en-US');
  const turnoverDisplay = Number.isInteger(tankTurnoverMultiplier)
    ? `${tankTurnoverMultiplier}x`
    : `${tankTurnoverMultiplier.toFixed(1)}x`;

  if (tankTurnoverMultiplier >= 3) {
    overflowStatus = 'high-overflow';
    overflowAdvisoryTitle = 'Overflow Advisory';
    overflowAdvisoryMessage = `Overflow Advisory: Annual yield (${formattedYield} L) is ${turnoverDisplay} the ${formattedTank} L tank capacity. Periodic drawdown and overflow routing required.`;
  } else if (tankTurnoverMultiplier >= 1) {
    overflowStatus = 'moderate-turnover';
    overflowAdvisoryTitle = 'Moderate Storage Cycling';
    overflowAdvisoryMessage = `Storage Advisory: Annual yield (${formattedYield} L) equals ${turnoverDisplay} the ${formattedTank} L tank capacity. Standard seasonal fill-and-draw cycling applies.`;
  } else {
    overflowStatus = 'oversized-storage';
    overflowAdvisoryTitle = 'Oversized Cistern Capacity';
    overflowAdvisoryMessage = `Sizing Notice: Proposed tank (${formattedTank} L) exceeds total annual yield (${formattedYield} L, ${turnoverDisplay} fill ratio). Consider downsizing storage to reduce civil capital cost.`;
  }

  // Evaluate Feasibility Status
  let feasibilityStatus: HydrologicalResults['feasibilityStatus'] = 'surplus';
  let feasibilityMessage = '';

  if (theoreticalDemandRatioPercent <= 85) {
    feasibilityStatus = 'surplus';
    feasibilityMessage = `100% of annual non-potable demand met (${theoreticalDemandRatioPercent}% of total yield utilized; ${Math.max(0, netAnnualBalanceLiters).toLocaleString('en-US')} L/yr recharge surplus).`;
  } else if (theoreticalDemandRatioPercent <= 100) {
    feasibilityStatus = 'balanced';
    feasibilityMessage = `100% of annual demand theoretically covered, operating near tight hydrological margin (${theoreticalDemandRatioPercent}% yield utilization).`;
  } else {
    feasibilityStatus = 'deficit';
    feasibilityMessage = `Harvested yield covers ${demandMetPercent}% of annual demand. Supplemental municipal or recycled water required for ${Math.abs(netAnnualBalanceLiters).toLocaleString('en-US')} L/yr deficit.`;
  }

  // Sustainable Non-Potable Allocation Breakdown (45% Toilet Flushing, 40% Gardening, 15% Cleaning)
  const usableAllocatedVolumeLiters = annualHarvestableYieldLiters;
  const activeDays = Math.max(1, params.activeDemandDays);

  const allocations: NonPotableAllocationItem[] = [
    {
      id: 'flushing',
      category: 'Toilet Flushing & Sanitation',
      percentage: 45,
      annualVolumeLiters: Math.round(usableAllocatedVolumeLiters * 0.45),
      dailyActiveVolumeLiters: Math.round((usableAllocatedVolumeLiters * 0.45) / activeDays),
      engineeringNote: 'Dual-plumbing gravity header supply to cisterns & urinals',
    },
    {
      id: 'gardening',
      category: 'Gardening & Landscaping',
      percentage: 40,
      annualVolumeLiters: Math.round(usableAllocatedVolumeLiters * 0.40),
      dailyActiveVolumeLiters: Math.round((usableAllocatedVolumeLiters * 0.40) / activeDays),
      engineeringNote: 'Drip irrigation & campus greenbelt soil moisture maintenance',
    },
    {
      id: 'cleaning',
      category: 'Campus/Surface Cleaning',
      percentage: 15,
      annualVolumeLiters: Math.round(usableAllocatedVolumeLiters * 0.15),
      dailyActiveVolumeLiters: Math.round((usableAllocatedVolumeLiters * 0.15) / activeDays),
      engineeringNote: 'Paved courtyard washing, lab floor mopping & exterior maintenance',
    },
  ];

  return {
    annualHarvestableYieldLiters,
    annualNonPotableDemandLiters,
    theoreticalDemandRatioPercent,
    demandMetPercent,
    yieldCoverageRatioPercent,
    peakRunoffFlowRateLps,
    tankTurnoverMultiplier,
    netAnnualBalanceLiters,
    autonomyBufferDays,
    overflowStatus,
    overflowAdvisoryTitle,
    overflowAdvisoryMessage,
    feasibilityStatus,
    feasibilityMessage,
    usableAllocatedVolumeLiters,
    allocations,
  };
}
