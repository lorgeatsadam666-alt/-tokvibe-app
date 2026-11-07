import React from 'react';
import { FilterPreset } from '../types';

export const FILTER_PRESETS: { id: FilterPreset; label: string; icon: string; cssFilter: string }[] = [
  { id: 'none', label: 'Original', icon: '✨', cssFilter: 'none' },
  { id: 'vhs', label: 'VHS Rétro', icon: '📼', cssFilter: 'contrast(125%) brightness(105%) saturate(140%) hue-rotate(-10deg)' },
  { id: 'sunset', label: 'Sunset Doré', icon: '🌅', cssFilter: 'sepia(30%) saturate(155%) contrast(110%) brightness(105%)' },
  { id: 'noir', label: 'Noir & Blanc', icon: '🎬', cssFilter: 'grayscale(100%) contrast(140%) brightness(95%)' },
  { id: 'beauty', label: 'Éclat Beauté', icon: '💖', cssFilter: 'brightness(112%) contrast(104%) saturate(120%)' },
  { id: 'vintage90s', label: 'Vintage 90s', icon: '🎞️', cssFilter: 'sepia(45%) contrast(115%) brightness(95%) saturate(110%)' },
];

export function getFilterCss(preset: FilterPreset): string {
  const found = FILTER_PRESETS.find((f) => f.id === preset);
  return found ? found.cssFilter : 'none';
}

interface FilterSelectorProps {
  currentFilter: FilterPreset;
  onSelect: (filter: FilterPreset) => void;
  onClose: () => void;
}

export const FilterSelectorDrawer: React.FC<FilterSelectorProps> = ({
  currentFilter,
  onSelect,
  onClose,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-0 z-40 bg-black/85 backdrop-blur-xl border-t border-white/10 p-4 pb-8 rounded-t-3xl shadow-2xl transition-all">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-wide uppercase text-white/90">Filtres Visuels</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/30">Live FX</span>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-white/60 hover:text-white bg-white/10 px-2.5 py-1 rounded-full transition"
        >
          Fermer
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-1">
        {FILTER_PRESETS.map((f) => {
          const isActive = currentFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onSelect(f.id)}
              className={`flex flex-col items-center gap-1.5 shrink-0 transition-transform active:scale-95 ${
                isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl relative overflow-hidden transition-all shadow-md ${
                  isActive
                    ? 'ring-2 ring-[#FE2C55] ring-offset-2 ring-offset-black bg-gradient-to-br from-[#FE2C55]/30 to-[#25F4EE]/30'
                    : 'bg-white/10 hover:bg-white/15 border border-white/10'
                }`}
              >
                <span>{f.icon}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-[#FE2C55]/20 animate-pulse pointer-events-none" />
                )}
              </div>
              <span className={`text-[11px] font-medium tracking-tight whitespace-nowrap ${isActive ? 'text-[#25F4EE] font-bold' : 'text-white/80'}`}>
                {f.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
