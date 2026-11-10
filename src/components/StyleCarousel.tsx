import React, { useState } from 'react';
import { Sparkles, Check, ChevronLeft, ChevronRight, Wand2, Palette } from 'lucide-react';
import { DesignStyle } from '../types';

interface StyleCarouselProps {
  styles: DesignStyle[];
  activeStyleId: string;
  onSelectStyle: (styleId: string) => void;
  onCustomGenerate: (customPrompt: string, styleTitle: string) => void;
  isGenerating?: boolean;
}

export const StyleCarousel: React.FC<StyleCarouselProps> = ({
  styles,
  activeStyleId,
  onSelectStyle,
  onCustomGenerate,
  isGenerating = false,
}) => {
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customStyleName, setCustomStyleName] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    const title = customStyleName.trim() || 'Bespoke Custom Concept';
    onCustomGenerate(customPrompt.trim(), title);
    setShowCustomModal(false);
    setCustomPrompt('');
    setCustomStyleName('');
  };

  return (
    <div className="w-full">
      {/* Header with Title and Scroll Arrows */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-stone-700" />
            <h3 className="text-base font-semibold text-stone-900 tracking-tight">
              Reimagined Architectural Styles
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Select a signature interior design language or generate a bespoke custom aesthetic.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Custom Aesthetic Generator Button */}
          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors shadow-xs"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-700" />
            <span>Custom Prompt</span>
          </button>

          {/* Carousel Arrows */}
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors shadow-xs"
            aria-label="Previous styles"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors shadow-xs"
            aria-label="Next styles"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Styles Scrollable Track */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {styles.map((style) => {
          const isSelected = activeStyleId === style.id;
          return (
            <div
              key={style.id}
              onClick={() => onSelectStyle(style.id)}
              className={`flex-shrink-0 w-64 md:w-72 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border text-left group ${
                isSelected
                  ? 'border-stone-900 ring-2 ring-stone-900/10 bg-white shadow-md -translate-y-0.5'
                  : 'border-stone-200/80 bg-white/80 hover:bg-white hover:border-stone-300 hover:shadow-xs'
              }`}
            >
              {/* Card Image Thumbnail */}
              <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                <img
                  src={style.thumbnail}
                  alt={style.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-stone-900/90 text-white text-[11px] font-medium flex items-center gap-1 shadow-sm">
                    <Check className="w-3 h-3 text-amber-400" />
                    Active
                  </div>
                )}

                {/* Color Palette preview on thumbnail */}
                <div className="absolute bottom-2 left-2.5 flex items-center gap-1 p-1 rounded-md bg-black/60 backdrop-blur-xs">
                  {style.palette.map((swatch, idx) => (
                    <span
                      key={idx}
                      className="w-3 h-3 rounded-full border border-white/40 shadow-xs"
                      style={{ backgroundColor: swatch.hex }}
                      title={swatch.name}
                    />
                  ))}
                </div>
              </div>

              {/* Text Meta */}
              <div className="p-3.5">
                <div className="flex items-baseline justify-between gap-1">
                  <h4 className="text-sm font-semibold text-stone-900 truncate">
                    {style.name}
                  </h4>
                </div>
                <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                  {style.tagline}
                </p>

                {/* Material cues */}
                <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center gap-1.5 text-[11px] text-stone-500">
                  <span className="text-stone-400">Materials:</span>
                  <span className="truncate text-stone-600 font-medium">
                    {style.keyMaterials.slice(0, 3).join(' · ')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Prompt Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-stone-900">
                    Bespoke AI Architectural Prompt
                  </h3>
                  <p className="text-xs text-stone-500">
                    Generate an entirely custom room aesthetic with Gemini Image AI
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-medium p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Aesthetic Title (e.g. Modern Mediterranean Villa)
                </label>
                <input
                  type="text"
                  value={customStyleName}
                  onChange={(e) => setCustomStyleName(e.target.value)}
                  placeholder="e.g. Kyoto Zen Courtyard, Italian Brutalist, Desert Modernism..."
                  className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Detailed Room Makeover Vision
                </label>
                <textarea
                  rows={4}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe furnishings, materials, wall finishes, floor types, lighting mood, and color palette (e.g., 'Off-white lime-wash walls, reclaimed white oak floorboards, low-profile boucle sofa, oversized fluted travertine coffee table, large arch mirror, diffused afternoon sunlight')..."
                  className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                  required
                />
              </div>

              <div className="bg-stone-50 rounded-lg p-3 text-xs text-stone-500 flex gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Our AI models preserve the structural perspective of your current space while reimagining surfaces, furnishings, lighting, and decor.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customPrompt.trim() || isGenerating}
                  className="px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Generate Makeover</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
