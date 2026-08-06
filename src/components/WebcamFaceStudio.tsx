import React, { useState, useEffect, useRef } from 'react';
import { FaceMesh, Results as FaceMeshResults } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { SelfieSegmentation, Results as SelfieResults } from '@mediapipe/selfie_segmentation';
import {
  CapturedFaceFrame,
  FaceCaptureTarget,
  FaceStudioConfig,
  GeneratedSpritesheet,
  SpritesheetConfig,
} from '../types';
import {
  computeFaceOrientation,
  FaceOrientation,
  generateFaceTargetGrid,
  isFaceInTargetPose,
} from '../utils/faceTracker';
import { removeBackgroundCanvas } from '../utils/backgroundSegmenter';
import { FaceMeshOverlay } from './FaceMeshOverlay';
import { SpritesheetPreview } from './SpritesheetPreview';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import {
  Camera as CameraIcon,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Play,
  RotateCcw,
  SkipForward,
  Grid,
  Layers,
  Sliders,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface WebcamFaceStudioProps {
  isActive?: boolean;
  onBakeComplete?: (spritesheet: GeneratedSpritesheet) => void;
  onNavigateToSimulator?: () => void;
}

export function WebcamFaceStudio({
  isActive = true,
  onBakeComplete,
  onNavigateToSimulator,
}: WebcamFaceStudioProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<Camera | null>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const selfieSegmentationRef = useRef<SelfieSegmentation | null>(null);

  // Config State
  const [config, setConfig] = useState<FaceStudioConfig>({
    gridRows: 5,
    gridCols: 5,
    pitchMin: -25,
    pitchMax: 25,
    yawMin: -35,
    yawMax: 35,
    toleranceDeg: 12,
    holdTimeMs: 1200,
    removeBackground: true,
    showFaceMeshOverlay: true,
    autoCapture: false,
    frameWidth: 128,
    frameHeight: 128,
  });

  // Tracking State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [faceOrientation, setFaceOrientation] = useState<FaceOrientation | null>(null);
  const [landmarks, setLandmarks] = useState<any>(null);
  const [segmentationMask, setSegmentationMask] = useState<any>(null);

  // Target Grid State
  const [targets, setTargets] = useState<FaceCaptureTarget[]>([]);
  const [activeTargetIndex, setActiveTargetIndex] = useState<number>(0);
  const [capturedFrames, setCapturedFrames] = useState<Record<number, CapturedFaceFrame>>({});

  // Countdown & Auto Lock State
  const [holdProgress, setHoldProgress] = useState<number>(0); // 0 to 100%
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartRef = useRef<number | null>(null);

  // Generated Atlas Output State
  const [bakedSpritesheet, setBakedSpritesheet] = useState<GeneratedSpritesheet | null>(null);
  const [isBaking, setIsBaking] = useState<boolean>(false);

  // Generate targets whenever grid dimensions change
  useEffect(() => {
    const generated = generateFaceTargetGrid(config);
    setTargets(generated);
    setActiveTargetIndex(0);
    setCapturedFrames({});
    setBakedSpritesheet(null);
  }, [config.gridRows, config.gridCols, config.pitchMin, config.pitchMax, config.yawMin, config.yawMax]);

  // Handle camera start & stop on tab active view changes
  useEffect(() => {
    let isCancelled = false;

    if (!isActive) {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      setCameraActive(false);
      return;
    }

    const initMediaPipe = async () => {
      try {
        // 1. Initialize FaceMesh
        const fm = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        fm.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        fm.onResults((results: FaceMeshResults) => {
          if (isCancelled) return;
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const lms = results.multiFaceLandmarks[0];
            setLandmarks(lms);
            const orient = computeFaceOrientation(lms);
            setFaceOrientation(orient);
          } else {
            setLandmarks(null);
            setFaceOrientation(null);
          }
        });

        faceMeshRef.current = fm;

        // 2. Initialize SelfieSegmentation
        const ss = new SelfieSegmentation({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });

        ss.setOptions({
          modelSelection: 1,
        });

        ss.onResults((results: SelfieResults) => {
          if (isCancelled) return;
          if (results.segmentationMask) {
            setSegmentationMask(results.segmentationMask);
          }
        });

        selfieSegmentationRef.current = ss;

        // 3. Start Camera Video Stream
        if (videoRef.current) {
          const cam = new Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && faceMeshRef.current && !isCancelled) {
                await faceMeshRef.current.send({ image: videoRef.current });
                if (config.removeBackground && selfieSegmentationRef.current) {
                  await selfieSegmentationRef.current.send({ image: videoRef.current });
                }
              }
            },
            width: 640,
            height: 480,
          });

          await cam.start();
          cameraRef.current = cam;
          if (!isCancelled) setCameraActive(true);
        }
      } catch (err: any) {
        console.error('Camera initialization error:', err);
        if (!isCancelled) {
          setCameraError(err.message || 'Could not access webcam camera.');
        }
      }
    };

    initMediaPipe();

    return () => {
      isCancelled = true;
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (faceMeshRef.current) faceMeshRef.current.close();
      if (selfieSegmentationRef.current) selfieSegmentationRef.current.close();
    };
  }, [isActive, config.removeBackground]);

  // Audio Beep Synthesizer
  const playAudioTone = (type: 'lock' | 'snap') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'lock') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'snap') {
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.14);
      }
    } catch {
      // Ignore Web Audio errors
    }
  };

  // Shutter Flash State
  const [shutterFlash, setShutterFlash] = useState<boolean>(false);

  // Current Target Pose Match & Auto-Lock Timer Loop
  const currentTarget = targets[activeTargetIndex] || targets[0];
  const isTargetMatched =
    faceOrientation && currentTarget
      ? isFaceInTargetPose(faceOrientation, currentTarget, config.toleranceDeg)
      : false;

  useEffect(() => {
    if (!config.autoCapture || !isTargetMatched || !cameraActive) {
      setHoldProgress(0);
      holdStartRef.current = null;
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      return;
    }

    if (!holdStartRef.current) {
      holdStartRef.current = Date.now();
      playAudioTone('lock');
    }

    const interval = setInterval(() => {
      if (!holdStartRef.current) return;
      const elapsed = Date.now() - holdStartRef.current;
      const pct = Math.min(100, Math.floor((elapsed / config.holdTimeMs) * 100));
      setHoldProgress(pct);

      if (elapsed >= config.holdTimeMs) {
        clearInterval(interval);
        handleCaptureFrame(activeTargetIndex);
        setHoldProgress(0);
        holdStartRef.current = null;
      }
    }, 50);

    holdTimerRef.current = interval;

    return () => {
      clearInterval(interval);
    };
  }, [isTargetMatched, activeTargetIndex, config.autoCapture, cameraActive]);

  // Keyboard Shortcuts: Space (Snap), Left/Right (Navigate Targets), R (Retake Pose)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleCaptureFrame(activeTargetIndex);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setActiveTargetIndex((prev) => Math.min(targets.length - 1, prev + 1));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setActiveTargetIndex((prev) => Math.max(0, prev - 1));
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        setCapturedFrames((prev) => {
          const next = { ...prev };
          delete next[activeTargetIndex];
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTargetIndex, faceOrientation, targets.length]);

  // Capture Single Frame Function
  const handleCaptureFrame = (targetIdx: number) => {
    if (!videoRef.current || !faceOrientation) return;

    const target = targets[targetIdx];
    if (!target) return;

    playAudioTone('snap');
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    const { frameWidth, frameHeight, removeBackground } = config;

    // Process frame with background removal if enabled
    const processedCanvas = removeBackground
      ? removeBackgroundCanvas(videoRef.current, frameWidth, frameHeight, segmentationMask)
      : (() => {
          const c = document.createElement('canvas');
          c.width = frameWidth;
          c.height = frameHeight;
          const ctx = c.getContext('2d')!;
          ctx.translate(frameWidth, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(videoRef.current!, 0, 0, frameWidth, frameHeight);
          return c;
        })();

    const newFrame: CapturedFaceFrame = {
      index: target.index,
      row: target.row,
      col: target.col,
      targetPitch: target.targetPitch,
      targetYaw: target.targetYaw,
      actualPitch: faceOrientation.pitch,
      actualYaw: faceOrientation.yaw,
      actualRoll: faceOrientation.roll,
      dataUrl: processedCanvas.toDataURL('image/png'),
      canvas: processedCanvas,
      capturedAt: Date.now(),
    };

    setCapturedFrames((prev) => ({
      ...prev,
      [target.index]: newFrame,
    }));

    // Auto-advance to next uncaptured frame
    const nextUncaptured = targets.findIndex(
      (t, idx) => idx > targetIdx && !capturedFrames[t.index]
    );

    if (nextUncaptured !== -1) {
      setActiveTargetIndex(nextUncaptured);
    } else {
      const firstUncaptured = targets.findIndex((t) => !capturedFrames[t.index] && t.index !== target.index);
      if (firstUncaptured !== -1) {
        setActiveTargetIndex(firstUncaptured);
      }
    }
  };

  // Bake Captured Face Frames into Spritesheet Atlas
  const handleBakeFaceAtlas = async () => {
    try {
      setIsBaking(true);

      const { gridCols, gridRows, frameWidth, frameHeight } = config;
      const padding = 2;

      const sheetWidth = gridCols * frameWidth + (gridCols + 1) * padding;
      const sheetHeight = gridRows * frameHeight + (gridRows + 1) * padding;

      const sheetCanvas = document.createElement('canvas');
      sheetCanvas.width = sheetWidth;
      sheetCanvas.height = sheetHeight;
      const sheetCtx = sheetCanvas.getContext('2d')!;

      // Clear transparent
      sheetCtx.clearRect(0, 0, sheetWidth, sheetHeight);

      const atlasFrames: any[] = [];

      targets.forEach((target) => {
        const frame = capturedFrames[target.index];
        const x = padding + target.col * (frameWidth + padding);
        const y = padding + target.row * (frameHeight + padding);

        if (frame) {
          sheetCtx.drawImage(frame.canvas, x, y, frameWidth, frameHeight);
          atlasFrames.push({
            index: target.index,
            row: target.row,
            col: target.col,
            pitch: frame.actualPitch,
            yaw: frame.actualYaw,
            roll: frame.actualRoll,
            dataUrl: frame.dataUrl,
            canvas: frame.canvas,
          });
        } else {
          // Draw placeholder grid cell
          sheetCtx.strokeStyle = '#3f3f46';
          sheetCtx.strokeRect(x, y, frameWidth, frameHeight);
        }
      });

      const finalDataUrl = sheetCanvas.toDataURL('image/png');

      const result: GeneratedSpritesheet = {
        dataUrl: finalDataUrl,
        width: sheetWidth,
        height: sheetHeight,
        columns: gridCols,
        rows: gridRows,
        frameWidth,
        frameHeight,
        padding,
        frames: atlasFrames,
      };

      setBakedSpritesheet(result);
      if (onBakeComplete) onBakeComplete(result);
    } catch (err) {
      console.error('Face Spritesheet bake error:', err);
    } finally {
      setIsBaking(false);
    }
  };

  const capturedCount = Object.keys(capturedFrames).length;
  const isAllCaptured = capturedCount === targets.length;

  return (
    <div className="space-y-6">
      {/* Top Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-4 rounded-xl border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-amber-500 text-black border-2 border-black flex items-center justify-center font-black">
            <CameraIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
              Webcam Face Capture Studio
            </h3>
            <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 font-medium">
              Pose guided webcam capture with Drei FaceMesh & background removal
            </span>
          </div>
        </div>

        {/* Grid Preset Selectors & Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Grid Size Picker */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-1 rounded-lg">
            <span className="text-[11px] font-black uppercase px-2 text-zinc-700 dark:text-zinc-300">Grid:</span>
            <button
              onClick={() => setConfig({ ...config, gridRows: 5, gridCols: 5 })}
              className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer ${
                config.gridRows === 5 && config.gridCols === 5
                  ? 'bg-black text-white dark:bg-white dark:text-black font-black'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              5 x 5 (25)
            </button>
            <button
              onClick={() => setConfig({ ...config, gridRows: 3, gridCols: 3 })}
              className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer ${
                config.gridRows === 3 && config.gridCols === 3
                  ? 'bg-black text-white dark:bg-white dark:text-black font-black'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              3 x 3 (9)
            </button>
          </div>

          {/* Remove BG Toggle */}
          <label className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
            <Switch
              checked={config.removeBackground}
              onCheckedChange={(val) => setConfig({ ...config, removeBackground: val })}
            />
            <span className="text-zinc-900 dark:text-zinc-100 text-[11px] uppercase font-black">
              Remove Background
            </span>
          </label>

          {/* 3D FaceMesh Overlay Toggle */}
          <label className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
            <Switch
              checked={config.showFaceMeshOverlay}
              onCheckedChange={(val) => setConfig({ ...config, showFaceMeshOverlay: val })}
            />
            <span className="text-zinc-900 dark:text-zinc-100 text-[11px] uppercase font-black">
              3D FaceMesh Wireframe
            </span>
          </label>

          {/* Auto Lock Timer Toggle */}
          <label className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
            <Switch
              checked={config.autoCapture}
              onCheckedChange={(val) => setConfig({ ...config, autoCapture: val })}
            />
            <span className="text-zinc-900 dark:text-zinc-100 text-[11px] uppercase font-black">
              Auto Pose Lock
            </span>
          </label>
        </div>
      </div>

      {/* Main Studio Columns: Camera & Pose Guide | Grid Progress Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Camera Feed & Target Pose Guidance */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-4">
          <div className="bg-white dark:bg-zinc-950 rounded-xl border-2 border-black dark:border-zinc-800 p-4 space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] relative">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-zinc-800">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CameraIcon className="w-4 h-4 text-emerald-500" />
                <span>Live Webcam Pose Guide</span>
              </span>

              {faceOrientation && (
                <div className="flex items-center gap-2 font-mono text-xs font-bold">
                  <Badge variant="outline" className="border-black dark:border-zinc-700">
                    Pitch: {faceOrientation.pitch}°
                  </Badge>
                  <Badge variant="outline" className="border-black dark:border-zinc-700">
                    Yaw: {faceOrientation.yaw}°
                  </Badge>
                </div>
              )}
            </div>

            {/* Video Viewport Wrapper */}
            <div className="relative w-full h-[360px] sm:h-[420px] bg-black rounded-lg border-2 border-black overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover transform -scale-x-100"
                playsInline
                muted
              />

              {/* Shutter Flash Animation */}
              {shutterFlash && (
                <div className="absolute inset-0 bg-white z-50 animate-ping opacity-90 pointer-events-none" />
              )}

              {/* 3D Drei FaceMesh Wireframe & Ghost Silhouette Overlay */}
              {config.showFaceMeshOverlay && (
                <FaceMeshOverlay
                  landmarks={landmarks}
                  targetPitch={currentTarget?.targetPitch}
                  targetYaw={currentTarget?.targetYaw}
                />
              )}

              {/* Target HUD Overlay */}
              {currentTarget && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 z-20">
                  {/* Top Target Instruction Banner */}
                  <div className="bg-black/90 backdrop-blur-md border-2 border-amber-400 p-3 rounded-lg text-white shadow-xl max-w-lg mx-auto w-full text-center space-y-1">
                    <span className="text-[10px] font-mono uppercase font-black tracking-widest text-amber-400 block">
                      Target #{currentTarget.index + 1} of {targets.length}: Pitch {currentTarget.targetPitch}° / Yaw {currentTarget.targetYaw}°
                    </span>

                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight text-amber-300">
                      🎯 ALIGN FACE INSIDE AMBER GHOST OUTLINE & PRESS SPACEBAR
                    </h4>

                    <div className="text-[10px] font-mono font-bold text-zinc-300 flex items-center justify-center gap-3 pt-0.5">
                      <span className="bg-black/80 px-2 py-0.5 rounded border border-amber-400/50 text-amber-300">
                        [SPACEBAR] Snap & Next
                      </span>
                      <span className="bg-black/80 px-2 py-0.5 rounded border border-zinc-600 text-zinc-300">
                        [← / →] Prev/Next Pose
                      </span>
                    </div>
                  </div>

                  {/* Target Lock Alignment Frame */}
                  <div className="flex flex-col items-center justify-center my-auto">
                    <div
                      className={`w-44 h-52 rounded-full border-4 transition-all duration-200 flex items-center justify-center relative ${
                        isTargetMatched
                          ? 'border-emerald-400 bg-emerald-500/25 shadow-[0_0_40px_rgba(52,211,153,0.8)] scale-105'
                          : 'border-amber-400/80 border-dashed bg-black/20'
                      }`}
                    >
                      <span className="text-xs font-mono font-black text-white bg-black/80 px-2.5 py-1 rounded border border-white">
                        {isTargetMatched ? '✋ HOLD STILL!' : 'ALIGN HEAD'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Status Bar */}
                  <div className="flex items-center justify-between text-white text-xs font-mono font-bold bg-black/80 p-2 rounded border border-white/40">
                    <span>
                      Target: Pitch({currentTarget.targetPitch}°) Yaw({currentTarget.targetYaw}°)
                    </span>
                    <span>
                      Current: Pitch({faceOrientation?.pitch || 0}°) Yaw({faceOrientation?.yaw || 0}°)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Viewport Manual Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t-2 border-black dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleCaptureFrame(activeTargetIndex)}
                  variant="default"
                  size="sm"
                  disabled={!faceOrientation}
                >
                  <CameraIcon className="w-3.5 h-3.5 mr-1" />
                  <span>Snap Target #{activeTargetIndex + 1}</span>
                </Button>

                <Button
                  onClick={() =>
                    setActiveTargetIndex((prev) => (prev + 1) % targets.length)
                  }
                  variant="outline"
                  size="sm"
                >
                  <SkipForward className="w-3.5 h-3.5 mr-1" />
                  <span>Skip Target</span>
                </Button>
              </div>

              <Button
                onClick={handleBakeFaceAtlas}
                disabled={capturedCount === 0 || isBaking}
                variant="glow"
                size="sm"
              >
                {isBaking ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                )}
                <span>{isBaking ? 'Baking Atlas...' : `Bake Face Atlas (${capturedCount}/${targets.length})`}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Grid Progress Map & Captured Frames */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-950 rounded-xl border-2 border-black dark:border-zinc-800 p-4 space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-zinc-800">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Grid className="w-4 h-4 text-amber-500" />
                <span>Pose Grid Map ({capturedCount}/{targets.length})</span>
              </span>

              <Button
                onClick={() => setCapturedFrames({})}
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950"
              >
                Reset All Poses
              </Button>
            </div>

            {/* Grid Map Matrix */}
            <div
              className="grid gap-2 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg border-2 border-black dark:border-zinc-800 max-h-[460px] overflow-auto custom-scrollbar"
              style={{
                gridTemplateColumns: `repeat(${config.gridCols}, 1fr)`,
              }}
            >
              {targets.map((t) => {
                const captured = capturedFrames[t.index];
                const isActive = activeTargetIndex === t.index;

                return (
                  <div
                    key={t.index}
                    onClick={() => setActiveTargetIndex(t.index)}
                    className={`relative rounded-md border-2 transition-all cursor-pointer flex flex-col items-center justify-between p-1 text-center min-h-[70px] ${
                      isActive
                        ? 'border-amber-500 bg-amber-400/20 ring-2 ring-amber-500 shadow-md z-10'
                        : captured
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:border-black dark:hover:border-zinc-400'
                    }`}
                  >
                    <span className="text-[9px] font-mono font-black text-zinc-700 dark:text-zinc-300">
                      #{t.index + 1}
                    </span>

                    {captured ? (
                      <div className="relative w-10 h-10 my-0.5 rounded border border-black overflow-hidden bg-black/10">
                        <img
                          src={captured.dataUrl}
                          alt={`Target #${t.index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white rounded-bl p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded border border-dashed border-zinc-400 flex items-center justify-center text-[9px] font-mono text-zinc-400 my-0.5">
                        {t.targetPitch}°/{t.targetYaw}°
                      </div>
                    )}

                    <span className="text-[8px] font-bold text-zinc-900 dark:text-zinc-100 uppercase truncate max-w-full">
                      P{t.targetPitch} Y{t.targetYaw}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Generated Face Spritesheet Atlas & Export Options */}
      {bakedSpritesheet && (
        <div className="pt-4 border-t-2 border-black dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>Baked Face Spritesheet Atlas</span>
            </h3>

            {onNavigateToSimulator && (
              <Button onClick={onNavigateToSimulator} variant="glow" size="sm">
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>Test in Look-At Simulator</span>
              </Button>
            )}
          </div>

          <SpritesheetPreview
            spritesheet={bakedSpritesheet}
            spritesheetConfig={{
              layout: 'grid',
              columns: config.gridCols,
              rows: config.gridRows,
              totalFrames: targets.length,
              frameWidth: config.frameWidth,
              frameHeight: config.frameHeight,
              padding: 2,
              isMultiAxisGrid: true,
              singleAxis: 'Y',
              singleAxisRange: { start: -40, end: 40 },
              gridMultiAxis: {
                pitchAxis: 'X',
                yawAxis: 'Y',
                pitchRange: { start: config.pitchMin, end: config.pitchMax },
                yawRange: { start: config.yawMin, end: config.yawMax },
              },
              fps: 12,
            }}
            modelName="Webcam_Face"
          />
        </div>
      )}
    </div>
  );
}
