import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Maximize2, Minimize2, Eye, EyeOff, Sparkles, Layers, SlidersHorizontal, Info, ChevronRight, Check } from 'lucide-react';
import { ShoppableItem } from '../types';

interface CompareSliderProps {
  originalImage: string;
  reimaginedImage: string;
  styleName: string;
  roomName: string;
  hotspots?: ShoppableItem[];
  onSelectHotspot?: (item: ShoppableItem) => void;
  activeHotspotId?: string | null;
  isGenerating?: boolean;
}

export const CompareSlider: React.FC<CompareSliderProps> = ({
  originalImage,
  reimaginedImage,
  styleName,
  roomName,
  hotspots = [],
  onSelectHotspot,
  activeHotspotId,
  isGenerating = false,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'hold-reveal'>('slider');
  const [isHoldingOriginal, setIsHoldingOriginal] = useState<boolean>(false);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [hoveredHotspot, setHoveredHotspot] = useState<ShoppableItem | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Handle pointer drag (mouse & touch)
  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handlePointerMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) {
      handlePointerMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handlePointerMove(e.clientX);
      }
    };
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handlePointerMove(e.touches[0].clientX);
      }
    };
    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalTouchMove);
      window.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, handlePointerMove]);

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  const effectivePosition = isHoldingOriginal ? 100 : sliderPosition;

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden bg-stone-900 border border-stone-200/40 shadow-xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl bg-black/95' : ''
      }`}
    >
      {/* Top Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        {/* Room & Style Info Tag */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-950/70 backdrop-blur-md text-white border border-white/10 text-xs shadow-md">
          <span className="font-medium text-stone-200">{roomName}</span>
          <span className="text-stone-500">/</span>
          <span className="text-amber-300 font-medium">{styleName}</span>
          {isGenerating && (
            <span className="flex items-center gap-1.5 text-amber-200 text-xs ml-2 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              Reimagining...
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-lg bg-stone-950/70 backdrop-blur-md border border-white/10 text-white shadow-md">
          {/* View Modes */}
          <button
            onClick={() => setViewMode('slider')}
            title="Interactive Split Slider"
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'slider' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Slider</span>
          </button>

          <button
            onClick={() => setViewMode('side-by-side')}
            title="Side by Side Comparison"
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'side-by-side' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Side-by-Side</span>
          </button>

          {/* Quick Hold to reveal original */}
          <button
            onMouseDown={() => setIsHoldingOriginal(true)}
            onMouseUp={() => setIsHoldingOriginal(false)}
            onTouchStart={() => setIsHoldingOriginal(true)}
            onTouchEnd={() => setIsHoldingOriginal(false)}
            title="Press and hold to view original room"
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors select-none ${
              isHoldingOriginal ? 'bg-amber-400 text-stone-950' : 'text-stone-300 hover:text-white'
            }`}
          >
            <span className="text-xs">Hold for Original</span>
          </button>

          {/* Hotspots Toggle */}
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            title={showHotspots ? 'Hide furniture hotspots' : 'Show furniture hotspots'}
            className={`p-1.5 rounded-md transition-colors ${
              showHotspots ? 'text-amber-300 hover:text-amber-200' : 'text-stone-400 hover:text-white'
            }`}
          >
            {showHotspots ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 rounded-md text-stone-300 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Visual Display */}
      {viewMode === 'side-by-side' ? (
        /* Side by Side Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-full bg-stone-950 aspect-[16/10] md:aspect-[16/9]">
          <div className="relative w-full h-full overflow-hidden group">
            <img
              src={originalImage}
              alt="Original Space"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
              Original Space
            </div>
          </div>
          <div className="relative w-full h-full overflow-hidden group">
            <img
              src={reimaginedImage}
              alt={`Reimagined ${styleName}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/60 backdrop-blur-sm text-amber-300 text-xs font-medium flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Reimagined: {styleName}
            </div>

            {/* Hotspots in side-by-side */}
            {showHotspots &&
              hotspots.map((item) => {
                if (!item.hotspot) return null;
                const isActive = activeHotspotId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectHotspot && onSelectHotspot(item)}
                    style={{ left: `${item.hotspot.x}%`, top: `${item.hotspot.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group z-20 transition-transform ${
                      isActive ? 'scale-125' : 'hover:scale-110'
                    }`}
                  >
                    <span className="relative flex h-7 w-7 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-70"></span>
                      <span className="relative inline-flex items-center justify-center rounded-full h-6 w-6 bg-amber-500 text-stone-950 font-bold text-xs shadow-lg border border-white">
                        +
                      </span>
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      ) : (
        /* Split Slider Mode */
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="slider"
          aria-valuenow={Math.round(sliderPosition)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Before and after makeover comparison slider"
          className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] overflow-hidden select-none cursor-ew-resize focus:outline-none"
        >
          {/* Base Layer: Reimagined AI Makeover (Right / Underneath) */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={reimaginedImage}
              alt={`Reimagined ${styleName}`}
              className="w-full h-full object-cover pointer-events-none"
            />

            {/* Hotspot Pins (Pinned on Reimagined Layer) */}
            {showHotspots &&
              hotspots.map((item) => {
                if (!item.hotspot) return null;
                // Only show hotspot if the slider hasn't covered it with the original photo
                const isRevealed = item.hotspot.x > effectivePosition - 4;
                if (!isRevealed) return null;

                const isActive = activeHotspotId === item.id;

                return (
                  <div
                    key={item.id}
                    style={{ left: `${item.hotspot.x}%`, top: `${item.hotspot.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                    onMouseEnter={() => setHoveredHotspot(item)}
                    onMouseLeave={() => setHoveredHotspot(null)}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectHotspot) onSelectHotspot(item);
                      }}
                      className={`relative flex items-center justify-center rounded-full transition-transform duration-200 cursor-pointer ${
                        isActive
                          ? 'w-8 h-8 bg-amber-400 text-stone-950 shadow-xl ring-4 ring-amber-300/40 scale-110'
                          : 'w-7 h-7 bg-stone-900/90 text-white hover:bg-amber-500 hover:text-stone-950 shadow-lg border border-white/60'
                      }`}
                    >
                      <span className="text-xs font-semibold">{isActive ? '✓' : '+'}</span>
                    </button>

                    {/* Hover Card */}
                    {hoveredHotspot?.id === item.id && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectHotspot) onSelectHotspot(item);
                        }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-xl bg-stone-950/95 backdrop-blur-md text-white border border-white/15 shadow-2xl z-30 pointer-events-auto cursor-pointer animate-fadeIn"
                      >
                        <div className="flex gap-2.5 items-center">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover bg-stone-800 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-medium block truncate">
                              {item.brand}
                            </span>
                            <h4 className="text-xs font-semibold text-stone-100 truncate leading-tight">
                              {item.title}
                            </h4>
                            <span className="text-xs text-stone-300 font-medium mt-0.5 block">
                              ${item.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-300">
                          <span>View Product Specs</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Top Layer: Original Room (Clipped from left to sliderPosition) */}
          <div
            className="absolute inset-0 h-full overflow-hidden pointer-events-none"
            style={{ width: `${effectivePosition}%` }}
          >
            <img
              src={originalImage}
              alt="Original Space"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100vw',
                maxWidth: 'none',
              }}
            />
          </div>

          {/* Vertical Divider Line */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none"
            style={{ left: `${effectivePosition}%` }}
          >
            {/* The crisp hairline separator */}
            <div className="w-[2px] h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)] -translate-x-1/2" />

            {/* Draggable Circular Knob */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-stone-900 shadow-2xl border-2 border-stone-800 flex items-center justify-center transition-transform ${
                isDragging ? 'scale-110 shadow-[0_0_20px_rgba(255,255,255,0.9)]' : 'hover:scale-105'
              }`}
            >
              <div className="flex items-center gap-0.5 text-stone-800">
                <span className="text-[11px] font-bold">◀</span>
                <span className="text-[11px] font-bold">▶</span>
              </div>
            </div>
          </div>

          {/* Bottom Indicators */}
          <div className="absolute bottom-3 left-4 z-20 pointer-events-none">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-md transition-opacity duration-200 ${
                effectivePosition > 15
                  ? 'bg-stone-950/75 text-white border border-white/15 opacity-100'
                  : 'opacity-0'
              }`}
            >
              Original Space
            </span>
          </div>

          <div className="absolute bottom-3 right-4 z-20 pointer-events-none">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-md transition-opacity duration-200 flex items-center gap-1.5 ${
                effectivePosition < 85
                  ? 'bg-stone-950/75 text-amber-300 border border-white/15 opacity-100'
                  : 'opacity-0'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              Reimagined: {styleName}
            </span>
          </div>
        </div>
      )}

      {/* Helpful Hint bar underneath */}
      <div className="px-4 py-2 bg-stone-950/90 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-stone-400" />
          <span>Drag slider or click hotspot dots (+) to explore curated furniture & decor</span>
        </div>
        <div className="text-stone-400">
          Split: <span className="font-semibold text-stone-200">{Math.round(sliderPosition)}% Makeover</span>
        </div>
      </div>
    </div>
  );
};
