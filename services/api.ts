import { MoodEntry } from '../types';
import { supabase } from './supabaseClient';

export const api = {
  /**
   * Fetches the snapshot of global moods from the last 24 hours.
   */
  fetchGlobalMoods: async (): Promise<MoodEntry[]> => {
    // Calculate timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    try {
      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .gt('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(1000); // Safety limit

      if (error) {
        console.error('Error fetching moods:', error);
        return [];
      }

      if (!data) return [];

      // Map Supabase DB response to our App's MoodEntry type
      return data.map((row: any) => ({
        id: row.id,
        emoji: row.emoji,
        status: row.status || '',
        lat: row.lat,
        lng: row.lng,
        timestamp: new Date(row.created_at).getTime(),
        isUser: false, // Default to false, App.tsx handles the "You" logic
      }));

    } catch (err) {
      console.error('Unexpected error fetching moods:', err);
      return [];
    }
  },

  /**
   * Publishes the user's mood to the backend.
   */
  publishMood: async (entry: MoodEntry): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('moods')
        .insert({
          emoji: entry.emoji,
          status: entry.status,
          lat: entry.lat,
          lng: entry.lng,
          // created_at and id are generated automatically by Supabase
        });

      if (error) {
        console.error('Error publishing mood:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Unexpected error publishing mood:', err);
      return false;
    }
  }
};
