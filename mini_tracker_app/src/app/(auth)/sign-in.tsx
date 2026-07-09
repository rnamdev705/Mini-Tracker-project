import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PrimaryButton } from '@/ui/PrimaryButton';
import { Field } from '@/ui/Field';
import { ErrorBanner } from '@/ui/ErrorBanner';
import { signInWithEmail } from '@/services/authService';
import { friendlySignInError } from '@/lib/authErrors';
import { useSession } from '@/hooks/useSession';

export default function SignInScreen() {
  const router = useRouter();
  const { session, initializing } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initializing && session) router.replace('/items' as any);
  }, [initializing, session, router]);

  const canSubmit = useMemo(() => email.trim().length > 0 && password.length > 0 && !busy, [email, password, busy]);

  async function onSubmit() {
    setBusy(true);
    setError(null);
    try {
      const { error } = await signInWithEmail(email.trim(), password);
      if (error) throw error;
      router.replace('/items' as any);
    } catch (e) {
      const msg = friendlySignInError(e);
      setError(msg);
      Alert.alert('Sign in failed', msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <Text style={styles.title}>Mini Tracker</Text>
        <Text style={styles.subtitle}>Sign in to manage your items</Text>

        <View style={styles.form}>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            keyboardType="visible-password"
          />

          {error ? <ErrorBanner message={error} /> : null}

          <PrimaryButton title={busy ? 'Signing in…' : 'Sign in'} onPress={onSubmit} disabled={!canSubmit} />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New here?</Text>
            <Text style={styles.footerLink} onPress={() => router.push('/sign-up' as any)}>
              Create account
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 18 },
  container: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '900', color: '#0F172A' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#475569' },
  form: { marginTop: 20, gap: 14 },
  footerRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'center', gap: 8, alignItems: 'center' },
  footerText: { color: '#475569', fontSize: 13 },
  footerLink: { color: '#208AEF', fontWeight: '800', fontSize: 13 },
});

