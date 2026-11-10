import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Upload,
  Stethoscope,
  Share2,
  Download,
  Info,
  CheckCircle,
  Compass,
  ArrowRight,
  Sliders,
  Maximize2,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';
import { PRESET_ROOMS, DESIGN_STYLES } from './data/styles';
import { DesignStyle, PresetRoom, ShoppableItem } from './types';
import { CompareSlider } from './components/CompareSlider';
import { StyleCarousel } from './components/StyleCarousel';
import { DesignConsultantChat } from './components/DesignConsultantChat';
import { ShoppableCatalog } from './components/ShoppableCatalog';
import { ItemDetailModal } from './components/ItemDetailModal';
import { RoomDiagnosticsModal } from './components/RoomDiagnosticsModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { RoomUploadModal } from './components/RoomUploadModal';

export default function App() {
  // Preset and Room states
  const [currentRoom, setCurrentRoom] = useState<PresetRoom>(PRESET_ROOMS[0]);
  const [activeStyleId, setActiveStyleId] = useState<string>(PRESET_ROOMS[0].defaultStyleId);
  const [stylesList, setStylesList] = useState<DesignStyle[]>(DESIGN_STYLES);

  // Active style object
  const activeStyle =
    stylesList.find((s) => s.id === activeStyleId) || stylesList[0];

  // Visual makeover image (can be updated dynamically by AI generation or preset)
  const [currentMakeoverImage, setCurrentMakeoverImage] = useState<string>(
    activeStyle.reimaginedImage
  );

  // Hotspots and Catalog items
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [inspectingItem, setInspectingItem] = useState<ShoppableItem | null>(null);

  // Wishlist / Moodboard
  const [savedItems, setSavedItems] = useState<ShoppableItem[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState<boolean>(false);

  // Generation status
  const [isGeneratingVisual, setIsGeneratingVisual] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Switch style from carousel
  const handleSelectStyle = (styleId: string) => {
    setActiveStyleId(styleId);
    const chosen = stylesList.find((s) => s.id === styleId);
    if (chosen) {
      setCurrentMakeoverImage(chosen.reimaginedImage);
      setActiveHotspotId(null);
      showToast(`Applied ${chosen.name} aesthetic`);
    }
  };

  // Switch preset room
  const handleSelectPresetRoom = (room: PresetRoom) => {
    setCurrentRoom(room);
    setActiveStyleId(room.defaultStyleId);
    const chosen = stylesList.find((s) => s.id === room.defaultStyleId) || stylesList[0];
    setCurrentMakeoverImage(chosen.reimaginedImage);
    setActiveHotspotId(null);
    showToast(`Loaded ${room.name}`);
  };

  // User uploaded custom room photo
  const handleCustomPhotoUploaded = (base64: string, name: string) => {
    const customPreset: PresetRoom = {
      id: `custom-${Date.now()}`,
      name: name || 'My Uploaded Space',
      roomType: 'Custom Uploaded Room',
      dimensions: 'Custom Dimensions',
      description: 'Your uploaded living space awaiting AI transformation.',
      originalImage: base64,
      thumbnail: base64,
      defaultStyleId: activeStyleId,
    };
    setCurrentRoom(customPreset);
    showToast('Custom room uploaded successfully!');
  };

  // Toggle saving an item to moodboard
  const handleToggleSaveItem = (item: ShoppableItem) => {
    const exists = savedItems.some((i) => i.id === item.id);
    if (exists) {
      setSavedItems((prev) => prev.filter((i) => i.id !== item.id));
      showToast(`Removed "${item.title}" from moodboard`);
    } else {
      setSavedItems((prev) => [...prev, item]);
      showToast(`Saved "${item.title}" to project moodboard`);
    }
  };

  // AI Visual Re-Generation triggered from Chat refinement or Custom Style Modal
  const handleGenerateMakeover = async (refinementPrompt: string, customTitle?: string) => {
    setIsGeneratingVisual(true);
    showToast('AI is generating your reimagined room visual...');

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: refinementPrompt,
          originalImageBase64: currentRoom.originalImage,
          styleName: customTitle || activeStyle.name,
          aspectRatio: '16:9',
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!res.ok) {
        let errMsg = 'Image generation request failed';
        if (contentType && contentType.includes('application/json')) {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } else {
          errMsg = await res.text();
        }
        throw new Error(errMsg);
      }

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Received unexpected non-JSON response from server');
      }

      const data = await res.json();
      if (data.imageUrl) {
        setCurrentMakeoverImage(data.imageUrl);

        // If custom style title provided, append to stylesList
        if (customTitle) {
          const newStyleId = `custom-style-${Date.now()}`;
          const newStyle: DesignStyle = {
            id: newStyleId,
            name: customTitle,
            subtitle: 'AI Bespoke Makeover',
            tagline: refinementPrompt.slice(0, 80) + '...',
            description: refinementPrompt,
            philosophy: 'Customized spatial design crafted specifically for your home.',
            reimaginedImage: data.imageUrl,
            thumbnail: data.imageUrl,
            palette: [
              { name: 'Custom Accent', hex: '#3B4B59' },
              { name: 'Warm Neutral', hex: '#E2DBD2' },
              { name: 'Deep Tone', hex: '#262422' },
            ],
            keyMaterials: ['Architectural Plaster', 'Natural Wood', 'Woven Textiles'],
            lightingMood: 'Optimized layered ambient daylight',
            idealFor: 'Personalized bespoke room architecture',
            hotspots: activeStyle.hotspots,
          };
          setStylesList((prev) => [newStyle, ...prev]);
          setActiveStyleId(newStyleId);
        }

        showToast('Makeover visual updated successfully!');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Visual generation notice: Live AI image creation requires Gemini image models.');
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  // Select hotspot pin on the slider
  const handleSelectHotspot = (item: ShoppableItem) => {
    setActiveHotspotId(item.id);
    setInspectingItem(item);
  };

  const savedItemIdsSet = new Set(savedItems.map((i) => i.id));

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-medium shadow-2xl border border-stone-700 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Studio Navbar */}
      <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center font-serif text-lg font-bold shadow-xs">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold tracking-tight text-stone-900">
                  Aura Atelier
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-700">
                  AI Interior Design Studio
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Spatial Reimagination · Interactive Comparison · Sourcing
              </p>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Room Diagnostics Button */}
            <button
              onClick={() => setIsDiagnosticOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">Room Audit</span>
            </button>

            {/* Room Selector / Upload */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-stone-700" />
              <span className="max-w-[120px] truncate hidden sm:inline">
                {currentRoom.name}
              </span>
              <span className="sm:hidden">Change</span>
            </button>

            {/* Moodboard / Saved Pieces Drawer Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Moodboard</span>
              {savedItems.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold text-[10px] flex items-center justify-center ml-0.5">
                  {savedItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Hero Section: Before/After Visual Comparison */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                {activeStyle.name}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                {activeStyle.subtitle} · Drag the comparison slider below to view the architectural transformation.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Click <span className="font-semibold text-stone-800">+</span> for shoppable specs
              </span>
            </div>
          </div>

          {/* Interactive Split Compare Slider */}
          <CompareSlider
            originalImage={currentRoom.originalImage}
            reimaginedImage={currentMakeoverImage}
            styleName={activeStyle.name}
            roomName={currentRoom.name}
            hotspots={activeStyle.hotspots}
            onSelectHotspot={handleSelectHotspot}
            activeHotspotId={activeHotspotId}
            isGenerating={isGeneratingVisual}
          />
        </section>

        {/* Reimagined Styles Carousel */}
        <section>
          <StyleCarousel
            styles={stylesList}
            activeStyleId={activeStyleId}
            onSelectStyle={handleSelectStyle}
            onCustomGenerate={handleGenerateMakeover}
            isGenerating={isGeneratingVisual}
          />
        </section>

        {/* Dual Workspace: Design Consultant Chat + Shoppable Furniture Catalog */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Column 1: Context-Aware Multi-turn Gemini Chat */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-stone-900 tracking-tight">
                  Design Consultation & Refinement
                </h3>
                <p className="text-xs text-stone-500">
                  Prompt custom modifications (e.g. "make rug blue", "add plants").
                </p>
              </div>
            </div>

            <DesignConsultantChat
              currentStyle={activeStyle.name}
              roomName={currentRoom.name}
              originalImageBase64={currentRoom.originalImage}
              onApplyVisualRefinement={handleGenerateMakeover}
              onAddItemToWishlist={handleToggleSaveItem}
              onInspectItem={(item) => setInspectingItem(item)}
              isGeneratingVisual={isGeneratingVisual}
            />
          </div>

          {/* Column 2: Curated Shoppable Furniture & Decor Catalog */}
          <div className="lg:col-span-7 space-y-3">
            <ShoppableCatalog
              items={activeStyle.hotspots}
              savedItemIds={savedItemIdsSet}
              onToggleSaveItem={handleToggleSaveItem}
              onInspectItem={(item) => setInspectingItem(item)}
              activeHotspotId={activeHotspotId}
              styleName={activeStyle.name}
            />
          </div>
        </section>

        {/* Architectural Style Deep-Dive Note */}
        <section className="p-6 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                Aesthetic Philosophy
              </span>
              <h4 className="text-base font-serif font-bold text-stone-900 mt-1">
                {activeStyle.name}
              </h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                {activeStyle.description}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                Color Palette & Swatches
              </span>
              <div className="mt-2 space-y-2">
                {activeStyle.palette.map((swatch, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span className="font-medium text-stone-800">{swatch.name}</span>
                    <span className="text-stone-400 font-mono text-[11px] ml-auto">
                      {swatch.hex}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                Lighting Choreography
              </span>
              <p className="text-xs text-stone-700 font-medium mt-1">
                {activeStyle.lightingMood}
              </p>
              <div className="mt-3 pt-3 border-t border-stone-100">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
                  Ideal Room Pairing
                </span>
                <p className="text-xs text-stone-600">{activeStyle.idealFor}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-stone-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900">Aura Atelier</span>
            <span>·</span>
            <span>AI Interior Architecture & Spatial Transformation</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Gemini 3.8 Flash & Gemini Nano Banana</span>
            <span>·</span>
            <span>Real-time Before & After Comparison</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ItemDetailModal
        item={inspectingItem}
        onClose={() => setInspectingItem(null)}
        isSaved={inspectingItem ? savedItemIdsSet.has(inspectingItem.id) : false}
        onToggleSave={handleToggleSaveItem}
      />

      <RoomDiagnosticsModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        imageBase64={currentRoom.originalImage}
        onSelectRecommendedStyle={(styleName) => {
          const match = stylesList.find(
            (s) =>
              s.name.toLowerCase().includes(styleName.toLowerCase()) ||
              styleName.toLowerCase().includes(s.name.toLowerCase())
          );
          if (match) {
            handleSelectStyle(match.id);
          } else {
            handleGenerateMakeover(`Makeover inspired by ${styleName}`, styleName);
          }
        }}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        savedItems={savedItems}
        onRemoveItem={(id) => setSavedItems((prev) => prev.filter((i) => i.id !== id))}
        roomName={currentRoom.name}
        styleName={activeStyle.name}
      />

      <RoomUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        presetRooms={PRESET_ROOMS}
        activeRoomId={currentRoom.id}
        onSelectPreset={handleSelectPresetRoom}
        onCustomPhotoUploaded={handleCustomPhotoUploaded}
      />
    </div>
  );
}
