import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type MainRefreshContextValue = {
  refreshKey: number;
  triggerRefresh: () => void;
};

const MainRefreshContext = createContext<MainRefreshContextValue | null>(null);

export function useMainRefresh() {
  const value = useContext(MainRefreshContext);
  if (!value) throw new Error('useMainRefresh must be used within MainRefreshProvider');
  return value;
}

export function MainRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const value = useMemo(() => ({ refreshKey, triggerRefresh }), [refreshKey, triggerRefresh]);

  return <MainRefreshContext.Provider value={value}>{children}</MainRefreshContext.Provider>;
}

