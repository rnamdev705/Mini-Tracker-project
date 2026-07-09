import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PrimaryButton } from '@/ui/PrimaryButton';
import { StatusBadge } from '@/ui/StatusBadge';
import { useItems } from '@/hooks/useItems';
import { useMainRefresh } from '@/state/mainRefresh';
import { usePendingSummary } from '@/hooks/usePendingSummary';
import { signOut } from '@/services/authService';
import { deleteMyItem } from '@/services/itemsService';
import type { ItemRow } from '@/types/item';

function formatAmount(amount: number) {
  // Keep it simple and readable for a take-home assignment.
  return amount % 1 === 0 ? String(amount.toFixed(0)) : String(amount);
}

function emptyMessage() {
  return 'No items yet. Add your first one!';
}

export default function ItemsListScreen() {
  const router = useRouter();
  const { refreshKey, triggerRefresh } = useMainRefresh();

  const { items, loading, refreshing, onRefresh, error } = useItems(refreshKey);
  const { summary, loading: summaryLoading, error: summaryError } = usePendingSummary(refreshKey);

  const [signingOut, setSigningOut] = useState(false);

  const signOutPressed = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/sign-in' as any);
    } finally {
      setSigningOut(false);
    }
  }, [router]);

  const header = useMemo(() => {
    const pendingTotal = summary?.pending_total ?? 0;
    const pendingCount = summary?.pending_count ?? 0;

    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.appTitle}>Mini Tracker</Text>
          <PrimaryButton
            title={signingOut ? '…' : 'Sign out'}
            onPress={signOutPressed}
            tone="danger"
            disabled={signingOut}
            style={styles.signOutBtn}
          />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Edge Function Summary</Text>
          <Text style={styles.summaryLine}>Pending total: {formatAmount(pendingTotal)}</Text>
          <Text style={styles.summaryLine}>Pending items: {pendingCount}</Text>

          {summaryError ? <Text style={styles.summaryError}>Summary error: {summaryError}</Text> : null}
          {summaryLoading ? <Text style={styles.summaryLoading}>Loading summary…</Text> : null}
        </View>
      </View>
    );
  }, [signOutPressed, summary?.pending_count, summary?.pending_total, summaryError, summaryLoading, signingOut]);

  const onDelete = useCallback(
    (item: ItemRow) => {
      Alert.alert('Delete item', `Delete “${item.title}”?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMyItem(item.id);
              triggerRefresh();
            } catch (e) {
              const msg = e instanceof Error ? e.message : 'Delete failed';
              Alert.alert('Delete failed', msg);
            }
          },
        },
      ]);
    },
    [triggerRefresh],
  );

  const renderItem = useCallback(
    ({ item }: { item: ItemRow }) => {
      return (
        <View style={styles.card}>
          <View style={styles.cardMain}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.cardAmount}>{formatAmount(item.amount)}</Text>
            <StatusBadge status={item.status} />
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.createdAt}>{new Date(item.created_at).toLocaleDateString()}</Text>
            <View style={styles.actionsRow}>
              <Text
                style={styles.actionLink}
                onPress={() => router.push(`/items/${item.id}` as any)}>
                Edit
              </Text>
              <Text style={styles.actionLinkDanger} onPress={() => onDelete(item)}>
                Delete
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [onDelete, router],
  );

  const listEmpty = useMemo(() => {
    if (loading) return null;
    if (error) return <Text style={styles.errorText}>Items error: {error}</Text>;
    return <Text style={styles.emptyText}>{emptyMessage()}</Text>;
  }, [error, loading]);

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        ListHeaderComponent={header}
        renderItem={renderItem}
        ListEmptyComponent={listEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={items.length ? styles.listWithItems : styles.listEmpty}
      />

      <View style={styles.fabWrap}>
        <PrimaryButton
          title="+ Add"
          onPress={() => router.push('/items/new' as any)}
          style={styles.fab}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  appTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  signOutBtn: { flexGrow: 0, paddingHorizontal: 12, paddingVertical: 10 },
  summaryCard: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  summaryTitle: { fontWeight: '900', color: '#0F172A' },
  summaryLine: { color: '#334155', fontWeight: '700' },
  summaryError: { color: '#B00020', marginTop: 4 },
  summaryLoading: { color: '#64748B' },

  listWithItems: { paddingBottom: 120 },
  listEmpty: { paddingBottom: 120, alignItems: 'center', justifyContent: 'center' },

  card: {
    marginHorizontal: 18,
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  cardMain: { gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  cardAmount: { fontSize: 22, fontWeight: '900', color: '#208AEF' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 },
  createdAt: { color: '#64748B', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  actionLink: { color: '#208AEF', fontWeight: '800' },
  actionLinkDanger: { color: '#E53935', fontWeight: '800' },

  errorText: { color: '#B00020', marginTop: 20, fontWeight: '700' },
  emptyText: { color: '#334155', marginTop: 20, fontWeight: '700' },

  fabWrap: { position: 'absolute', right: 18, bottom: 18 },
  fab: {
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#208AEF',
  },
});

