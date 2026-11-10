import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShoppingBag,
  Wand2,
  ExternalLink,
  Plus,
  RefreshCw,
  Palette,
  Lightbulb,
  Check
} from 'lucide-react';
import { ChatMessage, ShoppableItem } from '../types';

interface DesignConsultantChatProps {
  currentStyle: string;
  roomName: string;
  originalImageBase64?: string;
  onApplyVisualRefinement: (prompt: string) => void;
  onAddItemToWishlist: (item: ShoppableItem) => void;
  onInspectItem: (item: ShoppableItem) => void;
  isGeneratingVisual?: boolean;
}

const QUICK_SUGGESTIONS = [
  'Keep layout but make the rug deep indigo blue',
  'Add warm ambient pendant lights and floor lamp',
  'Change coffee table to fluted travertine stone',
  'How can I budget this under $1,200 with lookalike items?',
  'What exact paint swatch pairs with this oak woodwork?',
];

export const DesignConsultantChat: React.FC<DesignConsultantChatProps> = ({
  currentStyle,
  roomName,
  originalImageBase64,
  onApplyVisualRefinement,
  onAddItemToWishlist,
  onInspectItem,
  isGeneratingVisual = false,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to your consultation for the ${roomName}. You are currently previewing our **${currentStyle}** concept. How would you like to refine the space? You can ask me to swap materials, tweak the color palette, adjust lighting levels, or request shoppable piece alternatives.`,
      timestamp: new Date(),
      paletteSuggestion: ['#EBE5DF', '#C2A382', '#2C2B29', '#8F9489'],
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    setInputPrompt('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build history for multi-turn chat
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory,
          currentStyle,
          roomType: roomName,
          originalImageBase64,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!res.ok) {
        let errMsg = 'Failed to get consultation response';
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

      // Convert suggested items into ShoppableItem objects if present
      const formattedItems: ShoppableItem[] = (data.suggestedItems || []).map(
        (item: any, idx: number) => ({
          id: item.id || `chat-item-${Date.now()}-${idx}`,
          title: item.title,
          brand: item.brand || 'Curated Studio',
          category: (item.category as any) || 'Decor',
          price: parseInt(String(item.estimatedPrice).replace(/[^0-9]/g, '')) || 299,
          currency: 'USD',
          rating: 4.8,
          reviewsCount: 45,
          imageUrl:
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
          material: item.material || 'Natural Wood & Textile',
          dimensions: 'Standard Architectural Fit',
          colorName: item.color || 'Curated Neutral',
          colorHex: '#C2A382',
          retailerUrl: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(
            item.shoppingSearchQuery || item.title
          )}`,
          stylingTip: item.stylingTip || 'Harmonizes with your room palette.',
        })
      );

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Here are my design recommendations for your space.',
        timestamp: new Date(),
        paletteSuggestion: data.paletteSuggestion,
        suggestedItems: formattedItems,
        refinementPrompt: data.designRefinementPrompt,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          "I encountered an issue connecting to the design studio service. Here's general styling advice: consider anchoring your seating area with an 8x10 natural fiber rug, maintaining at least 18 inches between coffee table and sofa, and layering three heights of 2700K ambient lighting.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveItem = (item: ShoppableItem) => {
    onAddItemToWishlist(item);
    setSavedItemIds((prev) => new Set(prev).add(item.id));
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200/80 shadow-md overflow-hidden flex flex-col h-[600px] md:h-[680px]">
      {/* Header */}
      <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-amber-300/30">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight">
                Aura AI Interior Design Consultant
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-800 text-amber-300 border border-amber-300/20">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Context: {roomName} · {currentStyle} Aesthetic
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome-reset',
                role: 'assistant',
                content: `Consultation refreshed. Ready to explore new refinements for your ${roomName} under the ${currentStyle} aesthetic.`,
                timestamp: new Date(),
              },
            ]);
          }}
          title="Restart design session"
          className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-stone-50/50">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-stone-900 text-white rounded-br-xs shadow-sm'
                    : 'bg-white text-stone-800 border border-stone-200/90 rounded-tl-xs shadow-xs'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-line prose-stone">{message.content}</div>

                {/* Color Palette Suggestion if provided */}
                {message.paletteSuggestion && message.paletteSuggestion.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center gap-2">
                    <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
                      <Palette className="w-3 h-3 text-stone-600" />
                      Suggested Palette:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {message.paletteSuggestion.map((hex, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-[10px] text-stone-700"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: hex }}
                          />
                          <span className="font-mono">{hex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Visual Re-Generation Action if refinement prompt returned */}
                {message.refinementPrompt && (
                  <div className="mt-3 pt-3 border-t border-stone-100 bg-amber-50/70 -mx-4 -mb-4 p-3 rounded-b-2xl border-stone-200/50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Visual Makeover Available
                        </span>
                        <p className="text-xs text-stone-600 truncate mt-0.5 italic">
                          "{message.refinementPrompt}"
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          onApplyVisualRefinement(message.refinementPrompt!)
                        }
                        disabled={isGeneratingVisual}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors flex-shrink-0 disabled:opacity-50"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Update Visual</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Suggested Shoppable Items in Chat */}
                {message.suggestedItems && message.suggestedItems.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 mb-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                      <span>Recommended Furniture & Decor:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {message.suggestedItems.map((item) => {
                        const isSaved = savedItemIds.has(item.id);
                        return (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300 transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-baseline justify-between gap-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
                                  {item.brand}
                                </span>
                                <span className="text-xs font-bold text-stone-900">
                                  ${item.price}
                                </span>
                              </div>
                              <h5 className="text-xs font-semibold text-stone-800 line-clamp-1 mt-0.5">
                                {item.title}
                              </h5>
                              <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                                {item.stylingTip}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-stone-200/60">
                              <button
                                onClick={() => onInspectItem(item)}
                                className="text-[11px] text-stone-600 hover:text-stone-900 font-medium"
                              >
                                View Specs
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleSaveItem(item)}
                                  className={`p-1 rounded text-xs transition-colors ${
                                    isSaved
                                      ? 'text-emerald-700 bg-emerald-100'
                                      : 'text-stone-600 hover:bg-stone-200'
                                  }`}
                                  title={isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}
                                >
                                  {isSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                </button>
                                <a
                                  href={item.retailerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-stone-600 hover:text-amber-800 rounded hover:bg-stone-200 transition-colors"
                                  title="Search retailers online"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2 ${
                    isUser ? 'text-stone-400' : 'text-stone-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-full bg-stone-300 text-stone-800 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs text-stone-500 italic">
            <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span>Consultant is analyzing room geometry and sourcing pieces...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-stone-100/80 border-t border-stone-200 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <Lightbulb className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
        <span className="text-[11px] text-stone-400 font-medium flex-shrink-0">
          Try:
        </span>
        {QUICK_SUGGESTIONS.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(suggestion)}
            className="flex-shrink-0 px-2.5 py-1 text-xs bg-white hover:bg-stone-200/70 text-stone-700 border border-stone-200 rounded-full transition-colors truncate max-w-[260px]"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="p-3 bg-white border-t border-stone-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask consultant (e.g. "Keep layout but make the rug blue", "Suggest budget lighting")...`}
            className="flex-1 px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all placeholder:text-stone-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-4 py-2.5 bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm flex-shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
