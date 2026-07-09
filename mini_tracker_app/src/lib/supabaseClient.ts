import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { requireSupabaseEnv } from '@/lib/env';

const storage = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // ignore: session won't persist this run
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

function createSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = requireSupabaseEnv();

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = createSupabaseClient();
