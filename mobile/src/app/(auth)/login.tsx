import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { friendlyAuthError, useAuth } from '@/lib/auth';
import { AuthBackdrop } from '@/components/auth-backdrop';
import { Button, ErrorNote, Field, Muted, Row, Sheet } from '@/components/ui';
import { useToast } from '@/components/toast';
import { colors, fonts } from '@/lib/theme';
import { t } from '@/lib/i18n';

export default function Login() {
  const { signIn, resetPassword } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) return setError('Please enter your email and password.');
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/');
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!resetEmail.trim()) return;
    setSending(true);
    try {
      await resetPassword(resetEmail);
    } catch {
      // Don't reveal whether the account exists.
    } finally {
      setSending(false);
      setForgotOpen(false);
      toast('Reset link sent', 'If an account exists for that email, a reset link is on its way.');
    }
  };

  return (
    <AuthBackdrop title="Burkan Portal" subtitle="Sign in to access your dashboard">
      <ErrorNote message={error} />
      <Field
        label="Email address"
        value={email}
        onChangeText={setEmail}
        placeholder="champion@example.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={handleLogin}
        returnKeyType="go"
      />
      <Pressable
        onPress={() => {
          setResetEmail(email);
          setForgotOpen(true);
        }}
        style={{ alignSelf: 'flex-end' }}
      >
        <Text style={{ color: colors.primary, fontFamily: fonts.semibold, fontSize: 13 }}>{t('Forgot password?')}</Text>
      </Pressable>
      <Button title="Sign in" size="lg" onPress={handleLogin} loading={loading} />
      <Row style={{ justifyContent: 'center', marginTop: 4 }} gap={6}>
        <Muted>New to Burkan?</Muted>
        <Link href="/signup" replace>
          <Text style={{ color: colors.primary, fontFamily: fonts.bold, fontSize: 13 }}>{t('Create an account')}</Text>
        </Link>
      </Row>

      <Sheet
        visible={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Reset password"
        subtitle="Enter your email to receive a password reset link."
        footer={
          <>
            <Button title="Cancel" variant="outline" onPress={() => setForgotOpen(false)} style={{ flex: 1 }} />
            <Button title="Send link" onPress={handleReset} loading={sending} disabled={!resetEmail.trim()} style={{ flex: 1 }} />
          </>
        }
      >
        <Field label="Email" value={resetEmail} onChangeText={setResetEmail} autoCapitalize="none" keyboardType="email-address" placeholder="your@email.com" />
      </Sheet>
    </AuthBackdrop>
  );
}
