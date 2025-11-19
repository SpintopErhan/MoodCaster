import React, { useState } from 'react';
import { MOOD_OPTIONS } from '../constants';
import { Send, MapPin, X } from 'lucide-react';

interface MoodSelectorProps {
  onSubmit: (emoji: string, status: string) => void;
  onClose?: () => void;
  locationCity?: string;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ onSubmit, onClose, locationCity }) => {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmoji) {
      onSubmit(selectedEmoji, status);
    }
  };

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-700 p-6 rounded-t-3xl shadow-2xl z-50 transition-all duration-500 ease-in-out max-h-[80vh] overflow-y-auto"
    >
      <div className="max-w-md mx-auto relative">
        {/* Close Button - Only shown if onClose is provided */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute -top-2 right-0 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          How is your mood today?
        </h2>
        
        {locationCity && (
          <div className="flex items-center justify-center text-slate-400 text-sm mb-6 gap-1">
            <MapPin size={14} />
            <span>Location: {locationCity}</span>
          </div>
        )}

        <div className="grid grid-cols-4 gap-3 mb-6">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.emoji}
              onClick={() => setSelectedEmoji(opt.emoji)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-xl transition-all
                ${selectedEmoji === opt.emoji 
                  ? 'bg-purple-600/30 border-2 border-purple-500 scale-105 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                  : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                }
              `}
            >
              <span className="text-3xl mb-1">{opt.emoji}</span>
              <span className="text-[10px] text-slate-300 uppercase tracking-wide font-medium">{opt.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value.slice(0, 24))}
              placeholder="Write a short status (Optional)"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
              {status.length}/24
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedEmoji}
            className={`
              w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-lg transition-all
              ${selectedEmoji 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg cursor-pointer' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            <span>Add to Map</span>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MoodSelector;