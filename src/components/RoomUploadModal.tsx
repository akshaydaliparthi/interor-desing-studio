import React, { useState } from 'react';
import { X, Upload, Image, Check, Sparkles } from 'lucide-react';
import { PresetRoom } from '../types';

interface RoomUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetRooms: PresetRoom[];
  activeRoomId: string;
  onSelectPreset: (room: PresetRoom) => void;
  onCustomPhotoUploaded: (imageBase64: string, name: string) => void;
}

export const RoomUploadModal: React.FC<RoomUploadModalProps> = ({
  isOpen,
  onClose,
  presetRooms,
  activeRoomId,
  onSelectPreset,
  onCustomPhotoUploaded,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [customRoomName, setCustomRoomName] = useState<string>('My Living Space');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setErrorMessage(null);
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        onCustomPhotoUploaded(base64, customRoomName || file.name.replace(/\.[^/.]+$/, ''));
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-base font-semibold text-stone-900">
              Select or Upload Room Space
            </h3>
            <p className="text-xs text-stone-500">
              Transform your own living area or test with our architectural presets.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Custom Upload Drop Area */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Upload Your Own Room Photo
            </h4>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-amber-500 bg-amber-50/50 scale-[1.01]'
                  : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center shadow-2xs">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-stone-800">
                  Drag and drop your room photo, or <span className="text-amber-700 underline">browse files</span>
                </p>
                <p className="text-[11px] text-stone-400">
                  Wide-angle landscape photos (JPEG, PNG, WebP) yield the most realistic architectural results.
                </p>
              </div>
            </div>
          </div>

          {/* Preset Spaces */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Or Choose an Architectural Preset
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presetRooms.map((room) => {
                const isSelected = activeRoomId === room.id;
                return (
                  <div
                    key={room.id}
                    onClick={() => {
                      onSelectPreset(room);
                      onClose();
                    }}
                    className={`rounded-xl border p-3 cursor-pointer transition-all flex gap-3 items-center group ${
                      isSelected
                        ? 'border-stone-900 ring-2 ring-stone-900/10 bg-stone-50 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                    }`}
                  >
                    <img
                      src={room.thumbnail}
                      alt={room.name}
                      className="w-16 h-16 rounded-lg object-cover bg-stone-200 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700">
                          {room.roomType}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-stone-900" />}
                      </div>
                      <h5 className="text-xs font-semibold text-stone-900 truncate mt-0.5">
                        {room.name}
                      </h5>
                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                        {room.dimensions} · {room.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
