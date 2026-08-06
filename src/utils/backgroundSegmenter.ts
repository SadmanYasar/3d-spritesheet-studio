/**
 * In-Browser Background Removal Utility using HTML5 Canvas Alpha Thresholding and Edge Segmentation
 */
export function removeBackgroundCanvas(
  inputElement: HTMLVideoElement | HTMLCanvasElement,
  width: number,
  height: number,
  segmentationMask?: HTMLCanvasElement | HTMLVideoElement | ImageBitmap | null
): HTMLCanvasElement {
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const ctx = outputCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return outputCanvas;

  // Mirror input frame horizontally so captured output matches live mirrored webcam preview
  const mirrorCanvas = document.createElement('canvas');
  mirrorCanvas.width = width;
  mirrorCanvas.height = height;
  const mCtx = mirrorCanvas.getContext('2d')!;
  mCtx.translate(width, 0);
  mCtx.scale(-1, 1);
  mCtx.drawImage(inputElement, 0, 0, width, height);

  ctx.drawImage(mirrorCanvas, 0, 0, width, height);

  // If a MediaPipe segmentation mask is provided, multiply mirrored alpha mask directly
  if (segmentationMask) {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d')!;
    maskCtx.translate(width, 0);
    maskCtx.scale(-1, 1);
    maskCtx.drawImage(segmentationMask, 0, 0, width, height);

    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskCanvas, 0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
    return outputCanvas;
  }

  // Fallback: Smart Edge-Guided Alpha Segmentation (Sampling corner background pixels)
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample top-left, top-right, bottom-left corners for background color estimation
  let bgR = (data[0] + data[(width - 1) * 4] + data[(height - 1) * width * 4]) / 3;
  let bgG = (data[1] + data[(width - 1) * 4 + 1] + data[(height - 1) * width * 4 + 1]) / 3;
  let bgB = (data[2] + data[(width - 1) * 4 + 2] + data[(height - 1) * width * 4 + 2]) / 3;

  const threshold = 35;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const colorDist = Math.sqrt(
      (r - bgR) * (r - bgR) + (g - bgG) * (g - bgG) + (b - bgB) * (b - bgB)
    );

    if (colorDist < threshold) {
      // Soft alpha edge feathering
      const alpha = Math.max(0, (colorDist / threshold) * 255);
      data[i + 3] = alpha;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return outputCanvas;
}
