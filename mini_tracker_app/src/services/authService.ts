import { supabase } from '@/lib/supabaseClient';

export async function signUpWithEmail(email: string, password: string) {
  // Supabase may be configured to require email confirmation; handle that via README.
  return supabase.auth.signUp({ email, password });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

