import { Slot } from 'expo-router';

import { MainRefreshProvider } from '@/state/mainRefresh';

export default function MainGroupLayout() {
  return (
    <MainRefreshProvider>
      <Slot />
    </MainRefreshProvider>
  );
}
