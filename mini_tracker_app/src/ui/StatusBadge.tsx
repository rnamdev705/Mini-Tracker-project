import { StyleSheet, Text, View } from 'react-native';

import type { ItemStatus } from '@/types/item';

export function StatusBadge({ status }: { status: ItemStatus }) {
  const isDone = status === 'done';

  return (
    <View style={[styles.badge, isDone ? styles.done : styles.pending]}>
      <Text style={styles.text}>{isDone ? 'Done' : 'Pending'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  pending: {
    backgroundColor: '#FFF3E0',
  },
  done: {
    backgroundColor: '#E7F6EC',
  },
  text: {
    color: '#111',
    fontWeight: '700',
    fontSize: 12,
  },
});

