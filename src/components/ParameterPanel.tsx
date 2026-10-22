import React from 'react';
import { RotateCcw, Layers, CloudRain, Droplets, Database, Gauge } from 'lucide-react';
import {
  HydrologicalParameters,
  ROOF_MATERIALS,
  RoofMaterialId,
} from '../utils/hydrology';

interface ParameterPanelProps {
  params: HydrologicalParameters;
  annualDemandLiters: number;
  onChangeParams: (updated: Partial<HydrologicalParameters>) => void;
  onResetBenchmark: () => void;
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({
  params,
  annualDemandLiters,
  onChangeParams,
  onResetBenchmark,
}) => {
  const handleMaterialSelect = (
    materialId: Exclude<RoofMaterialId, 'custom'>,
    coefficient: number
  ) => {
    onChangeParams({
      materialId,
      runoffCoefficient: coefficient,
    });
  };

  const handleManualCoefficientChange = (value: number) => {
    const clamped = Math.min(0.98, Math.max(0.1, Number(value.toFixed(2))));
    const matchedMaterial = ROOF_MATERIALS.find(
      (m) => Math.abs(m.coefficient - clamped) < 0.005
    );
    onChangeParams({
      runoffCoefficient: clamped,
      materialId: matchedMaterial ? matchedMaterial.id : 'custom',
    });
  };

  const clampOrParse = (rawValue: string, min: number, max: number, fallback: number) => {
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
  };

  return (
    <section
      id="parameter-entry-panel"
      aria-labelledby="param-panel-heading"
      className="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
    >
      {/* Panel Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-mono font-semibold text-[#0D9488] block mb-1">
            01. Hydrological Input Calibration
          </span>
          <h2
            id="param-panel-heading"
            className="text-lg font-bold text-[#0F172A] tracking-tight"
          >
            Site &amp; Catchment Parameters
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time parametric inputs driving runoff yield, tank turnover, and peak flow
          </p>
        </div>
      </div>

      {/* 1. Roof Catchment Area (A) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="input-roof-area"
            className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
            <span>Roof Catchment Area (A)</span>
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="input-roof-area"
              type="number"
              min={50}
              max={5000}
              step={10}
              value={params.roofAreaSqm}
              onChange={(e) =>
                onChangeParams({
                  roofAreaSqm: clampOrParse(e.target.value, 50, 5000, 500),
                })
              }
              className="w-24 px-2.5 py-1 text-right font-mono text-sm font-semibold text-[#0F172A] bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-[#0D9488]"
            />
            <span className="text-xs font-mono text-slate-500 w-7">m²</span>
          </div>
        </div>
        <input
          aria-label="Roof Catchment Area Slider"
          type="range"
          min={50}
          max={5000}
          step={10}
          value={params.roofAreaSqm}
          onChange={(e) => onChangeParams({ roofAreaSqm: Number(e.target.value) })}
          className="w-full bg-slate-200 rounded-lg"
        />
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>Min: 50 m²</span>
          <span>Campus Benchmark: 500 m²</span>
          <span>Max: 5,000 m²</span>
        </div>
      </div>

      {/* 2. Catchment Material Selector & Runoff Coefficient (C) */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-800">
            Catchment Material Selector
          </span>
          <span
            data-testid="active-runoff-coefficient"
            className="text-xs font-mono font-semibold text-[#0D9488]"
          >
            Active C = {params.runoffCoefficient.toFixed(2)}
          </span>
        </div>

        <div
          role="radiogroup"
          aria-label="Catchment Material Selector"
          className="grid grid-cols-1 gap-2"
        >
          {ROOF_MATERIALS.map((material) => {
            const isSelected =
              params.materialId === material.id &&
              Math.abs(params.runoffCoefficient - material.coefficient) < 0.005;
            return (
              <button
                key={material.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() =>
                  handleMaterialSelect(material.id, material.coefficient)
                }
                className={`w-full text-left px-3.5 py-2.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-teal-50/80 border-[#0D9488] text-[#0F172A]'
                    : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#0F172A]">
                    {material.name}
                    {material.id === 'concrete' && (
                      <span className="ml-1.5 text-[11px] font-normal text-slate-500">
                        (Default)
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {material.surfaceDescription}
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-[#0D9488] shrink-0">
                  C = {material.coefficient.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Manual Fine-Tuning for Runoff Coefficient C */}
        <div className="pt-1 flex items-center justify-between gap-3">
          <label
            htmlFor="input-runoff-coeff"
            className="text-xs font-medium text-slate-600"
          >
            Fine-Tune Runoff Coefficient (C):
          </label>
          <div className="flex items-center gap-2">
            <input
              aria-label="Runoff Coefficient Fine-Tune Slider"
              type="range"
              min={0.5}
              max={0.95}
              step={0.01}
              value={params.runoffCoefficient}
              onChange={(e) => handleManualCoefficientChange(Number(e.target.value))}
              className="w-24 bg-slate-200 rounded-lg"
            />
            <input
              id="input-runoff-coeff"
              type="number"
              min={0.1}
              max={0.98}
              step={0.01}
              value={params.runoffCoefficient.toFixed(2)}
              onChange={(e) => handleManualCoefficientChange(Number(e.target.value))}
              className="w-16 px-2 py-1 text-right font-mono text-xs font-semibold text-[#0F172A] bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-[#0D9488]"
            />
          </div>
        </div>
      </div>

      {/* 3. Annual Rainfall (R) */}
      <div className="pt-4 border-t border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="input-annual-rainfall"
            className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"
          >
            <CloudRain className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
            <span>Annual Rainfall (R)</span>
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="input-annual-rainfall"
              type="number"
              min={100}
              max={3000}
              step={25}
              value={params.annualRainfallMm}
              onChange={(e) =>
                onChangeParams({
                  annualRainfallMm: clampOrParse(e.target.value, 100, 3000, 800),
                })
              }
              className="w-24 px-2.5 py-1 text-right font-mono text-sm font-semibold text-[#0F172A] bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-[#0D9488]"
            />
            <span className="text-xs font-mono text-slate-500 w-7">mm</span>
          </div>
        </div>
        <input
          aria-label="Annual Rainfall Slider"
          type="range"
          min={100}
          max={3000}
          step={25}
          value={params.annualRainfallMm}
          onChange={(e) =>
            onChangeParams({ annualRainfallMm: Number(e.target.value) })
          }
          className="w-full bg-slate-200 rounded-lg"
        />
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>Arid: 100 mm</span>
          <span>Benchmark: 800 mm</span>
          <span>High Monsoon: 3,000 mm</span>
        </div>
      </div>

      {/* 4. Non-Potable Demand Parameters (Daily Demand & Active Days) */}
      <div className="pt-4 border-t border-slate-200 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="input-daily-demand"
              className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"
            >
              <Droplets className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
              <span>Daily Non-Potable Water Demand</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="input-daily-demand"
                type="number"
                min={100}
                max={20000}
                step={50}
                value={params.dailyDemandLiters}
                onChange={(e) =>
                  onChangeParams({
                    dailyDemandLiters: clampOrParse(
                      e.target.value,
                      100,
                      20000,
                      1000
                    ),
                  })
                }
                className="w-24 px-2.5 py-1 text-right font-mono text-sm font-semibold text-[#0F172A] bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-[#0D9488]"
              />
              <span className="text-xs font-mono text-slate-500 w-10">L/day</span>
            </div>
          </div>
          <input
            aria-label="Daily Non-Potable Water Demand Slider"
            type="range"
            min={100}
            max={10000}
            step={50}
            value={Math.min(10000, params.dailyDemandLiters)}
            onChange={(e) =>
              onChangeParams({ dailyDemandLiters: Number(e.target.value) })
            }
            className="w-full bg-slate-200 rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="input-active-days"
              className="text-sm font-semibold text-slate-800"
            >
              Active Demand Days per Year
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="input-active-days"
                type="number"
                min={30}
                max={365}
                step={5}
                value={params.activeDemandDays}
                onChange={(e) =>
                  onChangeParams({
                    activeDemandDays: clampOrParse(e.target.value, 30, 365, 200),
                  })
                }
                className="w-24 px-2.5 py-1 text-right font-mono text-sm font-semibold text-[#0F172A] bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-[#0D9488]"
              />
              <span className="text-xs font-mono text-slate-500 w-10">days/yr</span>
            </div>
          </div>
          <input
            aria-label="Active Demand Days Slider"
            type="range"
            min={30}
            max={365}
            step={5}
            value={params.activeDemandDays}
            onChange={(e) =>
              onChangeParams({ activeDemandDays: Number(e.target.value) })
            }
            className="w-full bg-slate-200 rounded-lg"
          />
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-500">
              Calculated Annual Non-Potable Demand:
            </span>
            <span
              data-testid="inline-annual-demand-readout"
              className="font-mono font-bold text-[#0F172A]"
            >
              {annualDemandLiters.toLocaleString('en-US')} L/yr
            </span>
          </div>
        </div>
      </div>

      {/* 5. Proposed Storage Tank Capacity */}
      <div className="pt-4 border-t border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="input-tank-capacity"
            className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"
          >
            <Database className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
            <span>Proposed Storage Tank Capacity</span>
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="input-tank-capacity"
              type="number"
              min={1000}
              max={100000}
              step={1000}
              value={params.tankCapacityLiters}
              onChange={(e) =>
                onChangeParams({
                  tankCapacityLiters: clampOrParse(
                    e.target.value,
                    1000,
                    100000,
                    20000
                  ),
                })
              }
              className="w-24 px-2.5 py-1 text-right font-mono text-sm font-semibold text-[#0F172A] bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-[#0D9488]"
            />
            <span className="text-xs font-mono text-slate-500 w-7">L</span>
          </div>
        </div>
        <input
          aria-label="Proposed Storage Tank Capacity Slider"
          type="range"
          min={1000}
          max={100000}
          step={1000}
          value={params.tankCapacityLiters}
          onChange={(e) =>
            onChangeParams({ tankCapacityLiters: Number(e.target.value) })
          }
          className="w-full bg-slate-200 rounded-lg"
        />
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>Min: 1,000 L</span>
          <span>Benchmark: 20,000 L</span>
          <span>Max: 100,000 L</span>
        </div>
      </div>

      {/* 6. Peak Rainfall Intensity (i) */}
      <div className="pt-4 border-t border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="input-peak-intensity"
            className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"
          >
            <Gauge className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
            <span>Peak Rainfall Intensity (i)</span>
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="input-peak-intensity"
              type="number"
              min={10}
              max={200}
              step={5}
              value={params.peakIntensityMmHr}
              onChange={(e) =>
                onChangeParams({
                  peakIntensityMmHr: clampOrParse(e.target.value, 10, 200, 50),
                })
              }
              className="w-24 px-2.5 py-1 text-right font-mono text-sm font-semibold text-[#0F172A] bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-[#0D9488]"
            />
            <span className="text-xs font-mono text-slate-500 w-11">mm/hr</span>
          </div>
        </div>
        <input
          aria-label="Peak Rainfall Intensity Slider"
          type="range"
          min={10}
          max={200}
          step={5}
          value={params.peakIntensityMmHr}
          onChange={(e) =>
            onChangeParams({ peakIntensityMmHr: Number(e.target.value) })
          }
          className="w-full bg-slate-200 rounded-lg"
        />
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>Light: 10 mm/hr</span>
          <span>Benchmark: 50 mm/hr</span>
          <span>Cloudburst: 200 mm/hr</span>
        </div>
      </div>

      {/* Reset to Campus Benchmark Button */}
      <div className="pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onResetBenchmark}
          className="w-full py-2.5 px-4 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
          <span>Reset to Campus Benchmark (500 m²)</span>
        </button>
      </div>
    </section>
  );
};
