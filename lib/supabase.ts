import { createClient } from '@supabase/supabase-js';

// Retrieve from environment variables or custom localStorage override
export const getSupabaseConfig = () => {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('vashik_supabase_url');
    const localKey = localStorage.getItem('vashik_supabase_key');
    if (localUrl && localKey) {
      return { url: localUrl, anonKey: localKey, isCustom: true };
    }
  }

  return { url: envUrl, anonKey: envKey, isCustom: false };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http') && anonKey.length > 20);
};

export const getSupabaseClient = () => {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;
  try {
    return createClient(url, anonKey);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};
