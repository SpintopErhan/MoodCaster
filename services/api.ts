
import { MoodEntry } from '../types';
import { MOOD_OPTIONS, MOCK_STATUSES } from '../constants';

// Simulate network delay to make it feel like a real API call
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const api = {
  /**
   * Fetches the snapshot of global moods.
   * In a real Supabase implementation, this would be:
   * supabase.from('moods').select('*').gt('timestamp', Date.now() - 24h)
   */
  fetchGlobalMoods: async (): Promise<MoodEntry[]> => {
    await delay(800); // Simulate network request

    // Generate mock data on the fly to simulate receiving fresh data from DB
    const count = 60;
    const entries: MoodEntry[] = [];
    
    for (let i = 0; i < count; i++) {
      const lat = (Math.random() * 160) - 80;
      const lng = (Math.random() * 360) - 180;
      const randomMood = MOOD_OPTIONS[Math.floor(Math.random() * MOOD_OPTIONS.length)];
      const randomStatus = MOCK_STATUSES[Math.floor(Math.random() * MOCK_STATUSES.length)];
      const timeAgo = Math.random() * TWENTY_FOUR_HOURS_MS;

      entries.push({
        id: `mock-${Math.random().toString(36).substr(2, 9)}`,
        emoji: randomMood.emoji,
        status: randomStatus,
        lat,
        lng,
        timestamp: Date.now() - timeAgo,
        isUser: false,
      });
    }
    return entries;
  },

  /**
   * Publishes the user's mood to the backend.
   */
  publishMood: async (entry: MoodEntry): Promise<boolean> => {
    await delay(600); // Simulate network request
    console.log("Mood published to backend:", entry);
    return true;
  }
};
