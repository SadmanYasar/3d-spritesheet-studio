import React, { useState, useEffect, useRef } from 'react';
import {
  GeneratedSpritesheet,
  ModelAsset,
  Preset,
  SceneConfig,
  SpritesheetConfig,
} from './types';
import {
  DEFAULT_SCENE_CONFIG,
  DEFAULT_SPRITESHEET_CONFIG,
  deleteUserPreset,
  loadRecentConfig,
  loadSavedPresets,
  saveRecentConfig,
  saveUserPreset,
} from './utils/storage';
import { generateSpritesheet } from './utils/spritesheetGenerator';
import { Navbar } from './components/Navbar';
import { ThreeCanvas } from './components/ThreeCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { SpritesheetPreview } from './components/SpritesheetPreview';
import { InteractiveLookAtDemo } from './components/InteractiveLookAtDemo';
import { WebcamFaceStudio } from './components/WebcamFaceStudio';
import { Button } from './components/ui/button';
import { Box, Sparkles, Grid, AlertCircle } from 'lucide-react';

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // App Theme State (Brutalist Dark & Light Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // App State
  const [sceneConfig, setSceneConfig] = useState<SceneConfig>(DEFAULT_SCENE_CONFIG);
  const [spritesheetConfig, setSpritesheetConfig] =
    useState<SpritesheetConfig>(DEFAULT_SPRITESHEET_CONFIG);
  const [selectedModel, setSelectedModel] = useState<ModelAsset>({
    id: 'model-gman',
    name: 'G-Man Head',
    type: 'custom',
    url: '/gman_head_rigged.glb',
    format: 'glb',
  });

  const [generatedSpritesheet, setGeneratedSpritesheet] = useState<GeneratedSpritesheet | null>(
    null
  );
  const [presets, setPresets] = useState<Preset[]>(loadSavedPresets());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>('');
  const [activeView, setActiveView] = useState<'studio' | 'webcam' | 'interactive'>('studio');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load recent config from local storage if available
  useEffect(() => {
    const recent = loadRecentConfig();
    if (recent) {
      setSceneConfig(recent.sceneConfig);
      setSpritesheetConfig(recent.spritesheetConfig);
    }
  }, []);

  // Save changes to recent config
  useEffect(() => {
    saveRecentConfig(sceneConfig, spritesheetConfig);
  }, [sceneConfig, spritesheetConfig]);

  const bakerRef = useRef<any>(null);

  // Initial automatic bake on mount
  useEffect(() => {
    let isCancelled = false;
    const initialBake = async () => {
      // Small timeout to allow R3F canvas and environment map to finish mounting
      await new Promise((r) => setTimeout(r, 250));
      if (isCancelled) return;

      try {
        setIsGenerating(true);
        let result;
        if (bakerRef.current) {
          result = await bakerRef.current(spritesheetConfig, (pct: number, text: string) => {
            if (!isCancelled) {
              setProgressPct(pct);
              setProgressText(text);
            }
          });
        } else {
          result = await generateSpritesheet(
            selectedModel,
            sceneConfig,
            spritesheetConfig,
            (pct, text) => {
              if (!isCancelled) {
                setProgressPct(pct);
                setProgressText(text);
              }
            }
          );
        }
        if (!isCancelled) {
          setGeneratedSpritesheet(result);
        }
      } catch (err) {
        console.error('Initial spritesheet bake failed:', err);
      } finally {
        if (!isCancelled) setIsGenerating(false);
      }
    };

    initialBake();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Bake Spritesheet handler
  const handleBakeSpritesheet = async () => {
    try {
      setErrorMessage(null);
      setIsGenerating(true);
      setProgressPct(0);
      setProgressText('Starting render engine...');

      let result;
      if (bakerRef.current) {
        result = await bakerRef.current(spritesheetConfig, (pct: number, text: string) => {
          setProgressPct(pct);
          setProgressText(text);
        });
      } else {
        result = await generateSpritesheet(
          selectedModel,
          sceneConfig,
          spritesheetConfig,
          (pct, text) => {
            setProgressPct(pct);
            setProgressText(text);
          }
        );
      }

      setGeneratedSpritesheet(result);
    } catch (err: any) {
      console.error('Bake error:', err);
      setErrorMessage(err.message || 'Failed to generate spritesheet.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Preset Handlers
  const handleApplyPreset = (preset: Preset) => {
    setSceneConfig(preset.sceneConfig);
    setSpritesheetConfig(preset.spritesheetConfig);
  };

  const handleSaveNewPreset = (name: string, description: string) => {
    saveUserPreset({
      name,
      description,
      sceneConfig,
      spritesheetConfig,
    });
    setPresets(loadSavedPresets());
  };

  const handleDeletePreset = (id: string) => {
    deleteUserPreset(id);
    setPresets(loadSavedPresets());
  };

  // Upload custom 3D model file
  const handleUploadCustomFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'glb';
    const blobUrl = URL.createObjectURL(file);

    const customAsset: ModelAsset = {
      id: 'custom-' + Date.now(),
      name: file.name,
      type: 'custom',
      url: blobUrl,
      format: ext as any,
    };

    setSelectedModel(customAsset);
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-150">
      {/* Top Navbar */}
      <Navbar
        onGenerate={handleBakeSpritesheet}
        isGenerating={isGenerating}
        progressPct={progressPct}
        progressText={progressText}
        selectedModel={selectedModel}
        onUploadClick={() => fileInputRef.current?.click()}
        presets={presets}
        onSelectPreset={handleApplyPreset}
        activeView={activeView}
        setActiveView={setActiveView}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Hidden File Input for Navbar Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf,.obj,.stl,.ply"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUploadCustomFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-red-600 text-white border-2 border-black rounded-xl flex items-center gap-3 text-xs font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* View 1: 3D Generator Studio */}
        <div className={activeView === 'studio' ? 'space-y-6' : 'hidden'}>
          {/* Top Row: Live 3D Viewport + Config Controls Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* 3D Viewport Canvas */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-black dark:text-white" />
                  <h2 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Interactive 3D Scene Viewport
                  </h2>
                </div>
                <span className="text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  Model: <strong className="text-black dark:text-white underline">{selectedModel.name}</strong>
                </span>
              </div>

              <div className="h-[360px] sm:h-[440px] lg:h-[480px] w-full">
                <ThreeCanvas
                  modelAsset={selectedModel}
                  sceneConfig={sceneConfig}
                  setSceneConfig={setSceneConfig}
                  bakerRef={bakerRef}
                  onModelError={(err) => setErrorMessage(err)}
                />
              </div>
            </div>

            {/* Controls Accordion Sidebar */}
            <div className="lg:col-span-5 xl:col-span-4 h-[480px]">
              <ControlsPanel
                sceneConfig={sceneConfig}
                setSceneConfig={setSceneConfig}
                spritesheetConfig={spritesheetConfig}
                setSpritesheetConfig={setSpritesheetConfig}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                presets={presets}
                onApplyPreset={handleApplyPreset}
                onSaveNewPreset={handleSaveNewPreset}
                onDeletePreset={handleDeletePreset}
                onUploadCustomFile={handleUploadCustomFile}
              />
            </div>
          </div>

          {/* Bottom Row: Generated Spritesheet & Export Options */}
          <div className="pt-4 border-t-2 border-black dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-black dark:text-white" />
                <h2 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Generated Spritesheet & Animation Atlas
                </h2>
              </div>

              {generatedSpritesheet && (
                <Button
                  onClick={() => setActiveView('interactive')}
                  variant="glow"
                  size="sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>Test Look-At Simulator</span>
                </Button>
              )}
            </div>

            <SpritesheetPreview
              spritesheet={generatedSpritesheet}
              spritesheetConfig={spritesheetConfig}
              modelName={selectedModel.name}
            />
          </div>
        </div>

        {/* View 2: Webcam Face Capture Studio */}
        {activeView === 'webcam' && (
          <div className="space-y-4">
            <WebcamFaceStudio
              onBakeComplete={(spritesheet) => setGeneratedSpritesheet(spritesheet)}
              onNavigateToSimulator={() => setActiveView('interactive')}
            />
          </div>
        )}

        {/* View 3: Interactive Mouse-Tracking Simulator */}
        <div className={activeView === 'interactive' ? 'space-y-4' : 'hidden'}>
          <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Interactive Mouse Cursor Look-At Simulator</span>
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
                Test how your generated spritesheet responds dynamically to mouse movement across screen angles.
              </p>
            </div>

            <Button
              onClick={() => setActiveView('studio')}
              variant="outline"
              size="sm"
            >
              Back to 3D Viewport
            </Button>
          </div>

          <InteractiveLookAtDemo
            spritesheet={generatedSpritesheet}
            spritesheetConfig={spritesheetConfig}
          />
        </div>
      </main>
    </div>
  );
}
