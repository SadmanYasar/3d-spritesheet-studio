import React, { useState, useEffect, useRef } from 'react';
import { GeneratedSpritesheet, InteractiveDemoConfig, SpritesheetConfig } from '../types';
import { Copy, Check, MousePointer, Sparkles, Code } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';

interface InteractiveLookAtDemoProps {
  spritesheet: GeneratedSpritesheet | null;
  spritesheetConfig: SpritesheetConfig;
}

export function InteractiveLookAtDemo({
  spritesheet,
  spritesheetConfig,
}: InteractiveLookAtDemoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; dist: number }>({
    x: 0,
    y: 0,
    dist: 0,
  });
  const [normalizedAngle, setNormalizedAngle] = useState<{ nx: number; ny: number }>({
    nx: 0,
    ny: 0,
  });
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [codeType, setCodeType] = useState<'react' | 'js'>('react');

  const [demoConfig, setDemoConfig] = useState<InteractiveDemoConfig>({
    sensitivity: 1.0,
    deadzone: 0.05,
    followDistance: 350,
    invertX: false,
    invertY: false,
    smoothing: 0.15,
  });

  // Calculate current row and col from mouse position relative to container
  useEffect(() => {
    if (!spritesheet) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from center
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Max radius for full angle turn
      const maxRadius = demoConfig.followDistance;

      let normX = (dx / maxRadius) * demoConfig.sensitivity;
      let normY = (dy / maxRadius) * demoConfig.sensitivity;

      // Clamp between -1 and 1
      normX = Math.max(-1, Math.min(1, normX));
      normY = Math.max(-1, Math.min(1, normY));

      if (demoConfig.invertX) normX *= -1;
      if (demoConfig.invertY) normY *= -1;

      setMousePos({ x: dx, y: dy, dist });
      setNormalizedAngle({ nx: normX, ny: normY });

      // Map normX (-1 to 1) to Cols (0 to cols - 1)
      // Map normY (-1 to 1) to Rows (0 to rows - 1)
      const cols = spritesheet.columns;
      const rows = spritesheet.rows;

      // Map normX [-1, 1] -> [0, cols - 1]
      const colIdx = Math.round(((normX + 1) / 2) * (cols - 1));
      // Map normY [-1, 1] -> [0, rows - 1]
      const rowIdx = Math.round(((normY + 1) / 2) * (rows - 1));

      const safeCol = Math.max(0, Math.min(cols - 1, colIdx));
      const safeRow = Math.max(0, Math.min(rows - 1, rowIdx));

      const frameIndex = safeRow * cols + safeCol;
      if (frameIndex >= 0 && frameIndex < spritesheet.frames.length) {
        setActiveFrameIndex(frameIndex);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [spritesheet, demoConfig]);

  if (!spritesheet) {
    return (
      <div className="flex flex-col items-center justify-center h-80 bg-white dark:bg-zinc-950 rounded-xl border-2 border-black dark:border-zinc-800 p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]">
        <MousePointer className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mb-3 animate-bounce" />
        <h3 className="text-base font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">No Spritesheet Captured Yet</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mt-1 font-medium">
          Click "Bake Spritesheet" first to render your 3D model into an interactive 2D look-at avatar!
        </p>
      </div>
    );
  }

  const currentFrame = spritesheet.frames[activeFrameIndex] || spritesheet.frames[0];

  // Calculate background image offset for sprite display
  const bgX = - (spritesheet.padding + currentFrame.col * (spritesheet.frameWidth + spritesheet.padding));
  const bgY = - (spritesheet.padding + currentFrame.row * (spritesheet.frameHeight + spritesheet.padding));

  const copyToClipboard = (codeText: string, tabKey: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedTab(tabKey);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const reactCodeSnippet = `// React Mouse-Tracking Spritesheet Component
import React, { useState, useEffect, useRef } from 'react';

export function CursorLookAtAvatar({ spritesheetUrl = "${spritesheet.dataUrl.slice(0, 30)}..." }) {
  const avatarRef = useRef(null);
  const [frame, setFrame] = useState({ col: ${Math.floor(spritesheet.columns / 2)}, row: ${Math.floor(spritesheet.rows / 2)} });

  useEffect(() => {
    const handleMove = (e) => {
      if (!avatarRef.current) return;
      const rect = avatarRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const maxDist = ${demoConfig.followDistance};

      const normX = Math.max(-1, Math.min(1, (e.clientX - cx) / maxDist));
      const normY = Math.max(-1, Math.min(1, (e.clientY - cy) / maxDist));

      const col = Math.round(((normX + 1) / 2) * (${spritesheet.columns} - 1));
      const row = Math.round(((normY + 1) / 2) * (${spritesheet.rows} - 1));

      setFrame({ col, row });
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const frameW = ${spritesheet.frameWidth};
  const frameH = ${spritesheet.frameHeight};
  const posX = - (frame.col * frameW);
  const posY = - (frame.row * frameH);

  return (
    <div
      ref={avatarRef}
      style={{
        width: \`\${frameW}px\`,
        height: \`\${frameH}px\`,
        backgroundImage: \`url(\${spritesheetUrl})\`,
        backgroundPosition: \`\${posX}px \${posY}px\`,
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}`;

  const jsCodeSnippet = `<!-- Vanilla HTML & JS Mouse Cursor Tracking Avatar -->
<div id="avatar-sprite" style="
  width: ${spritesheet.frameWidth}px;
  height: ${spritesheet.frameHeight}px;
  background-image: url('spritesheet.png');
  background-repeat: no-repeat;
"></div>

<script>
const sprite = document.getElementById('avatar-sprite');
const COLS = ${spritesheet.columns};
const ROWS = ${spritesheet.rows};
const FRAME_W = ${spritesheet.frameWidth};
const FRAME_H = ${spritesheet.frameHeight};

window.addEventListener('mousemove', (e) => {
  const rect = sprite.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const maxDist = ${demoConfig.followDistance};

  const normX = Math.max(-1, Math.min(1, (e.clientX - cx) / maxDist));
  const normY = Math.max(-1, Math.min(1, (e.clientY - cy) / maxDist));

  const col = Math.round(((normX + 1) / 2) * (COLS - 1));
  const row = Math.round(((normY + 1) / 2) * (ROWS - 1));

  sprite.style.backgroundPosition = \`-\${col * FRAME_W}px -\${row * FRAME_H}px\`;
});
</script>`;

  return (
    <div className="space-y-6">
      {/* Interactive Stage Canvas */}
      <div
        ref={containerRef}
        className="relative min-h-[380px] sm:min-h-[440px] flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-950 rounded-xl border-2 border-black dark:border-zinc-800 p-6 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] group cursor-crosshair select-none"
      >
        {/* Orbit indicator ring */}
        <div
          className="absolute rounded-full border-2 border-dashed border-black/30 dark:border-white/30 pointer-events-none transition-all duration-300"
          style={{
            width: `${demoConfig.followDistance * 2}px`,
            height: `${demoConfig.followDistance * 2}px`,
          }}
        />

        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white px-3 py-1.5 rounded-md text-xs font-mono font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Move cursor around stage to test live look-at tracking</span>
        </div>

        {/* Dynamic Frame Display */}
        <div className="relative flex flex-col items-center justify-center my-8 z-10">
          <div
            className="rounded-lg border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-black transition-transform duration-75 hover:scale-105"
            style={{
              width: `${spritesheet.frameWidth}px`,
              height: `${spritesheet.frameHeight}px`,
              backgroundImage: `url(${spritesheet.dataUrl})`,
              backgroundPosition: `${bgX}px ${bgY}px`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${spritesheet.width}px ${spritesheet.height}px`,
            }}
          />

          {/* Target Reticle / Pointer Ray */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-md border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span>
              Frame #{activeFrameIndex + 1} (R:{currentFrame.row + 1}, C:{currentFrame.col + 1})
            </span>
            <span className="text-zinc-400">|</span>
            <span className="bg-amber-400 text-black px-1.5 py-0.5 rounded border border-black">
              Pitch: {Math.round(currentFrame.pitch)}°
            </span>
            <span className="text-zinc-400">|</span>
            <span className="bg-amber-400 text-black px-1.5 py-0.5 rounded border border-black">
              Yaw: {Math.round(currentFrame.yaw)}°
            </span>
          </div>
        </div>

        {/* Realtime Cursor Stats Pill */}
        <div className="absolute bottom-4 right-4 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 px-3 py-1.5 rounded-md text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div>
            ΔX: <span className="text-black dark:text-white font-extrabold">{Math.round(mousePos.x)}px</span>
          </div>
          <div>
            ΔY: <span className="text-black dark:text-white font-extrabold">{Math.round(mousePos.y)}px</span>
          </div>
          <div>
            Dist: <span className="text-black dark:text-white font-extrabold">{Math.round(mousePos.dist)}px</span>
          </div>
        </div>
      </div>

      {/* Simulator Sensitivity Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-zinc-950 p-4 rounded-xl border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]">
        <div>
          <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
            Tracking Radius ({demoConfig.followDistance}px)
          </label>
          <Slider
            min={100}
            max={800}
            step={10}
            value={[demoConfig.followDistance]}
            onValueChange={([val]) =>
              setDemoConfig({ ...demoConfig, followDistance: val })
            }
          />
          <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium mt-1 block">
            Max cursor distance threshold
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-1.5">
            Sensitivity Multiplier ({demoConfig.sensitivity}x)
          </label>
          <Slider
            min={0.5}
            max={3.0}
            step={0.1}
            value={[demoConfig.sensitivity]}
            onValueChange={([val]) =>
              setDemoConfig({ ...demoConfig, sensitivity: val })
            }
          />
          <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium mt-1 block">Rotation speed multiplier</span>
        </div>

        <div className="flex items-center gap-6 pt-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={demoConfig.invertX}
              onCheckedChange={(checked) => setDemoConfig({ ...demoConfig, invertX: checked })}
            />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase">Invert X</span>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={demoConfig.invertY}
              onCheckedChange={(checked) => setDemoConfig({ ...demoConfig, invertY: checked })}
            />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase">Invert Y</span>
          </div>
        </div>
      </div>

      {/* Code Snippet Embed Export */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border-2 border-black dark:border-zinc-800 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]">
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border-b-2 border-black dark:border-zinc-800">
          <div className="flex items-center gap-2 text-sm font-black uppercase text-zinc-900 dark:text-zinc-100 tracking-wide">
            <Code className="w-4 h-4" />
            <span>Developer Embed Code Snippet</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white dark:bg-zinc-950 p-1 rounded-md border-2 border-black dark:border-zinc-700 text-xs">
              <Button
                variant={codeType === 'react' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCodeType('react')}
                className="h-7 text-[11px]"
              >
                React JSX
              </Button>
              <Button
                variant={codeType === 'js' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCodeType('js')}
                className="h-7 text-[11px]"
              >
                HTML + JS
              </Button>
            </div>

            <Button
              variant="glow"
              size="sm"
              onClick={() =>
                copyToClipboard(codeType === 'react' ? reactCodeSnippet : jsCodeSnippet, codeType)
              }
            >
              {copiedTab === codeType ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-black" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 overflow-x-auto border-t border-zinc-200 dark:border-zinc-800">
          <pre className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed">
            {codeType === 'react' ? reactCodeSnippet : jsCodeSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
