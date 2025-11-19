import React, { useState, useEffect, useLayoutEffect } from 'react';
import MoodSelector from './components/MoodSelector';
import MusicPlayer from './components/MusicPlayer';
import LoadingSpinner from './components/LoadingSpinner';
import { Mood } from './types';

// ==================== EN STABİL YÖNTEM – CDN + BUNDLE ====================
function FarcasterMiniAppReady() {
  useLayoutEffect(() => {
    // Mini App içinde miyiz?
    const url = window.location.href;
    const isMiniApp = url.includes('warpcast.com') || 
                      url.includes('farcaster.xyz') || 
                      url.includes('miniapp') || 
                      url.includes('embedded');

    if (!isMiniApp) return;

    console.log('Farcaster Mini App tespit edildi! SDK yükleniyor...');

    // Bu link resmi docs’ta önerilen, bağımlılıkların hepsini içinde barındırıyor
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://esm.sh/@farcaster/miniapp-sdk@latest?bundle';
    script.onload = async () => {
      // @ts-ignore – SDK global olarak window’a geliyor
      const { sdk } = window.__farcaster_miniapp_sdk || await import('https://esm.sh/@farcaster/miniapp-sdk@latest?bundle');
      
      // React render bitsin + Warpcast hazır olsun diye 1200ms bekle
      setTimeout(async () => {
        try {
          await sdk.actions.ready();
          console.log('✅ ready() çağrıldı – splash screen kalkıyor, yeşil tik geliyor!');
        } catch (e) {
          console.error('ready hatası:', e);
        }
      }, 1200);
    };
    script.onerror = () => console.error('SDK script yüklenemedi');
    document.head.appendChild(script);
  }, []);

  return null;
}

// ==================== APP (gerisi aynı) ====================
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
      
      <FarcasterMiniAppReady />   {/* BU SATIR KRİTİK */}

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
                  <button onClick={handleReset} className="bg-white text-purple-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-opacity-90 transition">
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
