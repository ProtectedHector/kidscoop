"use client";

import { PointerEvent, useEffect, useRef, useState } from 'react';

const PALETTE = [
  '#000000',
  '#3b2f2f',
  '#8d5524',
  '#c68642',
  '#e0ac69',
  '#ff6b6b',
  '#ff8fab',
  '#ffb347',
  '#ff9f1c',
  '#ffd93d',
  '#f9f871',
  '#fff3b0',
  '#6bcB77',
  '#38b000',
  '#b8f2e6',
  '#2ec4b6',
  '#00b4d8',
  '#4d96ff',
  '#73c2fb',
  '#274c77',
  '#845ef7',
  '#c77dff',
  '#9d4edd',
  '#ff7eb6',
  '#ef476f',
  '#adb5bd',
  '#6c757d',
  '#ffffff',
] as const;

const BOARD_ASPECT_RATIO = '3 / 2';
const LINE_THRESHOLD = 245;

interface ArticleColoringStudioLabels {
  title: string;
  description: string;
  hint: string;
  undo: string;
  redo: string;
  reset: string;
  downloadArtwork: string;
  downloadPage: string;
  loading: string;
}

interface ArticleColoringStudioProps {
  imageId: number | string;
  imageAlt: string;
  labels: ArticleColoringStudioLabels;
}

