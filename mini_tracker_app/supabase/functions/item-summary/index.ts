import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type PendingSummaryResponse = {
  pending_total: number;
  pending_count: number;
};

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return 0;
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405 });
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const accessToken = authHeader.replace(/^Bearer\s+/i, '');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ message: 'Missing edge function env' }), { status: 500 });
    }

    // Pass the caller's JWT so RLS can restrict rows for this user.
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    const { data: pendingRows, error: pendingError } = await supabase
      .from('items')
      .select('amount')
      .eq('status', 'pending');

    if (pendingError) {
      return new Response(JSON.stringify({ message: pendingError.message }), { status: 400 });
    }

    const pendingCount = (pendingRows ?? []).length;
    const pendingTotal = (pendingRows ?? []).reduce((sum, row) => sum + toNumber((row as any).amount), 0);

    const response: PendingSummaryResponse = {
      pending_total: pendingTotal,
      pending_count: pendingCount,
    };

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown edge function error';
    return new Response(JSON.stringify({ message: msg }), { status: 500 });
  }
});

