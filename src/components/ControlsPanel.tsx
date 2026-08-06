import React, { useState } from 'react';
import {
  LayoutType,
  ModelAsset,
  Preset,
  RotationAxis,
  SceneConfig,
  SpritesheetConfig,
} from '../types';
import {
  Camera,
  Sliders,
  Upload,
  Box,
  Plus,
  Trash2,
  Grid,
} from 'lucide-react';
import { Card } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';

interface ControlsPanelProps {
  sceneConfig: SceneConfig;
  setSceneConfig: React.Dispatch<React.SetStateAction<SceneConfig>>;
  spritesheetConfig: SpritesheetConfig;
  setSpritesheetConfig: React.Dispatch<React.SetStateAction<SpritesheetConfig>>;
  selectedModel: ModelAsset;
  setSelectedModel: (asset: ModelAsset) => void;
  presets: Preset[];
  onApplyPreset: (preset: Preset) => void;
  onSaveNewPreset: (name: string, description: string) => void;
  onDeletePreset: (id: string) => void;
  onUploadCustomFile: (file: File) => void;
}

export function ControlsPanel({
  sceneConfig,
  setSceneConfig,
  spritesheetConfig,
  setSpritesheetConfig,
  selectedModel,
  setSelectedModel,
  presets,
  onApplyPreset,
  onSaveNewPreset,
  onDeletePreset,
  onUploadCustomFile,
}: ControlsPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('spritesheet');
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [newPresetDesc, setNewPresetDesc] = useState<string>('');

  const sampleModels: ModelAsset[] = [
    {
      id: 'sample-robot',
      name: 'Cyber Robot Head',
      type: 'sample',
      sampleType: 'robot_head',
      url: '',
      format: 'procedural',
    },
    {
      id: 'sample-helmet',
      name: 'Sci-Fi Helmet',
      type: 'sample',
      sampleType: 'helmet',
      url: '',
      format: 'procedural',
    },
    {
      id: 'sample-alien',
      name: 'Cute Alien Creature',
      type: 'sample',
      sampleType: 'coin',
      url: '',
      format: 'procedural',
    },
    {
      id: 'sample-gem',
      name: 'Crystal Gem',
      type: 'sample',
      sampleType: 'gem',
      url: '',
      format: 'procedural',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCustomFile(e.target.files[0]);
    }
  };

  const handleSavePresetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    onSaveNewPreset(newPresetName.trim(), newPresetDesc.trim());
    setNewPresetName('');
    setNewPresetDesc('');
    setShowSaveModal(false);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border-2 border-black dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] transition-colors">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col h-full overflow-hidden"
      >
        <div className="border-b-2 border-black dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-2">
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
            <TabsTrigger value="spritesheet">
              <Grid className="w-3.5 h-3.5" />
              <span>Spritesheet</span>
            </TabsTrigger>
            <TabsTrigger value="scene">
              <Camera className="w-3.5 h-3.5" />
              <span>Camera & Light</span>
            </TabsTrigger>
            <TabsTrigger value="model">
              <Box className="w-3.5 h-3.5" />
              <span>3D Asset</span>
            </TabsTrigger>
            <TabsTrigger value="presets">
              <Sliders className="w-3.5 h-3.5" />
              <span>Presets</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-5 custom-scrollbar text-xs">
          {/* TAB 1: SPRITESHEET CONFIG */}
          <TabsContent value="spritesheet" className="space-y-4 m-0">
            {/* Layout Mode */}
            <div>
              <label className="block text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                Layout Arrangement
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['grid', 'row', 'column'] as LayoutType[]).map((layout) => (
                  <Button
                    key={layout}
                    type="button"
                    variant={spritesheetConfig.layout === layout ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSpritesheetConfig({ ...spritesheetConfig, layout })}
                    className="capitalize text-center"
                  >
                    {layout}
                  </Button>
                ))}
              </div>
            </div>

            {/* Frame Resolution */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider text-[11px]">Cell Resolution (px)</label>
                <span className="text-zinc-900 dark:text-zinc-100 font-mono font-bold bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-black dark:border-zinc-700">
                  {spritesheetConfig.frameWidth} x {spritesheetConfig.frameHeight}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[64, 128, 256, 512].map((res) => (
                  <Button
                    key={res}
                    type="button"
                    variant={spritesheetConfig.frameWidth === res ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setSpritesheetConfig({
                        ...spritesheetConfig,
                        frameWidth: res,
                        frameHeight: res,
                      })
                    }
                    className="font-mono text-center"
                  >
                    {res}px
                  </Button>
                ))}
              </div>
            </div>

            {/* Grid Matrix Dimensions */}
            {spritesheetConfig.layout === 'grid' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider mb-1 text-[11px]">Columns</label>
                  <Input
                    type="number"
                    min={1}
                    max={16}
                    value={spritesheetConfig.columns}
                    onChange={(e) => {
                      const cols = Math.max(1, Number(e.target.value));
                      setSpritesheetConfig({
                        ...spritesheetConfig,
                        columns: cols,
                        totalFrames: cols * spritesheetConfig.rows,
                      });
                    }}
                    className="font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider mb-1 text-[11px]">Rows</label>
                  <Input
                    type="number"
                    min={1}
                    max={16}
                    value={spritesheetConfig.rows}
                    onChange={(e) => {
                      const r = Math.max(1, Number(e.target.value));
                      setSpritesheetConfig({
                        ...spritesheetConfig,
                        rows: r,
                        totalFrames: spritesheetConfig.columns * r,
                      });
                    }}
                    className="font-mono"
                  />
                </div>
              </div>
            )}

            {/* Total Frame Count for Row/Col */}
            {spritesheetConfig.layout !== 'grid' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider text-[11px]">Total Frames</label>
                  <span className="text-zinc-900 dark:text-zinc-100 font-mono font-bold text-sm">{spritesheetConfig.totalFrames}</span>
                </div>
                <Slider
                  min={4}
                  max={64}
                  step={1}
                  value={[spritesheetConfig.totalFrames]}
                  onValueChange={([val]) =>
                    setSpritesheetConfig({
                      ...spritesheetConfig,
                      totalFrames: val,
                    })
                  }
                />
              </div>
            )}

            {/* Multi-Axis Mode Toggle */}
            <div className="pt-3 border-t-2 border-black dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-900 dark:text-zinc-100 font-bold uppercase text-[11px] tracking-wider">
                  Multi-Axis (Cursor Look-At)
                </span>
                <Switch
                  checked={spritesheetConfig.isMultiAxisGrid}
                  onCheckedChange={(checked) =>
                    setSpritesheetConfig({
                      ...spritesheetConfig,
                      isMultiAxisGrid: checked,
                    })
                  }
                />
              </div>

              {spritesheetConfig.isMultiAxisGrid ? (
                /* Multi-Axis Angle Range Sliders */
                <div className="space-y-3 bg-zinc-100 dark:bg-zinc-900 p-3 rounded-lg border-2 border-black dark:border-zinc-700">
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium leading-snug">
                    Captures row pitch angle (looking up/down) and column yaw angle (looking left/right).
                  </p>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold">Row Pitch Range (X-Axis Look Up/Down)</span>
                      <span className="font-mono font-bold text-black dark:text-white">
                        {spritesheetConfig.gridMultiAxis.pitchRange.start}° to {spritesheetConfig.gridMultiAxis.pitchRange.end}°
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        value={spritesheetConfig.gridMultiAxis.pitchRange.start}
                        onChange={(e) =>
                          setSpritesheetConfig({
                            ...spritesheetConfig,
                            gridMultiAxis: {
                              ...spritesheetConfig.gridMultiAxis,
                              pitchRange: {
                                ...spritesheetConfig.gridMultiAxis.pitchRange,
                                start: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="font-mono text-[11px]"
                      />
                      <Input
                        type="number"
                        value={spritesheetConfig.gridMultiAxis.pitchRange.end}
                        onChange={(e) =>
                          setSpritesheetConfig({
                            ...spritesheetConfig,
                            gridMultiAxis: {
                              ...spritesheetConfig.gridMultiAxis,
                              pitchRange: {
                                ...spritesheetConfig.gridMultiAxis.pitchRange,
                                end: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold">Col Yaw Range (Y-Axis Look Left/Right)</span>
                      <span className="font-mono font-bold text-black dark:text-white">
                        {spritesheetConfig.gridMultiAxis.yawRange.start}° to {spritesheetConfig.gridMultiAxis.yawRange.end}°
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        value={spritesheetConfig.gridMultiAxis.yawRange.start}
                        onChange={(e) =>
                          setSpritesheetConfig({
                            ...spritesheetConfig,
                            gridMultiAxis: {
                              ...spritesheetConfig.gridMultiAxis,
                              yawRange: {
                                ...spritesheetConfig.gridMultiAxis.yawRange,
                                start: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="font-mono text-[11px]"
                      />
                      <Input
                        type="number"
                        value={spritesheetConfig.gridMultiAxis.yawRange.end}
                        onChange={(e) =>
                          setSpritesheetConfig({
                            ...spritesheetConfig,
                            gridMultiAxis: {
                              ...spritesheetConfig.gridMultiAxis,
                              yawRange: {
                                ...spritesheetConfig.gridMultiAxis.yawRange,
                                end: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Single-Axis Spin Controls */
                <div className="space-y-3 bg-zinc-100 dark:bg-zinc-900 p-3 rounded-lg border-2 border-black dark:border-zinc-700">
                  <div>
                    <label className="block text-zinc-900 dark:text-zinc-100 font-bold mb-1 uppercase text-[11px]">Rotation Axis</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Y', 'X', 'Z'] as RotationAxis[]).map((axis) => (
                        <Button
                          key={axis}
                          type="button"
                          variant={spritesheetConfig.singleAxis === axis ? 'default' : 'outline'}
                          size="sm"
                          onClick={() =>
                            setSpritesheetConfig({
                              ...spritesheetConfig,
                              singleAxis: axis,
                            })
                          }
                          className="font-mono"
                        >
                          {axis}-Axis
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold">Rotation Angle Span</span>
                      <span className="font-mono font-bold text-black dark:text-white">
                        {spritesheetConfig.singleAxisRange.start}° to {spritesheetConfig.singleAxisRange.end}°
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        value={spritesheetConfig.singleAxisRange.start}
                        onChange={(e) =>
                          setSpritesheetConfig({
                            ...spritesheetConfig,
                            singleAxisRange: {
                              ...spritesheetConfig.singleAxisRange,
                              start: Number(e.target.value),
                            },
                          })
                        }
                        className="font-mono text-[11px]"
                      />
                      <Input
                        type="number"
                        value={spritesheetConfig.singleAxisRange.end}
                        onChange={(e) =>
                          setSpritesheetConfig({
                            ...spritesheetConfig,
                            singleAxisRange: {
                              ...spritesheetConfig.singleAxisRange,
                              end: Number(e.target.value),
                            },
                          })
                        }
                        className="font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Total Sheet Dimension Preview */}
            <div className="pt-3 border-t-2 border-black dark:border-zinc-800 flex items-center justify-between text-zinc-600 dark:text-zinc-400 font-mono text-xs">
              <span className="font-bold uppercase">Atlas Dimensions:</span>
              <span className="font-bold text-black dark:text-white bg-amber-400 text-black px-2 py-0.5 rounded border border-black font-mono">
                {spritesheetConfig.columns * spritesheetConfig.frameWidth} x{' '}
                {spritesheetConfig.rows * spritesheetConfig.frameHeight} px
              </span>
            </div>
          </TabsContent>

          {/* TAB 2: SCENE & LIGHTING */}
          <TabsContent value="scene" className="space-y-4 m-0">
            {/* Camera Zoom */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider text-[11px]">Camera Distance / Zoom</label>
                <span className="font-mono font-bold text-black dark:text-white text-xs">{sceneConfig.zoom.toFixed(2)}x</span>
              </div>
              <Slider
                min={0.5}
                max={2.5}
                step={0.05}
                value={[sceneConfig.zoom]}
                onValueChange={([val]) => setSceneConfig({ ...sceneConfig, zoom: val })}
              />
            </div>

            {/* Elevation / Pitch Offset */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider text-[11px]">Camera Elevation Angle</label>
                <span className="font-mono font-bold text-black dark:text-white text-xs">{sceneConfig.pitchOffset}°</span>
              </div>
              <Slider
                min={-60}
                max={60}
                step={1}
                value={[sceneConfig.pitchOffset]}
                onValueChange={([val]) => setSceneConfig({ ...sceneConfig, pitchOffset: val })}
              />
            </div>

            {/* Lighting Intensity */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider text-[11px]">Directional Light Intensity</label>
                <span className="font-mono font-bold text-black dark:text-white text-xs">{sceneConfig.lightIntensity.toFixed(1)}</span>
              </div>
              <Slider
                min={0}
                max={4.0}
                step={0.1}
                value={[sceneConfig.lightIntensity]}
                onValueChange={([val]) => setSceneConfig({ ...sceneConfig, lightIntensity: val })}
              />
            </div>

            {/* Ambient Intensity */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider text-[11px]">Ambient Light Intensity</label>
                <span className="font-mono font-bold text-black dark:text-white text-xs">{sceneConfig.ambientIntensity.toFixed(1)}</span>
              </div>
              <Slider
                min={0}
                max={2.0}
                step={0.1}
                value={[sceneConfig.ambientIntensity]}
                onValueChange={([val]) => setSceneConfig({ ...sceneConfig, ambientIntensity: val })}
              />
            </div>

            {/* Background Settings */}
            <div className="pt-3 border-t-2 border-black dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-900 dark:text-zinc-100 font-bold uppercase text-[11px] tracking-wider">Transparent Background</span>
                <Switch
                  checked={sceneConfig.transparentBg}
                  onCheckedChange={(checked) =>
                    setSceneConfig({ ...sceneConfig, transparentBg: checked })
                  }
                />
              </div>

              {!sceneConfig.transparentBg && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-zinc-900 dark:text-zinc-100 font-bold text-xs">Background Color</span>
                  <input
                    type="color"
                    value={sceneConfig.backgroundColor}
                    onChange={(e) =>
                      setSceneConfig({ ...sceneConfig, backgroundColor: e.target.value })
                    }
                    className="w-8 h-8 rounded border-2 border-black dark:border-white bg-transparent cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Material Overrides */}
            <div className="pt-3 border-t-2 border-black dark:border-zinc-800">
              <label className="block text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider mb-2 text-[11px]">Material Shading Override</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'default', label: 'Default Material' },
                  { id: 'clay', label: 'Clay Claymation' },
                  { id: 'metal', label: 'Chrome Metal' },
                  { id: 'toon', label: 'Stylized Toon' },
                  { id: 'wireframe', label: 'Wireframe' },
                ].map((mat) => (
                  <Button
                    key={mat.id}
                    type="button"
                    variant={sceneConfig.materialOverride === mat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setSceneConfig({
                        ...sceneConfig,
                        materialOverride: mat.id as any,
                      })
                    }
                    className="justify-start text-left"
                  >
                    {mat.label}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: 3D ASSETS & UPLOAD */}
          <TabsContent value="model" className="space-y-4 m-0">
            <div>
              <label className="block text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider mb-2 text-[11px]">Sample 3D Models</label>
              <div className="grid grid-cols-2 gap-2">
                {sampleModels.map((sample) => {
                  const isSelected = selectedModel.id === sample.id;
                  return (
                    <button
                      key={sample.id}
                      onClick={() => setSelectedModel(sample)}
                      className={`p-3 rounded-lg border-2 text-left flex flex-col justify-between transition-all cursor-pointer font-bold ${
                        isSelected
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                          : 'border-black dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Box className={`w-5 h-5 mb-2 ${isSelected ? 'text-amber-400 dark:text-amber-600' : 'text-zinc-700 dark:text-zinc-300'}`} />
                      <span className="text-xs font-bold">{sample.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t-2 border-black dark:border-zinc-800">
              <label className="block text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider mb-2 text-[11px]">Upload Custom 3D Model</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl p-6 cursor-pointer transition-all text-center group">
                <Upload className="w-8 h-8 text-zinc-700 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white mb-2 transition-colors" />
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                  Drop your 3D asset here or click to browse
                </span>
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono mt-1">
                  Supports .GLB, .GLTF, .OBJ, .STL, .PLY
                </span>
                <input
                  type="file"
                  accept=".glb,.gltf,.obj,.stl,.ply"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {selectedModel.type === 'custom' && (
                <div className="mt-3 p-3 bg-amber-400 text-black border-2 border-black rounded-lg flex items-center justify-between font-bold">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4" />
                    <span className="text-xs">{selectedModel.name}</span>
                  </div>
                  <Badge variant="default">{selectedModel.format}</Badge>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 4: LOCAL PRESETS */}
          <TabsContent value="presets" className="space-y-4 m-0">
            <div className="flex items-center justify-between">
              <span className="text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-wider text-[11px]">Saved Presets</span>
              <Button
                size="sm"
                variant="default"
                onClick={() => setShowSaveModal(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </Button>
            </div>

            <div className="space-y-2">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border-2 border-black dark:border-zinc-700 hover:border-black dark:hover:border-zinc-400 flex items-start justify-between gap-2 group transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
                >
                  <div className="flex-1 cursor-pointer" onClick={() => onApplyPreset(preset)}>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                      {preset.name}
                    </h4>
                    {preset.description && (
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-2 font-medium">
                        {preset.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="glow"
                      size="sm"
                      onClick={() => onApplyPreset(preset)}
                      className="px-2.5 py-1 text-[11px]"
                    >
                      Apply
                    </Button>
                    {!preset.id.startsWith('preset-face') && !preset.id.startsWith('preset-360') && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDeletePreset(preset.id)}
                        className="h-7 w-7 text-white"
                        title="Delete Preset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Save Preset Dialog */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Preset to LocalStorage</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePresetSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-1">Preset Name</label>
              <Input
                type="text"
                required
                placeholder="e.g. My Custom 8x8 Head LookAt"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-1">Description (Optional)</label>
              <Input
                type="text"
                placeholder="e.g. Optimized for Isometric RPG character"
                value={newPresetDesc}
                onChange={(e) => setNewPresetDesc(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="default">
                Save Preset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
