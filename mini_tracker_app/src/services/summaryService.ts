import { supabase } from '@/lib/supabaseClient';
import { getSupabaseEnv } from '@/lib/env';

export type PendingSummary = {
  pending_total: number;
  pending_count: number;
};

export async function fetchPendingSummary(): Promise<PendingSummary> {
  const { supabaseUrl } = getSupabaseEnv();
  if (!supabaseUrl) throw new Error('Missing SUPABASE_URL');

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${supabaseUrl}/functions/v1/item-summary`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  const json = (await res.json().catch(() => null)) as
    | { message?: string; pending_total?: number; pending_count?: number }
    | null;

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        'Edge Function "item-summary" not deployed. Run: npm run supabase:deploy (after npx supabase login)',
      );
    }
    throw new Error(json?.message ?? `Edge Function failed (${res.status})`);
  }

  return {
    pending_total: Number(json?.pending_total ?? 0),
    pending_count: Number(json?.pending_count ?? 0),
  };
}

