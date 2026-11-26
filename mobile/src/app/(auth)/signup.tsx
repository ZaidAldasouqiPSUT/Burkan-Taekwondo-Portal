import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Link, router } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { friendlyAuthError, useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { AuthBackdrop } from '@/components/auth-backdrop';
import { Badge, Button, Card, Chips, ErrorNote, Field, Muted, Row } from '@/components/ui';
import { colors, fonts } from '@/lib/theme';
import { t } from '@/lib/i18n';

type SignupRole = 'student' | 'parent' | 'coach';

export default function Signup() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<SignupRole>('parent');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstAccount, setFirstAccount] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'meta', 'bootstrap'))
      .then((s) => setFirstAccount(!s.exists()))
      .catch(() => setFirstAccount(false));
  }, []);

  const handleSignup = async () => {
    setError(null);
    if (fullName.trim().split(/\s+/).length < 2) return setError('Please enter your full name (first and last).');
    if (!email.trim()) return setError('Please enter your email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await signUp({ fullName, email, phone, password, role, joinCode });
      router.replace('/');
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  const codeHint =
    role === 'coach'
      ? 'Enter the coach code from the head coach to get access instantly.'
      : 'Enter the student code from your coach to get access instantly. Without a code, an admin approves your account.';

  return (
    <AuthBackdrop title="Join Burkan" subtitle="Create your portal account">
      {firstAccount ? (
        <Card style={{ backgroundColor: colors.primarySoft, shadowOpacity: 0, elevation: 0, gap: 6 }}>
          <Badge label="First account" tone="primary" />
          <Muted style={{ color: colors.text }}>No administrator exists yet. This account will become the club administrator.</Muted>
        </Card>
      ) : null}
      <ErrorNote message={error} />
      <Field label="Full name (as on official records)" value={fullName} onChangeText={setFullName} autoComplete="name" textContentType="name" placeholder="First Last" />
      <Field label="Email address" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="champion@example.com" />
      <Field label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" placeholder="+962 7..." />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" textContentType="newPassword" hint="At least 6 characters" />
      {!firstAccount ? (
        <>
          <Chips
            label="I am a"
            value={role}
            onChange={setRole}
            options={[
              { value: 'parent', label: 'Parent' },
              { value: 'student', label: 'Student' },
              { value: 'coach', label: 'Coach' },
            ]}
          />
          <Field
            label="Join code (optional)"
            value={joinCode}
            onChangeText={(t) => setJoinCode(t.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="e.g. K7M2QX"
            hint={codeHint}
          />
        </>
      ) : null}
      <Button title="Create account" size="lg" onPress={handleSignup} loading={loading} />
      <Row style={{ justifyContent: 'center', marginTop: 4 }} gap={6}>
        <Muted>Already have an account?</Muted>
        <Link href="/login" replace>
          <Text style={{ color: colors.primary, fontFamily: fonts.bold, fontSize: 13 }}>{t('Sign in')}</Text>
        </Link>
      </Row>
    </AuthBackdrop>
  );
}
