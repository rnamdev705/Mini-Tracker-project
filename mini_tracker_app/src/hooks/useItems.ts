import { useCallback, useEffect, useState } from 'react';

import type { ItemRow } from '@/types/item';
import { fetchMyItems } from '@/services/itemsService';

export function useItems(refreshKey?: number) {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (mode: 'initial' | 'refresh') => {
    try {
      if (mode === 'refresh') setRefreshing(true);
      else setLoading(true);

      setError(null);
      const next = await fetchMyItems();
      setItems(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load items');
    } finally {
      if (mode === 'refresh') setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload('initial');
  }, [reload, refreshKey]);

  const onRefresh = useCallback(() => reload('refresh'), [reload]);

  return { items, loading, refreshing, error, reload, onRefresh };
}

