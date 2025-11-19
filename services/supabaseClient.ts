import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// IMPORTANT: Replace these placeholders with your actual Supabase keys
// You can find these in your Supabase Dashboard -> Project Settings -> API
// ------------------------------------------------------------------

const SUPABASE_URL = 'https://ttdwpoyqmqaghdkifjux.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Wcq46BhcF9qS2CUwFz8JkQ_OSB96e34';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
