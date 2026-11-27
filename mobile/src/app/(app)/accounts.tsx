import { useMemo, useState } from 'react';
import { Share, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { friendlyAuthError, isAdmin, useAuth } from '@/lib/auth';
import { disableCoachCode, regenerateCoachCode, update, useCoachCode, useCollection, useStudents } from '@/lib/data';
import { formatDate, formatTimestamp } from '@/lib/format';
import { colors, fonts } from '@/lib/theme';
import type { Role, StaffRequest, UserProfile } from '@/lib/types';
import {
  Avatar,
  Badge,
  Body,
  Button,
  Card,
  Chips,
  Empty,
  ErrorNote,
  Field,
  Loading,
  Muted,
  Overline,
  Restricted,
  Row,
  Screen,
  Sheet,
  Title,
  confirm,
  statusTone,
} from '@/components/ui';
import { StudentPicker } from '@/components/student-picker';
import { useToast } from '@/components/toast';
import { t } from '@/lib/i18n';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'parent', label: 'Parent' },
  { value: 'student', label: 'Student' },
  { value: 'coach', label: 'Coach' },
  { value: 'admin', label: 'Admin' },
];

export default function Accounts() {
  const { profile } = useAuth();
  const toast = useToast();
  const users = useCollection<UserProfile>('users', isAdmin(profile));
  const requests = useCollection<StaffRequest>('requests', isAdmin(profile));
  const students = useStudents();
  const coachCode = useCoachCode();
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const [search, setSearch] = useState('');

  const pending = users.data.filter((u) => u.status === 'pending').sort((a, b) => a.createdAt - b.createdAt);
  const openRequests = requests.data.filter((r) => r.status === 'Pending').sort((a, b) => a.createdAt - b.createdAt);
  const members = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.data
      .filter((u) => u.status !== 'pending')
      .filter((u) => !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [users.data, search]);

  if (!isAdmin(profile)) return <Restricted message="Only administrators can manage accounts." />;

  const studentName = (id: string) => students.data.find((s) => s.id === id)?.fullName ?? t('Removed student');

  return (
    <Screen>
      {/* How self-admission works */}
      <Card style={{ backgroundColor: colors.black, gap: 8 }}>
        <Overline>No more manual admission</Overline>
        <Body style={{ color: '#fff' }}>
          Every student has a join code (Students → tap a student). Parents and students who sign up with it are approved and linked automatically. Only sign-ups without a code land here.
        </Body>
      </Card>

      {/* Coach invite code */}
      <Card style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Title>Coach invite code</Title>
          {coachCode ? <Badge label="Active" tone="success" /> : <Badge label="Off" />}
        </Row>
        {coachCode ? <Body style={{ fontFamily: fonts.display, fontSize: 30, letterSpacing: 6 }}>{coachCode}</Body> : null}
        <Muted>Coaches who sign up with this code get coach access instantly. Turn it off or replace it if it leaks.</Muted>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          <Button
            title={coachCode ? 'New code' : 'Create code'}
            size="sm"
            icon="refresh-cw"
            onPress={async () => {
              try {
                const c = await regenerateCoachCode(coachCode);
                toast('Coach code ready', c);
              } catch (e) {
                toast('Failed', friendlyAuthError(e), 'error');
              }
            }}
          />
          {coachCode ? (
            <>
              <Button
                title="Copy"
                size="sm"
                variant="outline"
                icon="copy"
                onPress={async () => {
                  await Clipboard.setStringAsync(coachCode);
                  toast('Copied', coachCode);
                }}
              />
              <Button
                title="Share"
                size="sm"
                variant="outline"
                icon="share-2"
                onPress={() => Share.share({ message: t('Burkan TKD coach access: create an account in the Burkan TKD app, choose Coach, and enter code {code}.', { code: coachCode }) })}
              />
              <Button title="Turn off" size="sm" variant="danger" onPress={() => disableCoachCode(coachCode)} />
            </>
          ) : null}
        </Row>
      </Card>

      {/* Pending approvals */}
      <Overline>{t('Awaiting approval ({n})', { n: pending.length })}</Overline>
      {users.loading ? (
        <Loading />
      ) : pending.length === 0 ? (
        <Empty icon="check-circle" title="All caught up" message="No accounts are waiting for approval." />
      ) : (
        pending.map((u) => (
          <Card key={u.id} accent={colors.warning}>
            <Row gap={12}>
              <Avatar name={u.fullName} size={40} color="#9CA3AF" />
              <View style={{ flex: 1 }}>
                <Body style={{ fontFamily: fonts.semibold }}>{u.fullName}</Body>
                <Muted style={{ fontSize: 12 }}>
                  {u.email}
                  {u.phone ? ` · ${u.phone}` : ''}
                </Muted>
                <Muted style={{ fontSize: 12 }}>
                  {t('Asked to join as {role} · {date}', { role: t(u.role), date: formatTimestamp(u.createdAt) })}
                </Muted>
              </View>
            </Row>
            <Row gap={8} style={{ marginTop: 12 }}>
              <Button title="Review & approve" size="sm" onPress={() => setEditing(u)} style={{ flex: 1 }} />
              <Button
                title="Decline"
                size="sm"
                variant="danger"
                onPress={() => confirm('Decline request?', u.fullName, () => update('users', u.id, { status: 'rejected' }), 'Decline')}
              />
            </Row>
          </Card>
        ))
      )}

      {/* Staff requests */}
      {openRequests.length ? (
        <>
          <Overline>{t('Coach requests ({n})', { n: openRequests.length })}</Overline>
          {openRequests.map((r) => (
            <Card key={r.id}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Badge label={r.kind} tone="info" />
                <Muted style={{ fontSize: 12 }}>{formatDate(r.date)}</Muted>
              </Row>
              <Body style={{ fontFamily: fonts.semibold, marginTop: 6 }}>{r.coachName}</Body>
              <Muted>{r.details}</Muted>
              <Row gap={8} style={{ marginTop: 10 }}>
                <Button title="Approve" size="sm" onPress={() => update('requests', r.id, { status: 'Approved' })} style={{ flex: 1 }} />
                <Button title="Decline" size="sm" variant="danger" onPress={() => update('requests', r.id, { status: 'Declined' })} style={{ flex: 1 }} />
              </Row>
            </Card>
          ))}
        </>
      ) : null}

      {/* Members */}
      <Overline>{t('Members ({n})', { n: members.length })}</Overline>
      <Field label="Search members" value={search} onChangeText={setSearch} placeholder="Name or email" />
      {members.map((u) => (
        <Card key={u.id} onPress={() => setEditing(u)}>
          <Row gap={12}>
            <Avatar name={u.fullName} size={40} />
            <View style={{ flex: 1 }}>
              <Body style={{ fontFamily: fonts.semibold }}>{u.fullName}</Body>
              <Muted style={{ fontSize: 12 }} numberOfLines={1}>
                {u.role === 'parent' || u.role === 'student' ? u.studentIds.map(studentName).join(', ') || t('No students linked') : u.email}
              </Muted>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Badge label={u.role} tone={u.role === 'admin' ? 'dark' : 'neutral'} />
              {u.status !== 'approved' ? <Badge label={u.status} tone={statusTone(u.status)} /> : null}
            </View>
          </Row>
        </Card>
      ))}

      <EditMember user={editing} onClose={() => setEditing(null)} students={students.data} selfId={profile!.id} />
    </Screen>
  );
}

