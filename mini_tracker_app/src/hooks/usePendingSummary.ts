import { useCallback, useEffect, useState } from 'react';

import type { PendingSummary } from '@/services/summaryService';
import { fetchPendingSummary } from '@/services/summaryService';

export function usePendingSummary(refreshKey?: number) {
  const [summary, setSummary] = useState<PendingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const next = await fetchPendingSummary();
      setSummary(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load summary');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey]);

  return { summary, loading, error, reload };
}

