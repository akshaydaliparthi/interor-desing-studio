import React from 'react';
import { X, Trash2, ExternalLink, Download, ShoppingBag, Sparkles, CheckCircle2 } from 'lucide-react';
import { ShoppableItem } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: ShoppableItem[];
  onRemoveItem: (id: string) => void;
  roomName: string;
  styleName: string;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  savedItems,
  onRemoveItem,
  roomName,
  styleName,
}) => {
  if (!isOpen) return null;

  const totalEstimate = savedItems.reduce((acc, item) => acc + item.price, 0);

  const handleExportPlan = () => {
    const textContent = `AURA AI INTERIOR DESIGN STUDIO - MAKEOVER SPECIFICATION
Space: ${roomName}
Aesthetic Concept: ${styleName}
Date: ${new Date().toLocaleDateString()}
Total Estimated Investment: $${totalEstimate.toLocaleString()} USD

CURATED SHOPPING LIST & FURNITURE SCHEDULE:
${savedItems
  .map(
    (item, index) =>
      `${index + 1}. [${item.category}] ${item.title}
   Brand: ${item.brand}
   Price: $${item.price.toLocaleString()}
   Material: ${item.material}
   Dimensions: ${item.dimensions}
   Styling Placement: ${item.stylingTip}
   Search/Shop URL: ${item.retailerUrl}
`
  )
  .join('\n')}

Notes:
- All dimensions should be cross-verified on-site prior to final procurement.
- Recommended lighting color temperature: 2700K Warm White.
Generated via Aura AI Interior Design Studio.`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aura_Design_Plan_${styleName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-slideLeft">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-sm font-semibold tracking-tight">
                Project Moodboard & Sourcing
              </h3>
              <p className="text-xs text-stone-400">
                {savedItems.length} {savedItems.length === 1 ? 'piece' : 'pieces'} selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {savedItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 text-stone-400 space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-stone-600">Your moodboard is empty</p>
              <p className="text-xs text-stone-400 max-w-xs">
                Click the + icon on any furniture hotspot in the visualization or product card in the catalog to add items.
              </p>
            </div>
          ) : (
            savedItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-white transition-all flex gap-3 items-center justify-between"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-14 h-14 rounded-lg object-cover bg-stone-200 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
                    {item.brand}
                  </span>
                  <h4 className="text-xs font-semibold text-stone-900 truncate">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-stone-900">
                      ${item.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-stone-500 truncate">
                      · {item.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <a
                    href={item.retailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
                    title="Open search link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Budget & Export */}
        {savedItems.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">Estimated Sourcing Subtotal</span>
              <span className="text-lg font-bold text-stone-900 font-serif">
                ${totalEstimate.toLocaleString()} USD
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPlan}
                className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export Sourcing Checklist</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
