import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rsdhrezqhkzurgwbohba.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_jl0vfCdpz4I2pAzHkH2OFQ_kObStrxC';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials. Ensure .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)');
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://rsdhrezqhkzurgwbohba.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_jl0vfCdpz4I2pAzHkH2OFQ_kObStrxC'
);
