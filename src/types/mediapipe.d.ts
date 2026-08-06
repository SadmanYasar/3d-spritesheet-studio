declare module '@mediapipe/face_mesh' {
  export interface NormalizedLandmark {
    x: number;
    y: number;
    z: number;
    visibility?: number;
  }

  export type NormalizedLandmarkList = NormalizedLandmark[];

  export interface Results {
    image: HTMLCanvasElement | HTMLVideoElement | ImageBitmap;
    multiFaceLandmarks?: NormalizedLandmarkList[];
    multiFaceGeometry?: any[];
  }

  export interface Options {
    locateFile?: (path: string, prefix?: string) => string;
    maxNumFaces?: number;
    refineLandmarks?: boolean;
    minDetectionConfidence?: number;
    minTrackingConfidence?: number;
  }

  export class FaceMesh {
    constructor(options?: Options);
    setOptions(options: Options): void;
    onResults(callback: (results: Results) => void): void;
    send(inputs: { image: HTMLCanvasElement | HTMLVideoElement | ImageBitmap }): Promise<void>;
    close(): Promise<void>;
  }

  export const FACEMESH_TESSELATION: Array<[number, number]>;
  export const FACEMESH_RIGHT_EYE: Array<[number, number]>;
  export const FACEMESH_LEFT_EYE: Array<[number, number]>;
  export const FACEMESH_RIGHT_EYEBROW: Array<[number, number]>;
  export const FACEMESH_LEFT_EYEBROW: Array<[number, number]>;
  export const FACEMESH_FACE_OVAL: Array<[number, number]>;
  export const FACEMESH_LIPS: Array<[number, number]>;
}

declare module '@mediapipe/camera_utils' {
  export interface CameraOptions {
    onFrame: () => Promise<void> | void;
    width?: number;
    height?: number;
    facingMode?: 'user' | 'environment';
  }

  export class Camera {
    constructor(videoElement: HTMLVideoElement, options: CameraOptions);
    start(): Promise<void>;
    stop(): void;
  }
}

declare module '@mediapipe/selfie_segmentation' {
  export interface Results {
    image: HTMLCanvasElement | HTMLVideoElement | ImageBitmap;
    segmentationMask: HTMLCanvasElement | HTMLVideoElement | ImageBitmap;
  }

  export interface Options {
    locateFile?: (path: string, prefix?: string) => string;
    modelSelection?: number;
  }

  export class SelfieSegmentation {
    constructor(options?: Options);
    setOptions(options: Options): void;
    onResults(callback: (results: Results) => void): void;
    send(inputs: { image: HTMLCanvasElement | HTMLVideoElement | ImageBitmap }): Promise<void>;
    close(): Promise<void>;
  }
}
