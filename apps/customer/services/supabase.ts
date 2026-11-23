import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://demo-cravecart.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    try {
      return SecureStore.getItemAsync(key);
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string) => {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch {
      return Promise.resolve();
    }
  },
  removeItem: (key: string) => {
    try {
      return SecureStore.deleteItemAsync(key);
    } catch {
      return Promise.resolve();
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
