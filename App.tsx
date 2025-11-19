import React, { useEffect, useState } from 'react';
import WorldMap from './components/WorldMap';
import MoodSelector from './components/MoodSelector';
import { AppStep, Location, MoodEntry } from './types';
import { generateMockData } from './constants';
import { Loader2, MapPinOff } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LOADING_LOCATION);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 1. Initialize Mock Data
  useEffect(() => {
    const mockData = generateMockData(50); // 50 fake users
    setEntries(mockData);
  }, []);

  // 2. Get User Location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Your browser does not support geolocation.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStep(AppStep.MOOD_SELECTION);
      },
      (err) => {
        console.error(err);
        setError("Could not access your location. Please ensure you have granted permission.");
        // Fallback location (e.g., Istanbul) for UX continuity if permission denied
        setUserLocation({ lat: 41.0082, lng: 28.9784 });
        setStep(AppStep.MOOD_SELECTION);
      }
    );
  }, []);

  const handleMoodSubmit = (emoji: string, status: string) => {
    if (!userLocation) return;

    // Check if user already exists to update instead of append (optional logic, 
    // but here we just append to top for simplicity as per previous logic)
    // A more robust app would update the existing ID.
    
    const newEntry: MoodEntry = {
      id: `user-${Date.now()}`,
      emoji,
      status,
      lat: userLocation.lat,
      lng: userLocation.lng,
      timestamp: Date.now(),
      isUser: true,
    };

    // Remove old user entry if exists to avoid duplicates visually
    setEntries((prev) => {
      const filtered = prev.filter(e => !e.isUser);
      return [...filtered, newEntry];
    });
    
    setStep(AppStep.MAP_VIEW);
  };

  // Check if the user has already posted a mood.
  // If they have, we allow them to close the selector without posting again.
  const hasPosted = entries.some(e => e.isUser);

  const handleCloseSelector = () => {
    if (hasPosted) {
      setStep(AppStep.MAP_VIEW);
    }
  };

  // Render Loading Screen
  if (step === AppStep.LOADING_LOCATION) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white p-6">
        {error ? (
          <div className="text-center space-y-4">
            <MapPinOff size={48} className="text-red-500 mx-auto" />
            <h1 className="text-xl font-bold">Something Went Wrong</h1>
            <p className="text-slate-400">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <Loader2 size={48} className="animate-spin text-purple-500 mx-auto" />
            <h1 className="text-xl font-bold animate-pulse">Waiting for Location...</h1>
            <p className="text-slate-400 text-sm">Your location is required to place you on the world map.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      {/* The Map - Always visible but covered by MoodSelector initially */}
      {userLocation && (
        <WorldMap 
          userLocation={userLocation} 
          entries={entries} 
        />
      )}

      {/* Overlay for Mood Selection */}
      {step === AppStep.MOOD_SELECTION && (
        <div 
          onClick={handleCloseSelector}
          className={`absolute inset-0 bg-black/60 z-40 flex items-end sm:items-center justify-center transition-opacity duration-300 ${hasPosted ? 'cursor-pointer' : 'cursor-default'}`}
        >
           <MoodSelector 
             onSubmit={handleMoodSubmit} 
             onClose={hasPosted ? handleCloseSelector : undefined}
           />
        </div>
      )}

      {/* Global Controls when Map is active */}
      {step === AppStep.MAP_VIEW && (
        <>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
                <button 
                    onClick={() => setStep(AppStep.MOOD_SELECTION)}
                    className="bg-slate-900/80 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold shadow-xl border border-slate-700 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                    <span>Update Status</span>
                </button>
            </div>
        </>
      )}
    </div>
  );
};

export default App;