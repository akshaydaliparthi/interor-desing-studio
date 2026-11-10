export interface ShoppableItem {
  id: string;
  title: string;
  brand: string;
  category: 'Seating' | 'Rug' | 'Lighting' | 'Table' | 'Decor' | 'Storage' | 'Wall Art';
  price: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  material: string;
  dimensions: string;
  colorName: string;
  colorHex: string;
  retailerUrl: string;
  stylingTip: string;
  hotspot?: {
    x: number; // percentage from left (0 - 100)
    y: number; // percentage from top (0 - 100)
  };
}

export interface DesignStyle {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  description: string;
  philosophy: string;
  reimaginedImage: string;
  thumbnail: string;
  palette: Array<{ name: string; hex: string }>;
  keyMaterials: string[];
  lightingMood: string;
  idealFor: string;
  hotspots: ShoppableItem[];
}

export interface PresetRoom {
  id: string;
  name: string;
  roomType: string;
  dimensions: string;
  description: string;
  originalImage: string;
  thumbnail: string;
  defaultStyleId: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  paletteSuggestion?: string[];
  suggestedItems?: ShoppableItem[];
  refinementPrompt?: string;
  isGeneratingImage?: boolean;
}

export interface RoomAnalysis {
  roomType: string;
  estimatedDimensions: string;
  lightingCondition: string;
  currentPalette: string[];
  keyStrengths: string[];
  opportunities: string[];
  bestMatchingStyles: string[];
  executiveSummary: string;
}
