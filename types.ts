export interface MoodEntry {
  id: string;
  emoji: string;
  status: string;
  lat: number;
  lng: number;
  timestamp: number;
  isUser: boolean;
}

export interface Location {
  lat: number;
  lng: number;
}

export enum AppStep {
  LOADING_LOCATION = 'LOADING_LOCATION',
  MOOD_SELECTION = 'MOOD_SELECTION',
  MAP_VIEW = 'MAP_VIEW',
}

// Helper type for Supabase response mapping if needed in future
export interface DatabaseMood {
  id: string;
  created_at: string;
  emoji: string;
  status: string | null;
  lat: number;
  lng: number;
}
