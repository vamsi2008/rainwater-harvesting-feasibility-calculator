import React from 'react';
import {
  Droplet,
  Sprout,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  HydrologicalParameters,
  HydrologicalResults,
  ROOF_MATERIALS,
} from '../utils/hydrology';

export interface SavedScenarioSnapshot {
  id: string;
  timestamp: string;
  materialName: string;
  params: HydrologicalParameters;
  results: HydrologicalResults;
}

interface YieldDashboardProps {
  params: HydrologicalParameters;
  results: HydrologicalResults;
  snapshots: SavedScenarioSnapshot[];
  onLoadSnapshot: (params: HydrologicalParameters) => void;
  onDeleteSnapshot: (id: string) => void;
}

export const YieldDashboard: React.FC<YieldDashboardProps> = ({
  params,
  results,
  snapshots,
  onLoadSnapshot,
  onDeleteSnapshot,
}) => {
  // Compute proportional bar widths for the Visual Comparison Bar Chart
  const maxVolume = Math.max(
    results.annualHarvestableYieldLiters,
    results.annualNonPotableDemandLiters,
    params.tankCapacityLiters,
    1
  );

  const yieldBarWidth = Math.max(
    4,
    Math.round((results.annualHarvestableYieldLiters / maxVolume) * 100)
  );
  const demandBarWidth = Math.max(
    4,
    Math.round((results.annualNonPotableDemandLiters / maxVolume) * 100)
  );
  const tankBarWidth = Math.max(
    4,
    Math.round((params.tankCapacityLiters / maxVolume) * 100)
  );

  const turnoverDisplay = Number.isInteger(results.tankTurnoverMultiplier)
    ? `${results.tankTurnoverMultiplier}`
    : results.tankTurnoverMultiplier.toFixed(1);

  const activeMaterial =
    ROOF_MATERIALS.find((m) => m.id === params.materialId)?.name ||
    'Custom Surface';

  return (
    <div className="space-y-6">
      {/* A. 4-Card Quantitative Benchmark Grid */}
      <section
        id="hydrological-engine-grid"
        aria-label="Quantitative Hydrological Benchmark Metrics"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {/* Card 1: Annual Harvestable Yield (V) */}
        <div
          data-testid="card-annual-yield"
          className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Annual Harvestable Yield (V)
            </span>
            <span className="text-xs font-mono text-[#0D9488] font-medium">
              V = A × R × C
            </span>
          </div>
          <div className="my-1">
            <span
              data-testid="metric-annual-yield"
              className="text-2xl sm:text-3xl font-mono font-bold text-[#0F172A] tabular-nums"
            >
              {results.annualHarvestableYieldLiters.toLocaleString('en-US')} L/yr
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>
              {params.roofAreaSqm.toLocaleString('en-US')} m² ×{' '}
              {params.annualRainfallMm.toLocaleString('en-US')} mm ×{' '}
              {params.runoffCoefficient.toFixed(2)}
            </span>
            <span className="text-slate-400">{activeMaterial}</span>
          </div>
        </div>

        {/* Card 2: Annual Non-Potable Demand */}
        <div
          data-testid="card-annual-demand"
          className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Annual Non-Potable Demand
            </span>
            <span className="text-xs font-mono text-slate-500 font-medium">
              Daily Demand × Active Days
            </span>
          </div>
          <div className="my-1">
            <span
              data-testid="metric-annual-demand"
              className="text-2xl sm:text-3xl font-mono font-bold text-[#0F172A] tabular-nums"
            >
              {results.annualNonPotableDemandLiters.toLocaleString('en-US')} L/yr
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>
              {params.dailyDemandLiters.toLocaleString('en-US')} L/day ×{' '}
              {params.activeDemandDays} days
            </span>
            <span className="text-slate-400">Non-Drinking Load</span>
          </div>
        </div>

        {/* Card 3: Theoretical Demand Ratio */}
        <div
          data-testid="card-demand-ratio"
          className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Theoretical Demand Ratio
            </span>
            <span className="text-xs font-mono text-[#0D9488] font-medium">
              (Demand / V) × 100
            </span>
          </div>
          <div className="my-1 flex items-baseline gap-3">
            <span
              data-testid="metric-demand-ratio"
              className="text-2xl sm:text-3xl font-mono font-bold text-[#0F172A] tabular-nums"
            >
              {results.theoreticalDemandRatioPercent.toFixed(1)}%
            </span>
            <span
              className={`text-xs font-mono font-semibold ${
                results.feasibilityStatus === 'deficit'
                  ? 'text-[#D97706]'
                  : 'text-[#0D9488]'
              }`}
            >
              ({results.demandMetPercent}% of demand met)
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>
              {results.annualNonPotableDemandLiters.toLocaleString('en-US')} L ÷{' '}
              {results.annualHarvestableYieldLiters.toLocaleString('en-US')} L ratio
            </span>
            <span>
              {results.netAnnualBalanceLiters >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>
        </div>

        {/* Card 4: Peak Runoff Flow Rate (Q) */}
        <div
          data-testid="card-peak-flow"
          className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Peak Runoff Flow Rate (Q)
            </span>
            <span className="text-xs font-mono text-slate-500 font-medium">
              Q = (A × i × C) / 3600
            </span>
          </div>
          <div className="my-1">
            <span
              data-testid="metric-peak-flow"
              className="text-2xl sm:text-3xl font-mono font-bold text-[#0F172A] tabular-nums"
            >
              {results.peakRunoffFlowRateLps.toFixed(2)} L/s
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>At i = {params.peakIntensityMmHr} mm/hr intensity</span>
            <span className="text-slate-400">Civil Conduit Basis</span>
          </div>
        </div>
      </section>

      {/* B. Visual Comparison Bar Chart */}
      <section
        id="visual-comparison-chart"
        aria-labelledby="chart-section-heading"
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <span className="text-xs font-mono font-semibold text-[#0D9488] block mb-0.5">
              02. Volumetric Balance Visualization
            </span>
            <h3
              id="chart-section-heading"
              className="text-base font-bold text-[#0F172A]"
            >
              Annual Yield vs. Non-Potable Demand vs. Single Tank Capacity
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Annual harvest equals ~{turnoverDisplay} tank capacities
          </span>
        </div>

        <div className="space-y-4">
          {/* Bar 1: Annual Harvestable Yield */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">
                1. Annual Harvestable Yield (V)
              </span>
              <span className="font-mono font-bold text-[#0D9488] tabular-nums">
                {results.annualHarvestableYieldLiters.toLocaleString('en-US')} L
                (100% Reference Yield)
              </span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-md overflow-hidden">
              <div
                className="h-full bg-[#0D9488] rounded-md transition-transform duration-150 origin-left"
                style={{
                  width: `${yieldBarWidth}%`,
                }}
              />
            </div>
          </div>

          {/* Bar 2: Annual Non-Potable Demand */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">
                2. Annual Non-Potable Demand
              </span>
              <span className="font-mono font-bold text-[#0F172A] tabular-nums">
                {results.annualNonPotableDemandLiters.toLocaleString('en-US')} L (
                {results.theoreticalDemandRatioPercent.toFixed(1)}% of Annual
                Yield)
              </span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-md overflow-hidden">
              <div
                className="h-full bg-[#0F172A] rounded-md transition-transform duration-150 origin-left"
                style={{
                  width: `${demandBarWidth}%`,
                }}
              />
            </div>
          </div>

          {/* Bar 3: Single Tank Capacity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">
                3. Single Storage Tank Capacity
              </span>
              <span className="font-mono font-bold text-[#D97706] tabular-nums">
                {params.tankCapacityLiters.toLocaleString('en-US')} L (~
                {turnoverDisplay}x annual tank turnover ·{' '}
                {results.autonomyBufferDays} days buffer)
              </span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-md overflow-hidden">
              <div
                className="h-full bg-[#D97706] rounded-md transition-transform duration-150 origin-left"
                style={{
                  width: `${tankBarWidth}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Summary Line */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <span>
            <strong className="text-[#0F172A]">Hydrological Balance:</strong>{' '}
            {results.feasibilityMessage}
          </span>
          <span className="font-mono text-slate-500">
            Net Balance:{' '}
            {results.netAnnualBalanceLiters >= 0 ? '+' : ''}
            {results.netAnnualBalanceLiters.toLocaleString('en-US')} L/yr
          </span>
        </div>
      </section>

      {/* C. Sustainable Non-Potable Allocation Panel */}
      <section
        id="advisory-panel"
        aria-labelledby="advisory-panel-heading"
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <span className="text-xs font-mono font-semibold text-[#0D9488] block mb-0.5">
              03. Non-Potable Water Utilization Plan
            </span>
            <h3
              id="advisory-panel-heading"
              className="text-base font-bold text-[#0F172A]"
            >
              Sustainable Non-Potable Allocation Breakdown
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Strictly Non-Drinking Uses (100% of{' '}
            {results.usableAllocatedVolumeLiters.toLocaleString('en-US')} L/yr)
          </span>
        </div>

        <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
          {results.allocations.map((item) => {
            const Icon =
              item.id === 'flushing'
                ? Droplet
                : item.id === 'gardening'
                ? Sprout
                : Sparkles;
            return (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50/40 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                    <Icon
                      className="w-3.5 h-3.5 text-[#0D9488]"
                      aria-hidden="true"
                    />
                    <span>
                      {item.category} ({item.percentage}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {item.engineeringNote}
                  </p>
                </div>

                <div className="sm:text-right font-mono shrink-0">
                  <div className="text-sm font-bold text-[#0F172A] tabular-nums">
                    {item.annualVolumeLiters.toLocaleString('en-US')} L/yr
                  </div>
                  <div className="text-[11px] text-slate-500 tabular-nums">
                    ~{item.dailyActiveVolumeLiters.toLocaleString('en-US')}{' '}
                    L/active day
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Optional Saved Scenario Comparison Log (when user logs runs) */}
      {snapshots.length > 0 && (
        <section
          aria-label="Saved Scenario Comparison Log"
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-semibold text-[#0D9488] block">
                04. Comparative Engineering Runs
              </span>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Logged Calibration Snapshots ({snapshots.length})
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono">
                  <th className="py-2 pr-3 font-medium">Run / Material</th>
                  <th className="py-2 px-3 font-medium text-right">Area (A)</th>
                  <th className="py-2 px-3 font-medium text-right">Rain (R)</th>
                  <th className="py-2 px-3 font-medium text-right">Yield (V)</th>
                  <th className="py-2 px-3 font-medium text-right">Ratio</th>
                  <th className="py-2 pl-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {snapshots.map((snap) => (
                  <tr key={snap.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-3 font-sans">
                      <div className="font-semibold text-[#0F172A]">
                        {snap.materialName} (C={snap.params.runoffCoefficient.toFixed(2)})
                      </div>
                      <div className="text-[11px] text-slate-400">{snap.timestamp}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {snap.params.roofAreaSqm.toLocaleString('en-US')} m²
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {snap.params.annualRainfallMm.toLocaleString('en-US')} mm
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#0D9488] tabular-nums">
                      {snap.results.annualHarvestableYieldLiters.toLocaleString('en-US')} L/yr
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {snap.results.theoreticalDemandRatioPercent.toFixed(1)}%
                    </td>
                    <td className="py-2.5 pl-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onLoadSnapshot(snap.params)}
                          className="text-xs font-sans font-semibold text-[#0D9488] hover:underline cursor-pointer"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete snapshot ${snap.id}`}
                          onClick={() => onDeleteSnapshot(snap.id)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
