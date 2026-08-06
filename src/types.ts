export type LayoutType = 'grid' | 'row' | 'column';

export type RotationAxis = 'Y' | 'X' | 'Z';

export interface AxisRange {
  start: number; // in degrees, e.g. -60
  end: number;   // in degrees, e.g. 60
}

export interface GridMultiAxisConfig {
  pitchAxis: 'X' | 'Y' | 'Z';
  yawAxis: 'X' | 'Y' | 'Z';
  pitchRange: AxisRange; // e.g. -45 to +45
  yawRange: AxisRange;   // e.g. -180 to +180 or -60 to +60
}

export type EnvironmentPresetType =
  | 'apartment'
  | 'city'
  | 'dawn'
  | 'forest'
  | 'lobby'
  | 'night'
  | 'park'
  | 'studio'
  | 'sunset'
  | 'warehouse'
  | 'none';

export interface LightConfig {
  position: [number, number, number];
  intensity: number;
  color: string;
  enabled: boolean;
}

export interface SceneConfig {
  zoom: number;            // camera distance / fov factor
  pitchOffset: number;     // initial camera tilt angle
  yawOffset: number;       // initial camera yaw angle
  lightIntensity: number;  // directional light
  ambientIntensity: number; // ambient light
  lightColor: string;
  lightPosition: [number, number, number];
  backgroundColor: string;
  transparentBg: boolean;
  materialOverride: 'default' | 'wireframe' | 'clay' | 'metal' | 'toon';
  autoRotatePreview: boolean;
  shadows: boolean;
  environmentPreset?: EnvironmentPresetType;
  showLightHelpers?: boolean;
  keyLight?: LightConfig;
  fillLight?: LightConfig;
  rimLight?: LightConfig;
}

export interface SpritesheetConfig {
  layout: LayoutType;
  columns: number;
  rows: number;
  totalFrames: number;
  frameWidth: number;   // e.g., 128
  frameHeight: number;  // e.g., 128
  padding: number;      // gap between frames
  
  // Rotation mode
  isMultiAxisGrid: boolean; // true for 2D pitch/yaw face grid
  singleAxis: RotationAxis;
  singleAxisRange: AxisRange;
  
  gridMultiAxis: GridMultiAxisConfig;
  
  // Animation timing
  fps: number;
}

export interface Preset {
  id: string;
  name: string;
  description?: string;
  updatedAt: number;
  sceneConfig: SceneConfig;
  spritesheetConfig: SpritesheetConfig;
}

export interface ModelAsset {
  id: string;
  name: string;
  type: 'sample' | 'custom';
  url: string;
  format?: 'glb' | 'gltf' | 'obj' | 'stl' | 'ply' | 'procedural';
  sampleType?: 'robot_head' | 'cyber_face' | 'helmet' | 'gem' | 'spaceship' | 'coin';
}

export interface CapturedFrame {
  index: number;
  row: number;
  col: number;
  pitch: number;
  yaw: number;
  roll: number;
  dataUrl: string;
  canvas: HTMLCanvasElement;
}

export interface GeneratedSpritesheet {
  dataUrl: string;
  width: number;
  height: number;
  columns: number;
  rows: number;
  frameWidth: number;
  frameHeight: number;
  padding: number;
  frames: CapturedFrame[];
}

export interface InteractiveDemoConfig {
  sensitivity: number;
  deadzone: number;
  followDistance: number;
  invertX: boolean;
  invertY: boolean;
  smoothing: number;
}
