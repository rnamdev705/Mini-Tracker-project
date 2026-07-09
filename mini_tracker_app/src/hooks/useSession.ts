import { useEffect, useMemo, useState } from 'react';

import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabaseClient';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Keep a stable reference so we can safely unsubscribe.
  const getSessionOnce = useMemo(
    () => async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setInitializing(false);
    },
    [],
  );

  useEffect(() => {
    void getSessionOnce();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [getSessionOnce]);

  return { session, initializing };
}

