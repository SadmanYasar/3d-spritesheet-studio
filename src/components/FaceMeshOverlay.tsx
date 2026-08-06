import React, { useEffect, useRef } from 'react';
import { NormalizedLandmarkList, FACEMESH_TESSELATION, FACEMESH_LEFT_EYE, FACEMESH_RIGHT_EYE } from '@mediapipe/face_mesh';

interface FaceMeshOverlayProps {
  landmarks: NormalizedLandmarkList | null;
  targetPitch?: number;
  targetYaw?: number;
}

export function FaceMeshOverlay({ landmarks, targetPitch, targetYaw }: FaceMeshOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Ghost Face Pose Silhouette Guide
    if (targetPitch !== undefined && targetYaw !== undefined) {
      // Invert targetYaw shift because canvas has CSS transform -scale-x-100
      const offsetX = (-targetYaw / 90) * (w * 0.3);
      const offsetY = (-targetPitch / 60) * (h * 0.25);
      const cx = w / 2 + offsetX;
      const cy = h / 2 + offsetY;
      const rx = w * 0.18;
      const ry = h * 0.26;

      ctx.save();
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 3.0;
      ctx.strokeStyle = '#fbbf24'; // Vibrant Amber Gold Ghost Oval

      // Head Oval
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, (-targetYaw * Math.PI) / 360, 0, Math.PI * 2);
      ctx.stroke();

      // Target Center Node
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      // Eye & Nose Guide
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - rx * 0.5, cy - ry * 0.2);
      ctx.lineTo(cx + rx * 0.5, cy - ry * 0.2);
      ctx.moveTo(cx, cy - ry * 0.4);
      ctx.lineTo(cx, cy + ry * 0.4);
      ctx.stroke();
      ctx.restore();
    }

    if (!landmarks || landmarks.length < 468) return;

    // 2. Draw Tesselation Wireframe Net
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)'; // Electric Cyan Wireframe

    if (FACEMESH_TESSELATION) {
      ctx.beginPath();
      for (let i = 0; i < FACEMESH_TESSELATION.length; i++) {
        const [p1Idx, p2Idx] = FACEMESH_TESSELATION[i];
        const p1 = landmarks[p1Idx];
        const p2 = landmarks[p2Idx];
        if (p1 && p2) {
          ctx.moveTo(p1.x * w, p1.y * h);
          ctx.lineTo(p2.x * w, p2.y * h);
        }
      }
      ctx.stroke();
    }

    // 3. Highlight Eye Contours
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#f59e0b';

    [FACEMESH_LEFT_EYE, FACEMESH_RIGHT_EYE].forEach((eyeGroup) => {
      if (eyeGroup) {
        ctx.beginPath();
        eyeGroup.forEach(([a, b]) => {
          const p1 = landmarks[a];
          const p2 = landmarks[b];
          if (p1 && p2) {
            ctx.moveTo(p1.x * w, p1.y * h);
            ctx.lineTo(p2.x * w, p2.y * h);
          }
        });
        ctx.stroke();
      }
    });

    // 4. Draw Nose Target Landmark Node
    const pNose = landmarks[1];
    if (pNose) {
      const nx = pNose.x * w;
      const ny = pNose.y * h;
      ctx.fillStyle = '#ec4899'; // Hot Pink Nose Target Node
      ctx.beginPath();
      ctx.arc(nx, ny, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [landmarks, targetPitch, targetYaw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10 block transform -scale-x-100"
    />
  );
}
