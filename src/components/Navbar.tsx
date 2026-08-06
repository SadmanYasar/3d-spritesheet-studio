import React from 'react';
import { ModelAsset, Preset } from '../types';
import { Sparkles, Upload, Box, RefreshCw, Grid, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface NavbarProps {
  onGenerate: () => void;
  isGenerating: boolean;
  progressPct: number;
  progressText: string;
  selectedModel: ModelAsset;
  onUploadClick: () => void;
  presets: Preset[];
  onSelectPreset: (preset: Preset) => void;
  activeView: 'studio' | 'interactive';
  setActiveView: (view: 'studio' | 'interactive') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export function Navbar({
  onGenerate,
  isGenerating,
  progressPct,
  progressText,
  selectedModel,
  onUploadClick,
  presets,
  onSelectPreset,
  activeView,
  setActiveView,
  theme,
  toggleTheme,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-black border-b-2 border-black dark:border-white px-4 py-3 shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[0px_4px_0px_0px_rgba(255,255,255,0.2)] transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2 uppercase">
              <span>3D Spritesheet Studio</span>
              <Badge variant="emerald" className="text-[10px]">
                PRO
              </Badge>
            </h1>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono hidden sm:block">
              360° Multi-Axis Spritesheet Generator & Cursor Look-At Simulator
            </p>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center bg-zinc-200 dark:bg-zinc-900 p-1 rounded-md border-2 border-black dark:border-zinc-700">
          <Button
            variant={activeView === 'studio' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('studio')}
            className="rounded-sm"
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Generator</span>
          </Button>

          <Button
            variant={activeView === 'interactive' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('interactive')}
            className="rounded-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Look-At Simulator</span>
          </Button>
        </div>

        {/* Main Action Buttons & Theme Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Theme Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="gap-1.5"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-[10px] hidden sm:inline">LIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-zinc-900" />
                <span className="font-mono text-[10px] hidden sm:inline">DARK</span>
              </>
            )}
          </Button>

          {/* Preset Quick Dropdown */}
          <div className="relative hidden lg:block">
            <select
              onChange={(e) => {
                const p = presets.find((pr) => pr.id === e.target.value);
                if (p) onSelectPreset(p);
              }}
              defaultValue=""
              className="bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded-md px-3 py-1.5 outline-none focus:border-black dark:focus:border-white font-mono cursor-pointer max-w-[170px]"
            >
              <option value="" disabled>
                Presets
              </option>
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Upload File Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onUploadClick}
            title="Upload Custom 3D Model"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload 3D</span>
          </Button>

          {/* Primary Generate Button */}
          <Button
            variant="glow"
            size="default"
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex-1 md:flex-initial font-black"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Baking ({progressPct}%)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>Bake Spritesheet</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
