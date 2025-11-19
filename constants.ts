import { MoodEntry } from './types';

export const MOOD_OPTIONS = [
  { emoji: '🤩', label: 'Amazing' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '🥳', label: 'Party' },
  { emoji: '🤯', label: 'Shocked' },
  { emoji: '🤔', label: 'Thinking' },
  { emoji: '☕', label: 'Coffee' },
  { emoji: '💻', label: 'Coding' },
  { emoji: '🚀', label: 'Hype' },
];

export const MOCK_STATUSES = [
  "Need coffee...",
  "Today is going great!",
  "Traffic is terrible",
  "Just shipping code",
  "GM everyone",
  "Waiting for weekend",
  "Focus mode on",
  "Need sleep",
  "Farcaster vibe",
  "Learning React",
  "Lunch time",
  "Gym session done",
];

// Generate random mock data scattered around the world
export const generateMockData = (count: number): MoodEntry[] => {
  const entries: MoodEntry[] = [];
  for (let i = 0; i < count; i++) {
    // Random lat/lng roughly distributed
    const lat = (Math.random() * 160) - 80; // Avoid extreme poles
    const lng = (Math.random() * 360) - 180;
    
    const randomMood = MOOD_OPTIONS[Math.floor(Math.random() * MOOD_OPTIONS.length)];
    const randomStatus = MOCK_STATUSES[Math.floor(Math.random() * MOCK_STATUSES.length)];

    entries.push({
      id: `mock-${i}`,
      emoji: randomMood.emoji,
      status: randomStatus,
      lat,
      lng,
      timestamp: Date.now() - Math.random() * 86400000, // Within last 24h
      isUser: false,
    });
  }
  return entries;
};