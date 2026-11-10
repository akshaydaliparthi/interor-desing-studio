import React, { useState } from 'react';
import { X, Sparkles, Sun, CheckCircle, AlertCircle, Compass, ArrowRight, Loader2 } from 'lucide-react';
import { RoomAnalysis } from '../types';

interface RoomDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageBase64: string;
  onSelectRecommendedStyle?: (styleName: string) => void;
}

export const RoomDiagnosticsModal: React.FC<RoomDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  imageBase64,
  onSelectRecommendedStyle,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<RoomAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    // Reset analysis if image changes
    setAnalysis(null);
  }, [imageBase64]);

  React.useEffect(() => {
    if (isOpen && !analysis && !loading) {
      runAnalysis();
    }
  }, [isOpen, analysis, loading]);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gemini/analyze-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });

      const contentType = res.headers.get('content-type');
      if (!res.ok) {
        let errMsg = 'Analysis request failed';
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
      setAnalysis(data);
    } catch (err: any) {
      console.error('Room diagnostics error:', err);
      setError(
        err?.message || 'Unable to complete automated room diagnostic.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900">
                Architectural Room Diagnostic
              </h3>
              <p className="text-xs text-stone-500">
                AI spatial analysis powered by Gemini 3.8 Flash
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
              <p className="text-sm font-medium text-stone-800">
                Analyzing spatial geometry, natural lighting, and architectural lines...
              </p>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Evaluating window orientation, color temperature, and furniture proportion.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Diagnostic Notice</p>
                <p className="mt-1 text-amber-800">{error}</p>
                <button
                  onClick={runAnalysis}
                  className="mt-3 px-3 py-1 bg-amber-200 text-amber-950 rounded font-medium hover:bg-amber-300 transition-colors"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
                  Designer Assessment
                </span>
                <p className="text-sm text-stone-800 font-serif italic mt-1 leading-relaxed">
                  "{analysis.executiveSummary}"
                </p>
              </div>

              {/* Spatial Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-stone-200 bg-white">
                  <span className="text-xs text-stone-400 block">Identified Space</span>
                  <span className="text-sm font-semibold text-stone-900 mt-0.5 block">
                    {analysis.roomType}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-stone-200 bg-white">
                  <span className="text-xs text-stone-400 block">Lighting Assessment</span>
                  <span className="text-sm font-semibold text-stone-900 mt-0.5 block truncate">
                    {analysis.lightingCondition}
                  </span>
                </div>
              </div>

              {/* Strengths & Opportunities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Architectural Assets</span>
                  </div>
                  <ul className="space-y-1.5">
                    {analysis.keyStrengths?.map((item, idx) => (
                      <li key={idx} className="text-xs text-stone-600 pl-3 border-l-2 border-emerald-500/50">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Makeover Opportunities</span>
                  </div>
                  <ul className="space-y-1.5">
                    {analysis.opportunities?.map((item, idx) => (
                      <li key={idx} className="text-xs text-stone-600 pl-3 border-l-2 border-amber-500/50">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Aesthetics */}
              <div className="pt-4 border-t border-stone-100">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  Top Curated Style Directions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.bestMatchingStyles?.map((style, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (onSelectRecommendedStyle) {
                          onSelectRecommendedStyle(style);
                          onClose();
                        }
                      }}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <span>{style}</span>
                      <ArrowRight className="w-3 h-3 text-amber-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
