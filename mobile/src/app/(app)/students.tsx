import { useMemo, useState } from 'react';
import { Share, View } from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { isAdmin, isStaff, useAuth } from '@/lib/auth';
import { createStudent, deleteStudent, regenerateStudentCode, update, useCollection, useScopedCollection, useStudents } from '@/lib/data';
import { attendanceRate, formatDate, money } from '@/lib/format';
import { BELTS, colors, fonts } from '@/lib/theme';
import type { AttendanceRecord, BeltRegistration, BeltTest, FinancialRecord, Student } from '@/lib/types';
import {
  Avatar,
  Badge,
  Body,
  Button,
  Card,
  Empty,
  Field,
  KeyValue,
  Loading,
  Muted,
  Overline,
  PageHeader,
  Restricted,
  Row,
  Screen,
  Sheet,
  Title,
  confirm,
  statusTone,
} from '@/components/ui';
import { FormSheet, type FormValues } from '@/components/form-sheet';
import { useToast } from '@/components/toast';
import { t } from '@/lib/i18n';

const beltOptions = BELTS.map((b) => ({ value: b.label, label: b.label.replace(' Belt', '').replace('Black · ', 'Black ') }));
const beltColor = (label: string) => BELTS.find((b) => b.label === label)?.color ?? '#9CA3AF';
const avatarColor = (c: string) => (c === '#E5E7EB' ? '#9CA3AF' : c);

