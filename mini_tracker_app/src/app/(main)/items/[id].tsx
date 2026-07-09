import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { PrimaryButton } from '@/ui/PrimaryButton';
import { Field } from '@/ui/Field';
import { StatusBadge } from '@/ui/StatusBadge';
import { ErrorBanner } from '@/ui/ErrorBanner';
import { useMainRefresh } from '@/state/mainRefresh';
import { deleteMyItem, fetchMyItem, updateMyItem } from '@/services/itemsService';
import type { ItemInput, ItemStatus } from '@/types/item';

function parseAmount(raw: string): number | null {
  const cleaned = raw.trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export default function EditItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const itemId = Array.isArray(id) ? id[0] : id;

  const { triggerRefresh } = useMainRefresh();

  const [loading, setLoading] = useState(true);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [status, setStatus] = useState<ItemStatus>('pending');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = parseAmount(amountRaw);
  const canSubmit = useMemo(() => title.trim().length > 0 && amount !== null && !busy, [title, amount, busy]);

  useEffect(() => {
    async function load() {
      if (!itemId) return;
      setLoading(true);
      setError(null);
      try {
        const row = await fetchMyItem(itemId);
        setTitle(row.title);
        setAmountRaw(String(row.amount));
        setStatus(row.status);
        setCreatedAt(row.created_at);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load item');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [itemId]);

  async function onSubmit() {
    if (!itemId || !canSubmit || amount === null) return;
    setBusy(true);
    setError(null);
    try {
      const input: ItemInput = { title: title.trim(), amount, status };
      await updateMyItem(itemId, input);
      triggerRefresh();
      router.replace('/items' as any);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update item');
    } finally {
      setBusy(false);
    }
  }

  const onDelete = () => {
    if (!itemId) return;
    Alert.alert('Delete item', `Delete "${title || 'this item'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMyItem(itemId);
            triggerRefresh();
            router.replace('/items' as any);
          } catch (e) {
            Alert.alert('Delete failed', e instanceof Error ? e.message : 'Delete failed');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <Text style={styles.title}>Edit item</Text>

        <View style={styles.form}>
          {loading ? <Text style={styles.loadingText}>Loading...</Text> : null}
          {createdAt ? <Text style={styles.createdAt}>Created: {new Date(createdAt).toLocaleDateString()}</Text> : null}

          <Field label="Title" value={title} onChangeText={setTitle} placeholder="Title" />

          <Field
            label="Amount"
            value={amountRaw}
            onChangeText={setAmountRaw}
            placeholder="Amount"
            keyboardType="numeric"
            rightHint={amountRaw ? <Text style={styles.pwHint}>Parsed: {amount ?? '-'}</Text> : undefined}
          />

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.statusButtons}>
              <PrimaryButton
                title="Pending"
                onPress={() => setStatus('pending')}
                disabled={status === 'pending'}
                style={styles.statusBtn}
              />
              <PrimaryButton
                title="Done"
                onPress={() => setStatus('done')}
                disabled={status === 'done'}
                style={styles.statusBtn}
              />
            </View>
            <StatusBadge status={status} />
          </View>

          {error ? <ErrorBanner message={error} /> : null}

          <PrimaryButton title={busy ? 'Saving...' : 'Save changes'} onPress={onSubmit} disabled={!canSubmit} />

          <PrimaryButton title="Delete" onPress={onDelete} tone="danger" disabled={busy} style={styles.deleteBtn} />

          <Text style={styles.backLink} onPress={() => router.back()}>
            Back
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 18, backgroundColor: '#F8FAFC' },
  container: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 16 },
  form: { gap: 14 },
  loadingText: { color: '#64748B', fontWeight: '700' },
  createdAt: { color: '#64748B', fontWeight: '700', marginTop: -2 },
  pwHint: { color: '#64748B', fontSize: 12 },
  statusRow: { gap: 10 },
  statusLabel: { fontWeight: '800', color: '#334155' },
  statusButtons: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statusBtn: { paddingVertical: 10, paddingHorizontal: 12 },
  backLink: { marginTop: 6, color: '#208AEF', fontWeight: '800', textAlign: 'center' },
  deleteBtn: { paddingVertical: 12 },
});
