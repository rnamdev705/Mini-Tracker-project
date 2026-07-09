import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PrimaryButton } from '@/ui/PrimaryButton';
import { Field } from '@/ui/Field';
import { ErrorBanner } from '@/ui/ErrorBanner';
import { signUpWithEmail } from '@/services/authService';
import { friendlySignUpError } from '@/lib/authErrors';
import { useSession } from '@/hooks/useSession';

export default function SignUpScreen() {
  const router = useRouter();
  const { session, initializing } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!initializing && session) router.replace('/items' as any);
  }, [initializing, session, router]);

  const canSubmit = useMemo(() => email.trim().length > 0 && password.length >= 6 && !busy, [email, password, busy]);

  async function onSubmit() {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const { data, error } = await signUpWithEmail(email.trim(), password);
      if (error) throw error;

      if (data.session) {
        router.replace('/items' as any);
      } else {
        setInfo('Account created. If email confirmation is enabled, confirm your inbox before signing in.');
        Alert.alert('Check your email', 'If confirmation is enabled, verify your inbox before signing in.');
      }
    } catch (e) {
      const msg = friendlySignUpError(e);
      setError(msg);
      Alert.alert('Sign up failed', msg);
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
        <Text style={styles.subtitle}>Create an account</Text>

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
            placeholder="At least 6 characters"
            secureTextEntry
            keyboardType="visible-password"
            rightHint={password.length ? <Text style={styles.pwHint}>{password.length} chars</Text> : undefined}
          />

          {error ? <ErrorBanner message={error} /> : null}
          {info ? <View style={styles.infoWrap}><Text style={styles.infoText}>{info}</Text></View> : null}

          <PrimaryButton title={busy ? 'Creating…' : 'Create account'} onPress={onSubmit} disabled={!canSubmit} />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Text style={styles.footerLink} onPress={() => router.push('/sign-in' as any)}>
              Sign in
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
  pwHint: { color: '#64748B', fontSize: 12 },
  infoWrap: {
    padding: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  infoText: { color: '#3730A3', fontWeight: '600' },
  footerRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'center', gap: 8, alignItems: 'center' },
  footerText: { color: '#475569', fontSize: 13 },
  footerLink: { color: '#208AEF', fontWeight: '800', fontSize: 13 },
});

