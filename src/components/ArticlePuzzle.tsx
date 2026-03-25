"use client";

import { CSSProperties, useEffect, useState } from 'react';

const GRID_OPTIONS = [3, 4, 5] as const;
const BOARD_ASPECT_RATIO = '3 / 2';

interface ArticlePuzzleLabels {
  title: string;
  description: string;
  hint: string;
  solved: string;
  solvedDescription: string;
  shuffle: string;
  difficulty: string;
  status: string;
  moves: string;
  ready: string;
  selected: string;
}

interface ArticlePuzzleProps {
  imageId: number | string;
  imageAlt: string;
  labels: ArticlePuzzleLabels;
}

function createShuffledPieces(gridSize: number) {
  const nextPieces = Array.from({ length: gridSize * gridSize }, (_, index) => index);

  for (let index = nextPieces.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextPieces[index], nextPieces[swapIndex]] = [nextPieces[swapIndex], nextPieces[index]];
  }

  if (nextPieces.every((piece, index) => piece === index)) {
    [nextPieces[0], nextPieces[1]] = [nextPieces[1], nextPieces[0]];
  }

  return nextPieces;
}

function getBackgroundPosition(piece: number, gridSize: number) {
  const row = Math.floor(piece / gridSize);
  const column = piece % gridSize;
  const maxIndex = gridSize - 1;

  return `${(column / maxIndex) * 100}% ${(row / maxIndex) * 100}%`;
}

export default function ArticlePuzzle({ imageId, imageAlt, labels }: ArticlePuzzleProps) {
  const [gridSize, setGridSize] = useState<(typeof GRID_OPTIONS)[number]>(3);
  const [pieces, setPieces] = useState<number[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [celebrationKey, setCelebrationKey] = useState(0);

  const imageSrc = `/articles/${imageId}.png`;
  const totalPieces = gridSize * gridSize;

  useEffect(() => {
    setPieces(createShuffledPieces(gridSize));
    setDraggedIndex(null);
    setSelectedIndex(null);
    setMoveCount(0);
    setIsSolved(false);
  }, [gridSize, imageSrc]);

  useEffect(() => {
    if (pieces.length !== totalPieces) {
      return;
    }

    const solved = pieces.every((piece, index) => piece === index);

    if (solved && moveCount > 0) {
      if (!isSolved) {
        setIsSolved(true);
        setCelebrationKey((current) => current + 1);
      }
      return;
    }

    if (isSolved) {
      setIsSolved(false);
    }
  }, [isSolved, moveCount, pieces, totalPieces]);

  const swapPieces = (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    setPieces((currentPieces) => {
      if (
        sourceIndex < 0 ||
        targetIndex < 0 ||
        sourceIndex >= currentPieces.length ||
        targetIndex >= currentPieces.length
      ) {
        return currentPieces;
      }

      const nextPieces = [...currentPieces];
      [nextPieces[sourceIndex], nextPieces[targetIndex]] = [nextPieces[targetIndex], nextPieces[sourceIndex]];
      return nextPieces;
    });

    setDraggedIndex(null);
    setSelectedIndex(null);
    setMoveCount((current) => current + 1);
  };

  const handleTilePress = (index: number) => {
    if (selectedIndex === null) {
      setSelectedIndex(index);
      return;
    }

    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }

    swapPieces(selectedIndex, index);
  };

  const shuffleBoard = () => {
    setPieces(createShuffledPieces(gridSize));
    setDraggedIndex(null);
    setSelectedIndex(null);
    setMoveCount(0);
    setIsSolved(false);
  };

  const boardReady = pieces.length === totalPieces;

  return (
    <section className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20 overflow-hidden">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">🧩 {labels.title}</h2>
          <p className="text-white/70">{labels.description}</p>
          <p className="mt-2 text-sm text-purple-200/80">{labels.hint}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
            {labels.difficulty}
          </span>
          <div className="flex flex-wrap gap-2">
            {GRID_OPTIONS.map((option) => {
              const isActive = option === gridSize;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGridSize(option)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 shadow-lg shadow-pink-500/30'
                      : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
                  }`}
                >
                  {option} x {option}
                  <span className="ml-2 text-xs opacity-80">{option * option}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={shuffleBoard}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            {labels.shuffle}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
        <div className="relative">
          <div
            className={`relative overflow-hidden rounded-2xl border border-white/15 bg-slate-950/40 shadow-2xl ${
              isSolved ? 'animate-puzzle-glow' : ''
            }`}
            style={{ aspectRatio: BOARD_ASPECT_RATIO }}
          >
            {boardReady ? (
              <div
                className="grid h-full w-full gap-[2px] bg-white/10 p-[2px]"
                style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
              >
                {pieces.map((piece, index) => {
                  const tileStyle: CSSProperties = {
                    backgroundImage: `url(${imageSrc})`,
                    backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                    backgroundPosition: getBackgroundPosition(piece, gridSize),
                  };

                  const isSelected = selectedIndex === index;

                  return (
                    <button
                      key={`${piece}-${index}`}
                      type="button"
                      draggable
                      onClick={() => handleTilePress(index)}
                      onDragStart={() => setDraggedIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (draggedIndex === null) {
                          return;
                        }
                        swapPieces(draggedIndex, index);
                      }}
                      onDragEnd={() => setDraggedIndex(null)}
                      className={`relative min-h-0 rounded-[10px] border transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                        isSelected
                          ? 'scale-[0.97] border-amber-300 shadow-lg shadow-amber-300/30'
                          : 'border-white/10 hover:scale-[0.985] hover:border-white/30'
                      }`}
                      style={tileStyle}
                      aria-label={`${imageAlt} puzzle piece ${piece + 1}`}
                    >
                      <span className="sr-only">
                        {imageAlt} piece {piece + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/5 text-sm text-white/60">
                {labels.shuffle}
              </div>
            )}

            {isSolved && (
              <>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400/15 via-transparent to-amber-300/20" />
                <div
                  key={celebrationKey}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                  {Array.from({ length: 12 }, (_, index) => {
                    const angle = (Math.PI * 2 * index) / 12;
                    const distance = 90 + (index % 3) * 25;
                    const particleStyle = {
                      '--puzzle-x': `${Math.cos(angle) * distance}px`,
                      '--puzzle-y': `${Math.sin(angle) * distance}px`,
                      animationDelay: `${index * 45}ms`,
                    } as CSSProperties;

                    return (
                      <span
                        key={index}
                        className="puzzle-confetti absolute h-3 w-3 rounded-full"
                        style={{
                          ...particleStyle,
                          backgroundColor: ['#f472b6', '#fbbf24', '#34d399', '#60a5fa'][index % 4],
                        }}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">{labels.status}</div>
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-3xl font-bold text-white">{moveCount}</div>
              <div className="text-sm text-white/60">{labels.moves}</div>
            </div>
            <div className={`rounded-2xl border px-4 py-3 transition ${
              isSolved
                ? 'border-emerald-300/50 bg-emerald-400/15 text-emerald-100'
                : 'border-white/10 bg-slate-950/20 text-white/70'
            }`}>
              <div className="font-semibold">
                {isSolved ? labels.solved : selectedIndex === null ? labels.ready : labels.selected}
              </div>
              <div className="mt-1 text-sm opacity-80">
                {isSolved
                  ? labels.solvedDescription
                  : selectedIndex === null
                    ? labels.hint
                    : `${labels.selected}: ${selectedIndex + 1}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
