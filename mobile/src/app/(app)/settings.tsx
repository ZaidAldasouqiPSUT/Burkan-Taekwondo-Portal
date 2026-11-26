import { useState } from 'react';
import { Alert, View } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { friendlyAuthError, isAdmin, useAuth } from '@/lib/auth';
import { useStudents } from '@/lib/data';
import { seedStarterData } from '@/lib/seed';
import { colors, fonts } from '@/lib/theme';
import { Badge, Body, Button, Card, Chips, Field, Muted, Overline, Row, Screen, Title, Toggle } from '@/components/ui';
import { useToast } from '@/components/toast';
import { t, useLanguage, type Lang } from '@/lib/i18n';

export default function Settings() {
  const { profile, user, resetPassword, linkChild } = useAuth();
  const { lang, setLang } = useLanguage();
  const toast = useToast();
  const students = useStudents();
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [savingPhone, setSavingPhone] = useState(false);
  const [code, setCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [seeding, setSeeding] = useState(false);

  if (!profile) return null;
  const ref = doc(db, 'users', profile.id);

  const setPref = (key: 'notifyPush' | 'notifyEmail' | 'notifySms', value: boolean) =>
    updateDoc(ref, { [key]: value }).catch((e) => toast('Could not save', friendlyAuthError(e), 'error'));

  return (
    <Screen>
      <Card style={{ gap: 10 }}>
        <Title style={{ textTransform: 'uppercase' }}>Language</Title>
        <Chips<Lang>
          options={[
            { value: 'en', label: 'English' },
            { value: 'ar', label: 'العربية' },
          ]}
          value={lang}
          onChange={setLang}
        />
      </Card>
      <Card style={{ gap: 12 }}>
        <Title style={{ textTransform: 'uppercase' }}>Profile</Title>
        <Muted>Your official identity records.</Muted>
        <Card style={{ backgroundColor: colors.warningSoft, shadowOpacity: 0, elevation: 0 }}>
          <Body style={{ fontFamily: fonts.bold, marginBottom: 2 }}>Name changes restricted</Body>
          <Muted style={{ color: '#92400E' }}>
            For federation compliance, names must match official records exactly. Contact the front desk or your head coach to request spelling corrections.
          </Muted>
        </Card>
        <Field label="Full name (read-only)" value={profile.fullName} editable={false} style={{ color: colors.muted }} />
        <Field label="Assigned role (read-only)" value={t(profile.role).toUpperCase()} editable={false} style={{ color: colors.muted }} />
        <Field label="Email (read-only)" value={profile.email} editable={false} style={{ color: colors.muted }} />
        <Field label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Button
          title="Save contact info"
          loading={savingPhone}
          disabled={phone === profile.phone}
          onPress={async () => {
            setSavingPhone(true);
            try {
              await updateDoc(ref, { phone: phone.trim() });
              toast('Contact info saved', 'Your contact details have been updated.');
            } catch (e) {
              toast('Could not save', friendlyAuthError(e), 'error');
            } finally {
              setSavingPhone(false);
            }
          }}
        />
      </Card>

      {profile.role === 'parent' ? (
        <Card style={{ gap: 12 }}>
          <Title style={{ textTransform: 'uppercase' }}>My children</Title>
          {students.data.map((s) => (
            <Row key={s.id} style={{ justifyContent: 'space-between' }}>
              <Body>{s.fullName}</Body>
              <Badge label={t(s.belt)} />
            </Row>
          ))}
          {students.data.length === 0 ? <Muted>No children linked yet.</Muted> : null}
          <Field
            label="Link another child"
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="Join code from the coach"
          />
          <Button
            title="Link child"
            variant="outline"
            icon="link"
            loading={linking}
            disabled={!code.trim()}
            onPress={async () => {
              setLinking(true);
              try {
                const name = await linkChild(code);
                setCode('');
                toast('Child linked', t('{name} now appears in your portal.', { name }));
              } catch (e) {
                toast('Could not link', friendlyAuthError(e), 'error');
              } finally {
                setLinking(false);
              }
            }}
          />
        </Card>
      ) : null}

      <Card style={{ gap: 6 }}>
        <Title style={{ textTransform: 'uppercase' }}>Notifications</Title>
        <Toggle
          label="Push notifications"
          description="Alerts for schedule changes and feedback on your device."
          value={profile.notifyPush ?? true}
          onChange={(v) => setPref('notifyPush', v)}
        />
        <Toggle
          label="Email updates"
          description="Monthly progress reports and billing statements."
          value={profile.notifyEmail ?? true}
          onChange={(v) => setPref('notifyEmail', v)}
        />
        <Toggle label="SMS alerts" description="Urgent club closures or emergency updates." value={profile.notifySms ?? false} onChange={(v) => setPref('notifySms', v)} />
      </Card>

      <Card style={{ gap: 12 }}>
        <Title style={{ textTransform: 'uppercase' }}>Security</Title>
        <Muted>{"We'll email you a secure link to set a new password."}</Muted>
        <Button
          title="Change password"
          variant="outline"
          icon="lock"
          onPress={async () => {
            try {
              await resetPassword(user?.email ?? profile.email);
              toast('Reset link sent', t('Check {email}.', { email: user?.email ?? profile.email }));
            } catch (e) {
              toast('Could not send', friendlyAuthError(e), 'error');
            }
          }}
        />
      </Card>

      {isAdmin(profile) ? (
        <Card style={{ gap: 10 }}>
          <Overline>Administrator</Overline>
          <Title>Starter data</Title>
          <Muted>
            {"Loads the portal's sample content (3 athletes with join codes, both branches, weekly schedule, belt tests, news, and example records). Only works while no students exist."}
          </Muted>
          <Button
            title="Load starter data"
            variant="dark"
            icon="database"
            loading={seeding}
            onPress={async () => {
              setSeeding(true);
              try {
                const codes = await seedStarterData(profile.fullName);
                Alert.alert(
                  t('Starter data loaded'),
                  `${t('Join codes:')}\n${Object.entries(codes)
                    .map(([n, c]) => `${n}: ${c}`)
                    .join('\n')}\n\n${t('You can see them any time in Students.')}`,
                );
              } catch (e) {
                toast('Not loaded', friendlyAuthError(e), 'error');
              } finally {
                setSeeding(false);
              }
            }}
          />
        </Card>
      ) : null}
      <View style={{ alignItems: 'center', marginTop: 4 }}>
        <Muted style={{ fontSize: 11 }}>Burkan TKD · v1.0.0</Muted>
      </View>
    </Screen>
  );
}
