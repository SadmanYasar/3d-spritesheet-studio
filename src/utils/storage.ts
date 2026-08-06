import { Preset, SceneConfig, SpritesheetConfig } from '../types';

export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  zoom: 1.0,
  pitchOffset: 0,
  yawOffset: 0,
  lightIntensity: 1.8,
  ambientIntensity: 0.7,
  lightColor: '#ffffff',
  lightPosition: [5, 10, 7.5],
  backgroundColor: '#0f172a',
  transparentBg: true,
  materialOverride: 'default',
  autoRotatePreview: false,
  shadows: true,
};

export const DEFAULT_SPRITESHEET_CONFIG: SpritesheetConfig = {
  layout: 'grid',
  columns: 5,
  rows: 5,
  totalFrames: 25,
  frameWidth: 128,
  frameHeight: 128,
  padding: 0,
  
  isMultiAxisGrid: true,
  singleAxis: 'Y',
  singleAxisRange: { start: 0, end: 360 },
  
  gridMultiAxis: {
    pitchAxis: 'X', // Rows = Pitch (Look Up / Down)
    yawAxis: 'Y',   // Cols = Yaw (Look Left / Right)
    pitchRange: { start: -35, end: 35 },
    yawRange: { start: -45, end: 45 },
  },
  
  fps: 12,
};

export const BUILTIN_PRESETS: Preset[] = [
  {
    id: 'preset-face-cursor-5x5',
    name: 'Face Look-At Grid (5x5)',
    description: 'Perfect for mouse cursor eye & face tracking (Pitch -35° to +35°, Yaw -45° to +45°)',
    updatedAt: Date.now(),
    sceneConfig: { ...DEFAULT_SCENE_CONFIG, transparentBg: true },
    spritesheetConfig: { ...DEFAULT_SPRITESHEET_CONFIG, columns: 5, rows: 5, totalFrames: 25, isMultiAxisGrid: true },
  },
  {
    id: 'preset-360-turntable-16',
    name: '360° Single-Row Spin (16 Frames)',
    description: '16-frame 360 degree turntable rotation along Y-axis in a single row',
    updatedAt: Date.now(),
    sceneConfig: { ...DEFAULT_SCENE_CONFIG, transparentBg: true },
    spritesheetConfig: {
      ...DEFAULT_SPRITESHEET_CONFIG,
      layout: 'row',
      columns: 16,
      rows: 1,
      totalFrames: 16,
      isMultiAxisGrid: false,
      singleAxis: 'Y',
      singleAxisRange: { start: 0, end: 360 },
    },
  },
  {
    id: 'preset-isometric-8dir',
    name: '8-Directional Character (8 Frames)',
    description: '8 directional angles for games & RPGs',
    updatedAt: Date.now(),
    sceneConfig: { ...DEFAULT_SCENE_CONFIG, pitchOffset: 30, transparentBg: true },
    spritesheetConfig: {
      ...DEFAULT_SPRITESHEET_CONFIG,
      layout: 'grid',
      columns: 4,
      rows: 2,
      totalFrames: 8,
      isMultiAxisGrid: false,
      singleAxis: 'Y',
      singleAxisRange: { start: 0, end: 360 },
    },
  },
  {
    id: 'preset-grid-360-16',
    name: '4x4 Grid Spin (16 Frames)',
    description: '360 degree rotation spread into a 4x4 matrix grid',
    updatedAt: Date.now(),
    sceneConfig: { ...DEFAULT_SCENE_CONFIG, transparentBg: true },
    spritesheetConfig: {
      ...DEFAULT_SPRITESHEET_CONFIG,
      layout: 'grid',
      columns: 4,
      rows: 4,
      totalFrames: 16,
      isMultiAxisGrid: false,
      singleAxis: 'Y',
      singleAxisRange: { start: 0, end: 360 },
    },
  },
];

const PRESETS_STORAGE_KEY = '3d_spritesheet_presets_v1';
const RECENT_CONFIG_KEY = '3d_spritesheet_recent_config_v1';

export function loadSavedPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (raw) {
      const userPresets = JSON.parse(raw);
      return [...BUILTIN_PRESETS, ...userPresets];
    }
  } catch (err) {
    console.error('Failed to load presets from localStorage', err);
  }
  return BUILTIN_PRESETS;
}

export function saveUserPreset(preset: Omit<Preset, 'id' | 'updatedAt'>): Preset {
  const newPreset: Preset = {
    ...preset,
    id: 'preset-custom-' + Date.now(),
    updatedAt: Date.now(),
  };

  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    const existing: Preset[] = raw ? JSON.parse(raw) : [];
    const updated = [newPreset, ...existing];
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save user preset', err);
  }

  return newPreset;
}

export function deleteUserPreset(id: string): void {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (!raw) return;
    const existing: Preset[] = JSON.parse(raw);
    const updated = existing.filter((p) => p.id !== id);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete preset', err);
  }
}

export function saveRecentConfig(sceneConfig: SceneConfig, spritesheetConfig: SpritesheetConfig) {
  try {
    localStorage.setItem(
      RECENT_CONFIG_KEY,
      JSON.stringify({ sceneConfig, spritesheetConfig, savedAt: Date.now() })
    );
  } catch (err) {
    console.error('Failed to save recent config', err);
  }
}

export function loadRecentConfig(): { sceneConfig: SceneConfig; spritesheetConfig: SpritesheetConfig } | null {
  try {
    const raw = localStorage.getItem(RECENT_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.sceneConfig && parsed.spritesheetConfig) {
        return {
          sceneConfig: parsed.sceneConfig,
          spritesheetConfig: parsed.spritesheetConfig,
        };
      }
    }
  } catch (err) {
    console.error('Failed to load recent config', err);
  }
  return null;
}