function cloneImageData(imageData: ImageData) {
  return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function isLinePixel(data: Uint8ClampedArray, index: number) {
  const alpha = data[index + 3];
  const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;

  return alpha > 0 && brightness < LINE_THRESHOLD;
}

function getBrushCursor(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <path d="M22 3l7 7-11 11c-1.2 1.2-2.6 2-4.2 2.5L9 25l1.5-4.8c.5-1.6 1.3-3 2.5-4.2L22 3Z" fill="${color}" stroke="#3b2f2f" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M23.5 2.5 29.5 8.5" stroke="#f6f7fb" stroke-width="2" stroke-linecap="round" opacity="0.85"/>
      <path d="M8 26c1.7-2.8 3.9-4.3 6.6-4.6" stroke="#3b2f2f" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 4 28, pointer`;
}

export default function ArticleColoringStudio({
  imageId,
  imageAlt,
  labels,
}: ArticleColoringStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseImageDataRef = useRef<ImageData | null>(null);
  const workingImageDataRef = useRef<ImageData | null>(null);
  const undoHistoryRef = useRef<ImageData[]>([]);
  const redoHistoryRef = useRef<ImageData[]>([]);

  const [selectedColor, setSelectedColor] = useState<string>(PALETTE[0]);
  const [isReady, setIsReady] = useState(false);
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);

  const imageSrc = `/articles/${imageId}c.png`;
  const brushCursor = getBrushCursor(selectedColor);

  const drawImageData = (imageData: ImageData) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      return;
    }

    context.putImageData(imageData, 0, 0);
  };

  const resetArtwork = () => {
    const baseImageData = baseImageDataRef.current;
    if (!baseImageData) {
      return;
    }

    const nextImageData = cloneImageData(baseImageData);
    workingImageDataRef.current = nextImageData;
    undoHistoryRef.current = [];
    redoHistoryRef.current = [];
    setUndoCount(0);
    setRedoCount(0);
    drawImageData(nextImageData);
  };

  const undoArtwork = () => {
    const previousImageData = undoHistoryRef.current.pop();
    const currentImageData = workingImageDataRef.current;

    if (!previousImageData || !currentImageData) {
      return;
    }

    redoHistoryRef.current = [...redoHistoryRef.current.slice(-4), cloneImageData(currentImageData)];
    setRedoCount(redoHistoryRef.current.length);

    const nextImageData = cloneImageData(previousImageData);
    workingImageDataRef.current = nextImageData;
    setUndoCount(undoHistoryRef.current.length);
    drawImageData(nextImageData);
  };

  const redoArtwork = () => {
    const nextRedoImageData = redoHistoryRef.current.pop();
    const currentImageData = workingImageDataRef.current;

    if (!nextRedoImageData || !currentImageData) {
      return;
    }

    undoHistoryRef.current = [...undoHistoryRef.current.slice(-4), cloneImageData(currentImageData)];
    setUndoCount(undoHistoryRef.current.length);

    const nextImageData = cloneImageData(nextRedoImageData);
    workingImageDataRef.current = nextImageData;
    setRedoCount(redoHistoryRef.current.length);
    drawImageData(nextImageData);
  };

  useEffect(() => {
    let isActive = true;
    setIsReady(false);

    const image = new window.Image();
    image.src = imageSrc;

    image.onload = () => {
      if (!isActive) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        return;
      }

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const baseImageData = context.getImageData(0, 0, canvas.width, canvas.height);
      baseImageDataRef.current = baseImageData;
      workingImageDataRef.current = cloneImageData(baseImageData);
      undoHistoryRef.current = [];
      redoHistoryRef.current = [];
      setUndoCount(0);
      setRedoCount(0);
      setIsReady(true);
    };

    image.onerror = () => {
      if (isActive) {
        setIsReady(false);
      }
    };

    return () => {
      isActive = false;
    };
  }, [imageSrc]);

  const fillRegion = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const baseImageData = baseImageDataRef.current;
    const workingImageData = workingImageDataRef.current;

    if (!canvas || !baseImageData || !workingImageData) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((clientY - rect.top) / rect.height) * canvas.height);

    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
      return;
    }

    const seed = y * canvas.width + x;
    const seedDataIndex = seed * 4;

    if (isLinePixel(baseImageData.data, seedDataIndex)) {
      return;
    }

    undoHistoryRef.current = [...undoHistoryRef.current.slice(-4), cloneImageData(workingImageData)];
    redoHistoryRef.current = [];
    setUndoCount(undoHistoryRef.current.length);
    setRedoCount(0);

    const { r, g, b } = hexToRgb(selectedColor);
    const visited = new Uint8Array(canvas.width * canvas.height);
    const stack = [seed];
    const nextData = workingImageData.data;
    const baseData = baseImageData.data;

    while (stack.length > 0) {
      const current = stack.pop();
      if (current === undefined || visited[current] === 1) {
        continue;
      }

      visited[current] = 1;

      const pixelIndex = current * 4;
      if (isLinePixel(baseData, pixelIndex)) {
        continue;
      }

      nextData[pixelIndex] = r;
      nextData[pixelIndex + 1] = g;
      nextData[pixelIndex + 2] = b;
      nextData[pixelIndex + 3] = 255;

      const column = current % canvas.width;
      const row = Math.floor(current / canvas.width);

      if (column > 0) {
        stack.push(current - 1);
      }
      if (column < canvas.width - 1) {
        stack.push(current + 1);
      }
      if (row > 0) {
        stack.push(current - canvas.width);
      }
      if (row < canvas.height - 1) {
        stack.push(current + canvas.width);
      }
    }

    drawImageData(workingImageData);
  };

  const handleCanvasPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    fillRegion(event.clientX, event.clientY);
  };

  const downloadArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${sanitizeFileName(imageAlt)}_colored.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPage = () => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `${sanitizeFileName(imageAlt)}_coloring_page.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20 overflow-hidden">
      <div className="flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-white text-center">🎨 {labels.title}</h2>
        <p className="mx-auto max-w-4xl text-center text-white/70">{labels.description}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={undoArtwork}
              disabled={undoCount === 0}
              className="rounded-full border border-white/20 bg-white/10 p-3 text-white transition enabled:hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={labels.undo}
              title={labels.undo}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7 4 12l5 5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 17a8 8 0 0 0-8-8H4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={redoArtwork}
              disabled={redoCount === 0}
              className="rounded-full border border-white/20 bg-white/10 p-3 text-white transition enabled:hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={labels.redo}
              title={labels.redo}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 7 5 5-5 5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 17a8 8 0 0 1 8-8h8" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            onClick={resetArtwork}
            className="min-h-12 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            {labels.reset}
          </button>
          <button
            type="button"
            onClick={downloadArtwork}
            className="min-h-12 rounded-full border border-white/20 bg-gradient-to-r from-sky-400 to-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
          >
            {labels.downloadArtwork}
          </button>
          <button
            type="button"
            onClick={downloadPage}
            className="min-h-12 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            {labels.downloadPage}
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div
          className="grid min-w-[48rem] gap-3"
          style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}
        >
          {PALETTE.map((color) => {
            const isActive = color === selectedColor;

            return (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`h-11 w-11 rounded-full border-4 transition ${
                  isActive ? 'scale-110 border-white shadow-lg shadow-white/20' : 'border-white/20'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Color ${color}`}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/15 bg-white shadow-2xl">
        <canvas
          ref={canvasRef}
          className="block w-full h-auto bg-white"
          style={{
            aspectRatio: BOARD_ASPECT_RATIO,
            touchAction: 'manipulation',
            cursor: isReady ? brushCursor : 'default',
          }}
          onPointerDown={handleCanvasPointerDown}
        />
      </div>

      {!isReady && (
        <p className="mt-4 text-sm text-white/60">{labels.loading}</p>
      )}
    </section>
  );
}
