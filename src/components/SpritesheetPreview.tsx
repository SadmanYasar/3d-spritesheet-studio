import React, { useState, useEffect } from 'react';
import { GeneratedSpritesheet, SpritesheetConfig } from '../types';
import { createAnimatedGif, createFramesZip } from '../utils/spritesheetGenerator';
import {
  Download,
  Play,
  Pause,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  Film,
  ZoomIn,
  ZoomOut,
  Loader2,
  Grid,
} from 'lucide-react';
import { Button } from './ui/button';

interface SpritesheetPreviewProps {
  spritesheet: GeneratedSpritesheet | null;
  spritesheetConfig: SpritesheetConfig;
  modelName: string;
}

export function SpritesheetPreview({
  spritesheet,
  spritesheetConfig,
  modelName,
}: SpritesheetPreviewProps) {
  const [activeFrame, setActiveFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);
  const [isExportingGif, setIsExportingGif] = useState<boolean>(false);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(1.0);

  // Animation playback loop for animated preview
  useEffect(() => {
    if (!spritesheet || !isPlaying || spritesheet.frames.length <= 1) return;

    const interval = 1000 / (spritesheetConfig.fps || 12);
    const timer = setInterval(() => {
      setActiveFrame((prev) => (prev + 1) % spritesheet.frames.length);
    }, interval);

    return () => clearInterval(timer);
  }, [spritesheet, isPlaying, spritesheetConfig.fps]);

  if (!spritesheet) {
    return (
      <div className="flex flex-col items-center justify-center h-80 bg-white dark:bg-zinc-950 rounded-xl border-2 border-black dark:border-zinc-800 p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]">
        <Grid className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mb-3 animate-pulse" />
        <h3 className="text-base font-extrabold uppercase tracking-tight text-zinc-900 dark:text-zinc-100">No Spritesheet Rendered</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mt-1 font-medium">
          Adjust your 3D model angles and click "Bake Spritesheet" to render the atlas.
        </p>
      </div>
    );
  }

  const currentPlayingFrame = spritesheet.frames[activeFrame] || spritesheet.frames[0];
  const inspectedFrame =
    selectedFrameIndex !== null
      ? spritesheet.frames[selectedFrameIndex]
      : currentPlayingFrame;

  // Downloads
  const downloadPngAtlas = () => {
    const link = document.createElement('a');
    link.download = `${modelName.replace(/\s+/g, '_')}_spritesheet.png`;
    link.href = spritesheet.dataUrl;
    link.click();
  };

  const downloadGifAnimation = async () => {
    try {
      setIsExportingGif(true);
      const gifUrl = await createAnimatedGif(
        spritesheet.frames,
        spritesheetConfig.fps,
        spritesheet.frameWidth,
        spritesheet.frameHeight
      );
      const link = document.createElement('a');
      link.download = `${modelName.replace(/\s+/g, '_')}_animation.gif`;
      link.href = gifUrl;
      link.click();
    } catch (err) {
      console.error('GIF export failed:', err);
      alert('Failed to generate GIF file.');
    } finally {
      setIsExportingGif(false);
    }
  };

  const downloadZipArchive = async () => {
    try {
      setIsExportingZip(true);
      const zipBlob = await createFramesZip(spritesheet, spritesheetConfig, modelName);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.download = `${modelName.replace(/\s+/g, '_')}_spritesheet_pack.zip`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP export failed:', err);
      alert('Failed to generate ZIP archive.');
    } finally {
      setIsExportingZip(false);
    }
  };

  const downloadJsonMetadata = () => {
    const atlasJson = {
      meta: {
        app: '3D Spritesheet Studio',
        version: '1.0',
        image: `${modelName.replace(/\s+/g, '_')}_spritesheet.png`,
        size: { w: spritesheet.width, h: spritesheet.height },
        scale: '1',
        totalFrames: spritesheet.frames.length,
        columns: spritesheet.columns,
        rows: spritesheet.rows,
        frameWidth: spritesheet.frameWidth,
        frameHeight: spritesheet.frameHeight,
      },
      frames: spritesheet.frames.map((frame) => ({
        filename: `frame_${String(frame.index + 1).padStart(3, '0')}.png`,
        frame: {
          x: spritesheet.padding + frame.col * (spritesheet.frameWidth + spritesheet.padding),
          y: spritesheet.padding + frame.row * (spritesheet.frameHeight + spritesheet.padding),
          w: spritesheet.frameWidth,
          h: spritesheet.frameHeight,
        },
        orientation: { pitchDeg: frame.pitch, yawDeg: frame.yaw, rollDeg: frame.roll },
      })),
    };

    const blob = new Blob([JSON.stringify(atlasJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${modelName.replace(/\s+/g, '_')}_atlas.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Export Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-4 rounded-xl border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white flex items-center justify-center font-black">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50">
              {spritesheet.columns} x {spritesheet.rows} Atlas ({spritesheet.width} x {spritesheet.height} px)
            </h3>
            <span className="text-[11px] font-mono font-medium text-zinc-600 dark:text-zinc-400">
              {spritesheet.frames.length} Total Frames ({spritesheet.frameWidth} x {spritesheet.frameHeight} px each)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={downloadPngAtlas}
            variant="default"
            size="sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PNG Atlas</span>
          </Button>

          <Button
            onClick={downloadGifAnimation}
            disabled={isExportingGif}
            variant="outline"
            size="sm"
          >
            {isExportingGif ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Film className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />}
            <span>{isExportingGif ? 'Rendering GIF...' : 'Animated GIF'}</span>
          </Button>

          <Button
            onClick={downloadZipArchive}
            disabled={isExportingZip}
            variant="outline"
            size="sm"
          >
            {isExportingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileArchive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
            <span>{isExportingZip ? 'Packing ZIP...' : 'ZIP Pack'}</span>
          </Button>

          <Button
            onClick={downloadJsonMetadata}
            variant="outline"
            size="sm"
            title="Download Texture Atlas JSON"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>JSON</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Spritesheet Atlas View */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-950 rounded-xl border-2 border-black dark:border-zinc-800 p-4 flex flex-col space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-zinc-800">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Spritesheet Texture Atlas</span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGridOverlay(!showGridOverlay)}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border-2 transition-colors cursor-pointer ${
                  showGridOverlay
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-zinc-100 text-zinc-900 border-zinc-900 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-700'
                }`}
              >
                Grid Overlay
              </button>

              <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 rounded-md p-0.5 text-xs text-zinc-900 dark:text-zinc-100">
                <button
                  onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
                  className="px-2 py-0.5 hover:bg-zinc-300 dark:hover:bg-zinc-800 rounded cursor-pointer font-bold"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold text-[11px] px-1">{Math.round(scale * 100)}%</span>
                <button
                  onClick={() => setScale((s) => Math.min(2.5, s + 0.25))}
                  className="px-2 py-0.5 hover:bg-zinc-300 dark:hover:bg-zinc-800 rounded cursor-pointer font-bold"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Scroll Wrapper */}
          <div className="overflow-auto max-h-[600px] min-h-[350px] p-6 bg-zinc-100 dark:bg-zinc-900 rounded-lg border-2 border-black dark:border-zinc-800 custom-scrollbar relative flex justify-center items-start">
            <div
              className="relative transition-transform origin-top"
              style={{ transform: `scale(${scale})` }}
            >
              <img
                src={spritesheet.dataUrl}
                alt="Generated Spritesheet"
                className="max-w-none border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] block"
                style={{ width: `${spritesheet.width}px`, height: `${spritesheet.height}px` }}
              />

              {/* Grid cell click targets */}
              {showGridOverlay && (
                <div
                  className="absolute inset-0 grid pointer-events-auto"
                  style={{
                    gridTemplateColumns: `repeat(${spritesheet.columns}, 1fr)`,
                    gridTemplateRows: `repeat(${spritesheet.rows}, 1fr)`,
                  }}
                >
                  {spritesheet.frames.map((frame) => {
                    const isInspected = selectedFrameIndex === frame.index;
                    return (
                      <div
                        key={frame.index}
                        onClick={() => setSelectedFrameIndex(frame.index)}
                        className={`border transition-all cursor-pointer flex items-end justify-start p-1 ${
                          isInspected
                            ? 'border-black bg-amber-400/50 z-10 shadow-lg border-2'
                            : 'border-zinc-800/40 hover:border-black hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        <span className="text-[9px] font-mono font-black bg-black text-white dark:bg-white dark:text-black px-1 rounded border border-black dark:border-white">
                          #{frame.index + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Animated Preview & Frame Inspector */}
        <div className="space-y-4">
          {/* Animated Player */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl border-2 border-black dark:border-zinc-800 p-4 space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-zinc-800">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Animation Player</span>
              <Button
                size="sm"
                variant={isPlaying ? 'outline' : 'default'}
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-7 text-[11px]"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border-2 border-black dark:border-zinc-800">
              <div
                className="rounded-md border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                style={{
                  width: `${spritesheet.frameWidth}px`,
                  height: `${spritesheet.frameHeight}px`,
                  backgroundImage: `url(${currentPlayingFrame.dataUrl})`,
                  backgroundSize: 'cover',
                }}
              />
              <span className="mt-2 text-[11px] font-mono font-bold text-zinc-900 dark:text-zinc-100">
                Frame #{currentPlayingFrame.index + 1} / {spritesheet.frames.length}
              </span>
            </div>

            {/* FPS Control */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-900 dark:text-zinc-100 font-bold uppercase text-[11px]">Playback Speed</span>
                <span className="font-mono font-bold text-black dark:text-white">{spritesheetConfig.fps} FPS</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={spritesheetConfig.fps}
                onChange={(e) =>
                  spritesheetConfig.fps = Number(e.target.value)
                }
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-none appearance-none cursor-pointer accent-black dark:accent-white border border-black dark:border-white"
              />
            </div>
          </div>

          {/* Frame Inspector */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl border-2 border-black dark:border-zinc-800 p-4 space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 border-b-2 border-black dark:border-zinc-800 pb-2">
              Frame Angle Inspector
            </h4>

            {inspectedFrame && (
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400 font-bold">Frame Index:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    #{inspectedFrame.index + 1}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400 font-bold">Matrix Position:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    Row {inspectedFrame.row + 1}, Col {inspectedFrame.col + 1}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400 font-bold">Pitch (X-Axis):</span>
                  <span className="font-bold text-black dark:text-white bg-amber-400 text-black px-1.5 py-0.5 rounded border border-black">
                    {Math.round(inspectedFrame.pitch)}°
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400 font-bold">Yaw (Y-Axis):</span>
                  <span className="font-bold text-black dark:text-white bg-amber-400 text-black px-1.5 py-0.5 rounded border border-black">
                    {Math.round(inspectedFrame.yaw)}°
                  </span>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.download = `frame_${inspectedFrame.index + 1}.png`;
                      link.href = inspectedFrame.dataUrl;
                      link.click();
                    }}
                    variant="outline"
                    className="w-full text-xs font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Single Frame</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
