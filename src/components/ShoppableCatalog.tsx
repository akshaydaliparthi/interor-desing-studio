import React, { useState } from 'react';
import { ShoppingBag, ExternalLink, Plus, Check, Filter, Search, Tag, Sparkles } from 'lucide-react';
import { ShoppableItem } from '../types';

interface ShoppableCatalogProps {
  items: ShoppableItem[];
  savedItemIds: Set<string>;
  onToggleSaveItem: (item: ShoppableItem) => void;
  onInspectItem: (item: ShoppableItem) => void;
  activeHotspotId?: string | null;
  styleName: string;
}

export const ShoppableCatalog: React.FC<ShoppableCatalogProps> = ({
  items,
  savedItemIds,
  onToggleSaveItem,
  onInspectItem,
  activeHotspotId,
  styleName,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Seating', 'Lighting', 'Table', 'Rug', 'Storage', 'Decor'];

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.material.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalStyleCost = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200/80 shadow-xs p-5 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/70">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-stone-800" />
            <h3 className="text-lg font-semibold text-stone-900 tracking-tight">
              Curated Furniture & Decor Catalog
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Architect-selected pieces matching the <span className="font-medium text-stone-800">{styleName}</span> makeover.
          </p>
        </div>

        {/* Investment summary */}
        <div className="flex items-center gap-2 text-xs bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg text-stone-700">
          <span className="text-stone-500">Full Room Set Estimate:</span>
          <span className="font-bold text-stone-900">${totalStyleCost.toLocaleString()}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 my-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, materials..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Product Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-stone-500 text-xs">
          No items match your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const isSaved = savedItemIds.has(item.id);
            const isHighlighted = activeHotspotId === item.id;

            return (
              <div
                key={item.id}
                className={`group rounded-xl border bg-white overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                  isHighlighted
                    ? 'border-amber-400 ring-2 ring-amber-300/40 shadow-md scale-[1.01]'
                    : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
                }`}
              >
                {/* Image */}
                <div
                  onClick={() => onInspectItem(item)}
                  className="relative aspect-square overflow-hidden bg-stone-100 cursor-pointer"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Category Tag */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium tracking-wide">
                    {item.category}
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSaveItem(item);
                    }}
                    title={isSaved ? 'Remove from Moodboard' : 'Save to Moodboard'}
                    className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isSaved
                        ? 'bg-amber-400 text-stone-950 shadow-md'
                        : 'bg-white/90 text-stone-700 hover:bg-white shadow-xs'
                    }`}
                  >
                    {isSaved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>

                {/* Details */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
                        {item.brand}
                      </span>
                      <span className="text-sm font-bold text-stone-900">
                        ${item.price.toLocaleString()}
                      </span>
                    </div>

                    <h4
                      onClick={() => onInspectItem(item)}
                      className="text-xs font-semibold text-stone-800 line-clamp-2 mt-1 hover:text-stone-950 cursor-pointer"
                    >
                      {item.title}
                    </h4>

                    {/* Color and Material chips */}
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-stone-500">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block flex-shrink-0"
                        style={{ backgroundColor: item.colorHex }}
                        title={item.colorName}
                      />
                      <span className="truncate">{item.material}</span>
                    </div>

                    {/* Designer Tip */}
                    <p className="mt-2 text-[11px] text-stone-500 line-clamp-2 bg-stone-50 p-1.5 rounded-md border border-stone-100">
                      <span className="font-semibold text-stone-700">Designer tip: </span>
                      {item.stylingTip}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onInspectItem(item)}
                      className="text-xs font-medium text-stone-600 hover:text-stone-900"
                    >
                      Inspect Specs
                    </button>

                    <a
                      href={item.retailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
                    >
                      <span>Shop</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