function EditMember({
  user,
  onClose,
  students,
  selfId,
}: {
  user: UserProfile | null;
  onClose: () => void;
  students: ReturnType<typeof useStudents>['data'];
  selfId: string;
}) {
  const toast = useToast();
  const [role, setRole] = useState<Role>('parent');
  const [linked, setLinked] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastUser, setLastUser] = useState<string | null>(null);

  // Reset form state whenever a different user is opened.
  if (user && user.id !== lastUser) {
    setLastUser(user.id);
    setRole(user.role);
    setLinked(user.studentIds ?? []);
    setError(null);
  }

  if (!user) return null;
  const isSelf = user.id === selfId;
  const needsStudents = role === 'parent' || role === 'student';

  const save = async () => {
    setError(null);
    if (needsStudents && linked.length === 0) return setError('Link at least one student so they can see their records.');
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        role,
        studentIds: needsStudents ? (role === 'student' ? linked.slice(0, 1) : linked) : [],
        status: 'approved',
      });
      toast(user.status === 'pending' ? 'Account approved' : 'Account updated', user.fullName);
      setLastUser(null);
      onClose();
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      visible={!!user}
      onClose={() => {
        setLastUser(null);
        onClose();
      }}
      title={user.fullName}
      subtitle={`${user.email}${user.phone ? ` · ${user.phone}` : ''}`}
      footer={
        <>
          {!isSelf ? (
            <Button
              title="Remove"
              variant="danger"
              onPress={() =>
                confirm('Remove account?', t('{name} will lose access to the portal. (Their login stays in Firebase Authentication.)', { name: user.fullName }), async () => {
                  await deleteDoc(doc(db, 'users', user.id));
                  setLastUser(null);
                  onClose();
                }, 'Remove')
              }
            />
          ) : null}
          <Button title={user.status === 'pending' ? 'Approve' : 'Save'} onPress={save} loading={saving} disabled={isSelf} style={{ flex: 1 }} />
        </>
      }
    >
      <ErrorNote message={error} />
      {isSelf ? <Muted>{"You can't change your own role."}</Muted> : null}
      <Chips label="Role" options={ROLE_OPTIONS} value={role} onChange={setRole} />
      {needsStudents ? (
        <StudentPicker
          students={students}
          value={linked}
          onChange={setLinked}
          multi={role === 'parent'}
          label={role === 'parent' ? 'Children' : 'Student record'}
        />
      ) : null}
      {user.status === 'rejected' ? <Muted>This request was declined. Saving will approve it.</Muted> : null}
    </Sheet>
  );
}
