import Constants from 'expo-constants';

type SupabaseExtra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

export function getSupabaseEnv() {
  const extra = Constants.expoConfig?.extra as SupabaseExtra | undefined;

  // `extra` is populated from `.env` via app.config.ts at startup.
  // Static `process.env.EXPO_PUBLIC_*` refs are a fallback for web/tooling.
  const supabaseUrl =
    extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  return { supabaseUrl, supabaseAnonKey };
}

export function requireSupabaseEnv() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase config. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env, then restart with: npx expo start --clear',
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}