export default function Students() {
  const { profile } = useAuth();
  const toast = useToast();
  const staff = isStaff(profile);
  const admin = isAdmin(profile);
  const students = useStudents();
  const attendance = useScopedCollection<AttendanceRecord>('attendance');
  const finances = useScopedCollection<FinancialRecord>('finances', profile?.role !== 'coach');
  const registrations = useScopedCollection<BeltRegistration>('beltRegistrations');
  const tests = useCollection<BeltTest>('beltTests');

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<{ mode: 'add' | 'edit'; student?: Student } | null>(null);
  const [beltEdit, setBeltEdit] = useState<Student | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? students.data.filter((s) => s.fullName.toLowerCase().includes(q) || s.belt.toLowerCase().includes(q)) : students.data;
  }, [students.data, search]);

  const stats = (id: string) => {
    const recs = attendance.data.filter((r) => r.studentId === id);
    const due = finances.data.filter((f) => f.studentId === id && f.status === 'Due').reduce((s, f) => s + Number(f.amount || 0), 0);
    const regTestIds = registrations.data.filter((r) => r.studentId === id).map((r) => r.testId);
    const nextTest = tests.data
      .filter((t) => regTestIds.includes(t.id))
      .sort((a, b) => a.date.localeCompare(b.date))
      .find((t) => t.date >= new Date().toISOString().slice(0, 10));
    return { rate: attendanceRate(recs), sessions: recs.length, due, nextTest };
  };

  if (profile?.role === 'student') {
    return <Restricted message="Students cannot view the roster." />;
  }

  const selected = students.data.find((s) => s.id === selectedId) ?? null;
  const sel = selected ? stats(selected.id) : null;

  const shareCode = async (s: Student) => {
    await Share.share({
      message: t('Burkan Taekwondo portal: download the Burkan TKD app, tap "Create an account" and enter join code {code} to link {name}.', { code: s.joinCode, name: s.fullName }),
    });
  };

  const saveStudent = async (v: FormValues) => {
    const data = {
      fullName: v.fullName,
      belt: v.belt,
      beltColor: beltColor(v.belt),
      membership: v.membership,
      status: v.status as Student['status'],
    };
    if (form?.mode === 'edit' && form.student) {
      await update('students', form.student.id, data);
      toast('Student updated', data.fullName);
    } else {
      const { joinCode } = await createStudent(data);
      toast('Student added', t('Join code: {code}', { code: joinCode }));
    }
  };

  return (
    <Screen>
      <PageHeader
        title="Roster & Profiles"
        subtitle={profile?.role === 'parent' ? "Your children's profiles" : 'Student roster and details'}
        action={admin ? <Button title="Add" icon="user-plus" size="sm" onPress={() => setForm({ mode: 'add' })} /> : null}
      />
      {staff ? <Field label="Search" value={search} onChangeText={setSearch} placeholder="Search by name or belt..." /> : null}

      {students.loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty
          icon="users"
          title="No Students Found"
          message={profile?.role === 'parent' ? 'Link your child from Settings using their join code.' : admin ? 'Tap Add to create your first student.' : 'Try adjusting your search.'}
        />
      ) : (
        filtered.map((s) => {
          const st = stats(s.id);
          return (
            <Card key={s.id} onPress={() => setSelectedId(s.id)}>
              <Row gap={12}>
                <Avatar name={s.fullName} color={avatarColor(s.beltColor)} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Title numberOfLines={1}>{s.fullName}</Title>
                  <Row gap={6}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.beltColor, borderWidth: 1, borderColor: colors.border }} />
                    <Muted>{t(s.belt)}</Muted>
                  </Row>
                </View>
                <Badge label={s.status} tone={statusTone(s.status)} />
              </Row>
              <Row style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }} gap={0}>
                <View style={{ flex: 1 }}>
                  <Muted style={{ fontSize: 11 }}>Attendance</Muted>
                  <Body style={{ fontFamily: fonts.bold }}>{st.rate === null ? '—' : `${st.rate}%`}</Body>
                </View>
                <View style={{ flex: 1 }}>
                  <Muted style={{ fontSize: 11 }}>Next test</Muted>
                  <Body style={{ fontFamily: fonts.bold }}>{st.nextTest ? formatDate(st.nextTest.date) : '—'}</Body>
                </View>
                {profile?.role !== 'coach' ? (
                  <View style={{ flex: 1 }}>
                    <Muted style={{ fontSize: 11 }}>Balance</Muted>
                    <Body style={{ fontFamily: fonts.bold, color: st.due ? colors.primary : colors.success }}>{st.due ? money(st.due) : t('Paid')}</Body>
                  </View>
                ) : null}
              </Row>
            </Card>
          );
        })
      )}

      {profile?.role === 'parent' ? (
        <Card style={{ backgroundColor: colors.infoSoft, shadowOpacity: 0, elevation: 0 }}>
          <Body style={{ fontFamily: fonts.bold, marginBottom: 2 }}>Name corrections</Body>
          <Muted>Names must match official federation records. Contact the front desk or your head coach for spelling corrections.</Muted>
        </Card>
      ) : null}

      {/* Profile */}
      <Sheet
        visible={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.fullName ?? ''}
        subtitle="Student profile overview"
        footer={<Button title="Close profile" onPress={() => setSelectedId(null)} style={{ flex: 1 }} />}
      >
        {selected && sel ? (
          <>
            <Card style={{ backgroundColor: colors.background, shadowOpacity: 0, elevation: 0 }}>
              <KeyValue label="Current rank" value={t(selected.belt)} />
              <KeyValue label="Membership" value={t(selected.membership)} />
              <KeyValue label="Next test" value={sel.nextTest ? `${t(sel.nextTest.label)} · ${formatDate(sel.nextTest.date)}` : t('Not registered')} />
              <KeyValue label="Attendance" value={sel.rate === null ? t('No sessions yet') : t('{rate}% of {n} sessions', { rate: sel.rate, n: sel.sessions })} />
            </Card>
            {profile?.role !== 'coach' ? (
              <Card style={{ backgroundColor: sel.due ? colors.primarySoft : colors.successSoft, shadowOpacity: 0, elevation: 0 }}>
                <Overline style={{ color: sel.due ? colors.primary : colors.success }}>Financial status</Overline>
                <Row style={{ justifyContent: 'space-between', marginTop: 4 }}>
                  <Body style={{ fontFamily: fonts.bold }}>{sel.due ? t('{amount} due', { amount: money(sel.due) }) : t('All paid')}</Body>
                  {sel.due ? (
                    <Button
                      title="View ledger"
                      size="sm"
                      variant="ghost"
                      onPress={() => {
                        setSelectedId(null);
                        router.push('/finances');
                      }}
                    />
                  ) : null}
                </Row>
              </Card>
            ) : null}
            {admin ? (
              <Card style={{ backgroundColor: '#111', shadowOpacity: 0, elevation: 0, gap: 8 }}>
                <Overline>Join code</Overline>
                <Body style={{ color: '#fff', fontFamily: fonts.display, fontSize: 34, letterSpacing: 6 }}>{selected.joinCode}</Body>
                <Muted style={{ color: '#9CA3AF' }}>
                  Give this to the student or parent. Signing up with it gives instant, approved access linked to this student — no manual approval needed.
                </Muted>
                <Row gap={8} style={{ flexWrap: 'wrap' }}>
                  <Button
                    title="Copy"
                    icon="copy"
                    size="sm"
                    variant="light"
                    onPress={async () => {
                      await Clipboard.setStringAsync(selected.joinCode);
                      toast('Copied', selected.joinCode);
                    }}
                  />
                  <Button title="Share" icon="share-2" size="sm" variant="light" onPress={() => shareCode(selected)} />
                  <Button
                    title="New code"
                    icon="refresh-cw"
                    size="sm"
                    variant="light"
                    onPress={() =>
                      confirm('Replace join code?', 'The old code will stop working. Existing linked accounts are not affected.', async () => {
                        const code = await regenerateStudentCode(selected);
                        toast('New code created', code);
                      }, 'Replace')
                    }
                  />
                </Row>
              </Card>
            ) : null}
            {staff ? (
              <Row gap={8} style={{ flexWrap: 'wrap' }}>
                <Button title="Promote / belt" icon="award" size="sm" variant="outline" onPress={() => setBeltEdit(selected)} />
                {admin ? (
                  <>
                    <Button title="Edit" icon="edit-2" size="sm" variant="outline" onPress={() => setForm({ mode: 'edit', student: selected })} />
                    <Button
                      title="Delete"
                      icon="trash-2"
                      size="sm"
                      variant="danger"
                      onPress={() =>
                        confirm('Delete student?', t('{name} will be removed. Their history records stay in the database.', { name: selected.fullName }), async () => {
                          setSelectedId(null);
                          await deleteStudent(selected);
                        })
                      }
                    />
                  </>
                ) : null}
              </Row>
            ) : null}
          </>
        ) : null}
      </Sheet>

      <FormSheet
        visible={!!form}
        onClose={() => setForm(null)}
        title={form?.mode === 'edit' ? 'Edit student' : 'Add student'}
        subtitle={form?.mode === 'add' ? 'A join code is generated automatically.' : undefined}
        submitLabel={form?.mode === 'edit' ? 'Save' : 'Add student'}
        initial={
          form?.student
            ? { fullName: form.student.fullName, belt: form.student.belt, membership: form.student.membership, status: form.student.status }
            : { membership: 'Regular Program' }
        }
        fields={[
          { key: 'fullName', label: 'Full name (official)', placeholder: 'First Last' },
          { key: 'belt', label: 'Belt', type: 'select', options: beltOptions },
          { key: 'membership', label: 'Membership / program', placeholder: 'Competition Program' },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ],
          },
        ]}
        onSubmit={saveStudent}
      />

      <FormSheet
        visible={!!beltEdit}
        onClose={() => setBeltEdit(null)}
        title="Update belt"
        subtitle={beltEdit?.fullName}
        initial={beltEdit ? { belt: beltEdit.belt } : undefined}
        fields={[{ key: 'belt', label: 'Belt', type: 'select', options: beltOptions }]}
        onSubmit={async (v) => {
          if (!beltEdit) return;
          await update('students', beltEdit.id, { belt: v.belt, beltColor: beltColor(v.belt) });
          toast('Belt updated', `${beltEdit.fullName} · ${t(v.belt)}`);
        }}
      />
    </Screen>
  );
}
