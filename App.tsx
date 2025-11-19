import React, { useState, useEffect } from 'react';
import MoodSelector from './components/MoodSelector';
import MusicPlayer from './components/MusicPlayer';
import LoadingSpinner from './components/LoadingSpinner';
import { Mood } from './types';

// ==================== FARCASTER MINI APP READY COMPONENT ====================
function FarcasterMiniAppReady() {
  useEffect(() => {
    // Warpcast Mini App içinde miyiz? (Developer preview + gerçek kullanım kapsar)
    const isMiniApp = () => {
      if (typeof window === 'undefined') return false;
      const url = new URL(window.location.href);
      return (
        url.hostname.includes('warpcast.com') ||
        url.searchParams.has('miniapp') ||
        url.searchParams.has('embedded') ||
        url.pathname.includes('/miniapps/')
      );
    };

    if (!isMiniApp()) return;

    console.log('Farcaster Mini App algılandı, SDK yükleniyor...');

    // esm.sh ile tamamen bundle edilmiş, bağımlılık sorunu olmayan SDK
    import('https://esm.sh/@farcaster/miniapp-sdk@latest?bundle')
      .then(async ({ sdk }) => {
        // Splash screen’in kesin kalkması için küçük gecikme
        await new Promise(resolve => setTimeout(resolve, 200));
        await sdk.actions.ready();
        console.log('✅ Farcaster ready() çağrıldı – splash screen kalktı!');
      })
      .catch(err => {
        console.error('Farcaster SDK yüklenemedi:', err);
      });
  }, []);

  // Ekranda hiçbir şey göstermiyor, sadece ready sinyali gönderiyor
  return null;
}

// ==================== ANA APP COMPONENT ====================
export default function App() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (mood: Mood) => {
    setSelectedMood(mood.name);
    setIsLoading(true);
    setError(null);
    setGeneratedMusicUrl(null);

    try {
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: mood.name }),
      });

      if (!response.ok) throw new Error('Müzik üretilemedi');

      const data = await response.json();
      setGeneratedMusicUrl(data.musicUrl);
    } catch (err) {
      setError('Bir hata oluştu, lütfen tekrar dene.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedMood(null);
    setGeneratedMusicUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      
      {/* FARCASTER İÇİN KRİTİK SATIR – SAKIN SİLME! */}
      <FarcasterMiniAppReady />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-5xl font-bold text-center mb-2">MoodCaster</h1>
        <p className="text-center text-xl mb-8 opacity-90">
          Ruh halini seç, AI senin için mükemmel şarkıyı yaratsın!
        </p>

        {!selectedMood ? (
          <MoodSelector onSelect={handleGenerate} disabled={isLoading} />
        ) : (
          <div className="mt-10">
            <div className="text-center mb-8">
              <p className="text-2xl mb-4">
                Seçtiğin ruh hali: <span className="font-bold text-3xl">{selectedMood}</span>
              </p>
            </div>

            {isLoading && (
              <div className="flex flex-col items-center">
                <LoadingSpinner />
                <p className="mt-4 text-lg">AI senin için müzik üretiyor, biraz bekle...</p>
              </div>
            )}

            {error && (
              <div className="text-center text-red-300 bg-red-900/50 rounded-lg p-6">
                <p>{error}</p>
              </div>
            )}

            {generatedMusicUrl && (
              <div className="mt-8">
                <MusicPlayer musicUrl={generatedMusicUrl} mood={selectedMood} />
                <div className="text-center mt-8">
                  <button
                    onClick={handleReset}
                    className="bg-white text-purple-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-opacity-90 transition"
                  >
                    Yeni Ruh Hali Seç
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="text-center mt-16 text-sm opacity-70">
          Powered by Google AI Studio + Suno API
        </footer>
      </div>
    </div>
  );
}
