/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import {
  CAMPUS_BENCHMARK_DEFAULTS,
  HydrologicalParameters,
  evaluateHydrology,
  ROOF_MATERIALS,
} from './utils/hydrology';
import { Header } from './components/Header';
import { ParameterPanel } from './components/ParameterPanel';
import {
  YieldDashboard,
  SavedScenarioSnapshot,
} from './components/YieldDashboard';

export default function App() {
  const [params, setParams] = useState<HydrologicalParameters>(
    CAMPUS_BENCHMARK_DEFAULTS
  );
  const [activePresetId, setActivePresetId] = useState<string>('campus-benchmark');
  const [snapshots, setSnapshots] = useState<SavedScenarioSnapshot[]>([]);

  const results = useMemo(() => evaluateHydrology(params), [params]);

  const handleUpdateParams = (updated: Partial<HydrologicalParameters>) => {
    setParams((prev) => ({
      ...prev,
      ...updated,
    }));
    setActivePresetId('custom');
  };

  const handleSelectPreset = (
    presetId: string,
    presetParams: HydrologicalParameters
  ) => {
    setParams(presetParams);
    setActivePresetId(presetId);
  };

  const handleResetBenchmark = () => {
    setParams(CAMPUS_BENCHMARK_DEFAULTS);
    setActivePresetId('campus-benchmark');
  };

  const handleSaveSnapshot = () => {
    const materialName =
      ROOF_MATERIALS.find((m) => m.id === params.materialId)?.name ||
      'Custom Surface';
    const newSnapshot: SavedScenarioSnapshot = {
      id: `run-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      materialName,
      params: { ...params },
      results,
    };
    setSnapshots((prev) => [newSnapshot, ...prev.slice(0, 5)]);
  };

  const handleDeleteSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Top Navigation Header & Project Hero */}
      <Header
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        onResetBenchmark={handleResetBenchmark}
        onSaveSnapshot={handleSaveSnapshot}
        savedCount={snapshots.length}
      />

      {/* Main Workspace (Split 2-Column Layout) */}
      <main
        id="calculator-workspace"
        className="flex-1 max-w-[1380px] w-full mx-auto px-6 py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Parameter Panel & Catchment Material Selector */}
          <div className="lg:col-span-5">
            <ParameterPanel
              params={params}
              annualDemandLiters={results.annualNonPotableDemandLiters}
              onChangeParams={handleUpdateParams}
              onResetBenchmark={handleResetBenchmark}
            />
          </div>

          {/* Right Column: Real-Time Yield Dashboard & Automated Advisory Panel */}
          <div className="lg:col-span-7">
            <YieldDashboard
              params={params}
              results={results}
              snapshots={snapshots}
              onLoadSnapshot={(loadedParams) => {
                setParams(loadedParams);
                setActivePresetId('custom');
              }}
              onDeleteSnapshot={handleDeleteSnapshot}
            />
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="bg-[#0F172A] text-slate-400 border-t border-slate-800 py-5 px-6">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-semibold text-white">
              Rainwater Harvesting Feasibility Calculator
            </span>
            <span aria-hidden="true" className="mx-2 text-slate-600">•</span>
            <span>Integrated Digital Planning Tool for Yield Estimation, Storage Sizing &amp; Microbial Safety</span>
          </div>
          <div className="font-mono text-slate-500">
            CSE • Bioinformatics • Civil Engineering • Biotechnology
          </div>
        </div>
      </footer>
    </div>
  );
}
