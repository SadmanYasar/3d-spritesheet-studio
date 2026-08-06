import { NormalizedLandmarkList } from '@mediapipe/face_mesh';
import { FaceCaptureTarget, FaceStudioConfig } from '../types';

export interface FaceOrientation {
  pitch: number; // In degrees (-60 to +60)
  yaw: number;   // In degrees (-90 to +90)
  roll: number;  // In degrees (-45 to +45)
}

/**
 * Calculates head Pitch, Yaw, and Roll angles in degrees from MediaPipe 468 3D face landmarks
 */
export function computeFaceOrientation(landmarks: NormalizedLandmarkList): FaceOrientation {
  if (!landmarks || landmarks.length < 468) {
    return { pitch: 0, yaw: 0, roll: 0 };
  }

  const pNose = landmarks[1];      // Nose tip
  const pChin = landmarks[152];    // Chin bottom
  const pForehead = landmarks[10]; // Forehead top
  const pLeftEye = landmarks[33];  // Left eye outer
  const pRightEye = landmarks[263];// Right eye outer

  // Eye line span
  const dxEye = pRightEye.x - pLeftEye.x;
  const dyEye = pRightEye.y - pLeftEye.y;
  const dzEye = pRightEye.z - pLeftEye.z;
  const eyeDist = Math.sqrt(dxEye * dxEye + dyEye * dyEye + dzEye * dzEye) || 0.001;

  // 1. YAW (Head rotation left/right: +Yaw = TURN RIGHT, -Yaw = TURN LEFT)
  const eyeMidX = (pLeftEye.x + pRightEye.x) / 2;
  const noseOffset = (eyeMidX - pNose.x) / eyeDist;
  const yawAngle = noseOffset * 150 + (dzEye / eyeDist) * 90;
  const yaw = Math.max(-90, Math.min(90, Math.round(yawAngle)));

  // 2. PITCH (Head tilt up/down: +Pitch = LOOK UP, -Pitch = LOOK DOWN)
  const faceHeight = Math.abs(pChin.y - pForehead.y) || 0.001;
  const noseHeightRatio = (pNose.y - pForehead.y) / faceHeight;
  const pitchAngle = (0.50 - noseHeightRatio) * 160;
  const pitch = Math.max(-60, Math.min(60, Math.round(pitchAngle)));

  // 3. ROLL (Head tilt left/right)
  const rollRad = Math.atan2(dyEye, dxEye);
  const roll = Math.round(rollRad * (180 / Math.PI));

  return { pitch, yaw, roll };
}

/**
 * Generates array of target poses based on grid dimensions and angular ranges
 */
export function generateFaceTargetGrid(config: FaceStudioConfig): FaceCaptureTarget[] {
  const { gridRows, gridCols, pitchMin, pitchMax, yawMin, yawMax } = config;
  const targets: FaceCaptureTarget[] = [];

  const pitchStep = gridRows > 1 ? (pitchMax - pitchMin) / (gridRows - 1) : 0;
  const yawStep = gridCols > 1 ? (yawMax - yawMin) / (gridCols - 1) : 0;

  let idx = 0;
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const targetPitch = Math.round(pitchMax - r * pitchStep);
      const targetYaw = Math.round(yawMin + c * yawStep);

      let pLabel = targetPitch === 0 ? 'LEVEL' : targetPitch > 0 ? 'UP' : 'DOWN';
      let yLabel = targetYaw === 0 ? 'CENTER' : targetYaw > 0 ? 'RIGHT' : 'LEFT';
      const label = `${pLabel} ${Math.abs(targetPitch)}° / ${yLabel} ${Math.abs(targetYaw)}°`;

      targets.push({
        index: idx,
        row: r,
        col: c,
        targetPitch,
        targetYaw,
        label,
      });

      idx++;
    }
  }

  return targets;
}

/**
 * Checks if current face orientation matches target pose within tolerance degrees
 */
export function isFaceInTargetPose(
  current: FaceOrientation,
  target: FaceCaptureTarget,
  toleranceDeg: number = 7
): boolean {
  const pitchDiff = Math.abs(current.pitch - target.targetPitch);
  const yawDiff = Math.abs(current.yaw - target.targetYaw);

  return pitchDiff <= toleranceDeg && yawDiff <= toleranceDeg;
}
