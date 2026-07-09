import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PrimaryButton } from '@/ui/PrimaryButton';
import { Field } from '@/ui/Field';
import { StatusBadge } from '@/ui/StatusBadge';
import { ErrorBanner } from '@/ui/ErrorBanner';
import { useMainRefresh } from '@/state/mainRefresh';
import { createMyItem } from '@/services/itemsService';
import type { ItemInput, ItemStatus } from '@/types/item';

function parseAmount(raw: string): number | null {
  const cleaned = raw.trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export default function NewItemScreen() {
  const router = useRouter();
  const { triggerRefresh } = useMainRefresh();

  const [title, setTitle] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [status, setStatus] = useState<ItemStatus>('pending');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = parseAmount(amountRaw);

  const canSubmit = useMemo(() => title.trim().length > 0 && amount !== null && !busy, [title, amount, busy]);

  async function onSubmit() {
    if (!canSubmit || amount === null) return;
    setBusy(true);
    setError(null);
    try {
      const input: ItemInput = {
        title: title.trim(),
        amount,
        status,
      };
      await createMyItem(input);
      triggerRefresh();
      router.replace('/items' as any);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create item');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <Text style={styles.title}>Add item</Text>

        <View style={styles.form}>
          <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g., Internet bill" />

          <Field
            label="Amount"
            value={amountRaw}
            onChangeText={setAmountRaw}
            placeholder="e.g., 120.5"
            keyboardType="numeric"
            rightHint={amountRaw ? <Text style={styles.pwHint}>Parsed: {amount ?? '—'}</Text> : undefined}
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

          <PrimaryButton title={busy ? 'Saving…' : 'Save'} onPress={onSubmit} disabled={!canSubmit} />

          <Text style={styles.backLink} onPress={() => router.back()}>
            Cancel
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
  statusRow: { gap: 10 },
  statusLabel: { fontWeight: '800', color: '#334155' },
  statusButtons: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statusBtn: { paddingVertical: 10, paddingHorizontal: 12 },
  pwHint: { color: '#64748B', fontSize: 12 },
  backLink: { marginTop: 6, color: '#208AEF', fontWeight: '800', textAlign: 'center' },
});

