import React, { useState, useEffect, useLayoutEffect } from 'react';
import MoodSelector from './components/MoodSelector';
import MusicPlayer from './components/MusicPlayer';
import LoadingSpinner from './components/LoadingSpinner';
import { Mood } from './types';

// ==================== FARCASTER – BU SEFER %100 ====================
function FarcasterMiniAppReady() {
  useLayoutEffect(() => {
    const isMiniApp = () => {
      if (typeof window === 'undefined') return false;
      const url = new URL(window.location.href);
      return (
        url.hostname.includes('warpcast.com') ||
        url.hostname.includes('farcaster.xyz') ||
        url.searchParams.has('miniapp') ||
        url.searchParams.has('embedded') ||
        url.pathname.includes('/miniapps/') ||
        url.pathname.includes('/developers/mini-apps/')
      );
    };

    if (!isMiniApp()) return;

    console.log('Mini App ortamı tespit edildi – SDK yükleniyor...');

    // Resmi docs’taki yöntem: ?bundle olmadan da çalışıyor ama bundle daha stabil
    import('https://esm.sh/@farcaster/miniapp-sdk@latest')
      .then(async ({ sdk }) => {
        console.log('SDK yüklendi');

        // Tüm paint’ler bitsin diye 2 kere requestAnimationFrame
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

        // Warpcast’in en yavaş hali için 1500ms garanti
        await new Promise(r => setTimeout(r, 1500));

        try {
          await sdk.actions.ready();
          console.log('✅ ready() GÖNDERİLDİ – SPLASH SCREEN KALKIYOR! YEŞİL TİK GELDİ!');
        } catch (e) {
          console.error('ready() hatası:', e);
        }
      })
      .catch(err => console.error('SDK yüklenemedi:', err));
  }, []);

  return null;
}

// ==================== ANA APP ====================
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
      
      {/* BU SATIRI SAKIN SİLME */}
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
