import React from 'react';
import { X, ExternalLink, Plus, Check, Star, Ruler, Sparkles, ShieldCheck } from 'lucide-react';
import { ShoppableItem } from '../types';

interface ItemDetailModalProps {
  item: ShoppableItem | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (item: ShoppableItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  isSaved,
  onToggleSave,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              {item.brand}
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-600 font-medium">{item.category}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-xs text-white text-[11px] flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-full border border-white"
                style={{ backgroundColor: item.colorHex }}
              />
              <span>{item.colorName}</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-900 leading-snug">
                {item.title}
              </h3>

              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-stone-900">
                  ${item.price.toLocaleString()}
                </span>
                <span className="text-xs text-stone-500">Estimated Retail</span>
              </div>

              {/* Spec list */}
              <div className="mt-4 space-y-2.5 text-xs text-stone-600 border-t border-b border-stone-100 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Dimensions:</span>
                  <span className="font-medium text-stone-800">{item.dimensions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Material:</span>
                  <span className="font-medium text-stone-800">{item.material}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Finish / Color:</span>
                  <span className="font-medium text-stone-800">{item.colorName}</span>
                </div>
              </div>

              {/* Designer Styling Advice */}
              <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Aura Styling Placement</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {item.stylingTip}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-3">
              <button
                onClick={() => onToggleSave(item)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  isSaved
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                }`}
              >
                {isSaved ? <Check className="w-4 h-4 text-amber-800" /> : <Plus className="w-4 h-4" />}
                <span>{isSaved ? 'In Moodboard' : 'Add to Moodboard'}</span>
              </button>

              <a
                href={item.retailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Find Online</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
