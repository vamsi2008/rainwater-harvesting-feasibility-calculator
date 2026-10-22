import React from 'react';
import { RotateCcw, BookmarkPlus, Compass } from 'lucide-react';
import { PRESET_SCENARIOS, HydrologicalParameters } from '../utils/hydrology';

interface HeaderProps {
  activePresetId: string;
  onSelectPreset: (presetId: string, params: HydrologicalParameters) => void;
  onResetBenchmark: () => void;
  onSaveSnapshot: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activePresetId,
  onSelectPreset,
  onResetBenchmark,
  onSaveSnapshot,
  savedCount,
}) => {
  return (
    <div className="bg-[#0F172A] text-white border-b border-slate-800">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="max-w-[1380px] mx-auto px-6 py-3.5 flex items-center justify-between gap-8 border-b border-slate-800/80">
        <a
          href="#top"
          className="text-sm font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <Compass className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
          <span>RWH Engineering Console</span>
        </a>

        <nav
          aria-label="Primary Workspace Navigation"
          className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300"
        >
          <a
            href="#parameter-entry-panel"
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Parameter Calibration
          </a>
          <a
            href="#hydrological-engine-grid"
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Yield Metrics
          </a>
          <a
            href="#visual-comparison-chart"
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Volumetric Balance
          </a>
          <a
            href="#advisory-panel"
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Baseline Advisory
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onResetBenchmark}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Benchmark</span>
          </button>
        </div>
      </header>

      {/* Project Title & Multidisciplinary Pillars */}
      <div id="top" className="max-w-[1380px] mx-auto px-6 py-6">
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono text-teal-400 tracking-wide">
            <span>CSE</span>
            <span aria-hidden="true" className="text-slate-600">•</span>
            <span>Bioinformatics</span>
            <span aria-hidden="true" className="text-slate-600">•</span>
            <span>Civil Engineering</span>
            <span aria-hidden="true" className="text-slate-600">•</span>
            <span>Biotechnology</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Rainwater Harvesting Feasibility Calculator
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Integrated Digital Planning Tool for Yield Estimation, Storage Sizing &amp; Microbial Safety
          </p>
        </div>

        {/* Interactive Reference Presets & Snapshot Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-1">
              Reference Profiles:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-lg">
              {PRESET_SCENARIOS.map((preset) => {
                const isActive = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectPreset(preset.id, preset.params)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#0D9488] text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onSaveSnapshot}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
            <span>Log Run to Comparison Table ({savedCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
