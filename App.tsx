import React, { useEffect, useState, useCallback } from 'react';
import WorldMap from './components/WorldMap';
import MoodSelector from './components/MoodSelector';
import { AppStep, Location, MoodEntry } from './types';
import { api } from './services/api';
import { Loader2, MapPinOff } from 'lucide-react';
import { sdk } from '@farcaster/frame-sdk';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LOADING_LOCATION);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationCity, setLocationCity] = useState<string | undefined>(undefined);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Constant for 24 hours in milliseconds
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  // ---------------------------------------------------------------------------
  // Farcaster MiniApp SDK Initialization
  // Standard approach as per documentation
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const initSDK = async () => {
      try {
        // Signal to Farcaster that the app is ready to display
        await sdk.actions.ready();
        console.log('Farcaster SDK Ready!');
      } catch (err) {
        console.error('Error initializing Farcaster SDK:', err);
      }
    };
    
    initSDK();
  }, []);

  // Function to fetch data (used on mount and on manual refresh)
  const loadGlobalData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await api.fetchGlobalMoods();
      // Determine if we need to merge with local user state or just replace
      // For now, we just update the non-user entries
      setEntries(prevEntries => {
        const userEntry = prevEntries.find(e => e.isUser);
        return userEntry ? [...data, userEntry] : data;
      });
    } catch (err) {
      console.error("Failed to fetch moods:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Function to get city name from coordinates (Reverse Geocoding)
  const fetchCityName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      // Try to find the most relevant city/town name
      const city = data.address.city || data.address.town || data.address.village || data.address.county || "Unknown Location";
      setLocationCity(city);
    } catch (error) {
      console.error("Failed to fetch city name:", error);
    }
  };

  // 1. Initial Data Load
  useEffect(() => {
    loadGlobalData();
  }, [loadGlobalData]);

  // 2. Get User Location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Your browser does not support geolocation.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude,
        });
        fetchCityName(latitude, longitude);
        setStep(AppStep.MOOD_SELECTION);
      },
      (err) => {
        console.error(err);
        setError("Could not access your location. Please ensure you have granted permission.");
        // Fallback location (e.g., Istanbul) for UX continuity if permission denied
        const fallbackLat = 41.0082;
        const fallbackLng = 28.9784;
        setUserLocation({ lat: fallbackLat, lng: fallbackLng });
        fetchCityName(fallbackLat, fallbackLng);
        setStep(AppStep.MOOD_SELECTION);
      }
    );
  }, []);

  const handleMoodSubmit = async (emoji: string, status: string) => {
    if (!userLocation) return;

    const newEntry: MoodEntry = {
      id: `user-${Date.now()}`,
      emoji,
      status,
      lat: userLocation.lat,
      lng: userLocation.lng,
      timestamp: Date.now(),
      isUser: true,
    };

    // Optimistically update UI
    setEntries((prev) => {
      const others = prev.filter(e => !e.isUser);
      return [...others, newEntry];
    });
    
    setStep(AppStep.MAP_VIEW);

    // Send to backend
    await api.publishMood(newEntry);
  };

  // Filter entries to only show those within the last 24 hours
  const activeEntries = entries.filter(entry => {
    const age = Date.now() - entry.timestamp;
    return age < TWENTY_FOUR_HOURS_MS;
  });

  // Check if the user has already posted a mood that is still active
  const hasPosted = activeEntries.some(e => e.isUser);

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
      {/* The Map */}
      {userLocation && (
        <WorldMap 
          userLocation={userLocation} 
          entries={activeEntries}
          onRefresh={loadGlobalData}
          isRefreshing={isRefreshing}
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
             locationCity={locationCity}
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