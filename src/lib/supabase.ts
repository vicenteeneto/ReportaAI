import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('Supabase URL or Anon Key is missing. Ensure they are set in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    // Must be true: Supabase reads the auth token from the URL hash after
    // OAuth/email redirect login. Setting this to false breaks login entirely.
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    // Hard fetch timeout for Android Chrome (fetch can hang indefinitely)
    fetch: (url, options) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      return fetch(url, { ...options, signal: controller.signal })
        .then(res => { clearTimeout(timeoutId); return res; })
        .catch(err => { clearTimeout(timeoutId); throw err; });
    }
  }
});
