import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isAdmin, isStaff, useAuth } from '@/lib/auth';
import { create, remove, update, useCollection, useScopedCollection, useStudents } from '@/lib/data';
import { daysUntil, formatDate, money } from '@/lib/format';
import { colors, fonts, lh } from '@/lib/theme';
import type { BeltRegistration, BeltTest, Location } from '@/lib/types';
import {
  Avatar,
  Badge,
  Body,
  Button,
  Card,
  Empty,
  IconButton,
  KeyValue,
  Loading,
  Muted,
  Overline,
  PageHeader,
  Row,
  Screen,
  Sheet,
  Title,
  confirm,
  statusTone,
} from '@/components/ui';
import { FormSheet } from '@/components/form-sheet';
import { StudentPicker } from '@/components/student-picker';
import { useToast } from '@/components/toast';
import { t } from '@/lib/i18n';

const regId = (testId: string, studentId: string) => `${testId}_${studentId}`;

function saveRegistration(testId: string, studentId: string, studentName: string) {
  return setDoc(doc(db, 'beltRegistrations', regId(testId, studentId)), {
    testId,
    studentId,
    studentName,
    status: 'Registered',
    createdAt: Date.now(),
  });
}

export default function BeltTests() {
  const { profile } = useAuth();
  const toast = useToast();
  const staff = isStaff(profile);
  const admin = isAdmin(profile);
  const tests = useCollection<BeltTest>('beltTests');
  const locations = useCollection<Location>('locations');
  const registrations = useScopedCollection<BeltRegistration>('beltRegistrations');
  const students = useStudents();

  const [adding, setAdding] = useState(false);
  const [registering, setRegistering] = useState<BeltTest | null>(null);
  const [candidatesFor, setCandidatesFor] = useState<BeltTest | null>(null);
  const [addCandidate, setAddCandidate] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const sorted = useMemo(() => {
    const upcoming = tests.data.filter((t) => daysUntil(t.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
    const past = tests.data.filter((t) => daysUntil(t.date) < 0).sort((a, b) => b.date.localeCompare(a.date));
    return { upcoming, past };
  }, [tests.data]);

  const regsFor = (testId: string) => registrations.data.filter((r) => r.testId === testId);

  const register = (test: BeltTest, studentId: string) =>
    saveRegistration(test.id, studentId, students.data.find((x) => x.id === studentId)?.fullName ?? 'Student');

  const renderTest = (test: BeltTest, past = false) => {
    const days = daysUntil(test.date);
    const regs = regsFor(test.id);
    return (
      <Card key={test.id} style={{ padding: 0, overflow: 'hidden', opacity: past ? 0.6 : 1 }}>
        <Row gap={0} style={{ alignItems: 'stretch' }}>
          <View style={{ width: 92, backgroundColor: past ? '#374151' : colors.black, alignItems: 'center', justifyContent: 'center', padding: 10 }}>
            <Body style={{ color: '#fff', fontFamily: fonts.display, fontSize: 36, lineHeight: lh(38) }}>{past ? '✓' : days}</Body>
            <Overline style={{ fontSize: 9, textAlign: 'center' }}>{past ? 'Done' : 'Days left'}</Overline>
          </View>
          <View style={{ flex: 1, padding: 14, gap: 4 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Badge label={test.registrationStatus} tone={test.registrationStatus.toLowerCase().includes('open') ? 'success' : 'neutral'} />
              {admin ? (
                <IconButton
                  icon="trash-2"
                  label="Delete test"
                  color={colors.muted}
                  onPress={() => confirm('Delete belt test?', test.label, () => remove('beltTests', test.id))}
                />
              ) : null}
            </Row>
            <Title>{test.label}</Title>
            <Muted>
              {formatDate(test.date)} · {t(test.location)}
            </Muted>
            <Muted>{t('Testing fee: {amount}', { amount: money(Number(test.cost)) })}</Muted>

            {!staff && !past
              ? students.data.map((s) => {
                  const reg = regs.find((r) => r.studentId === s.id);
                  return (
                    <Row key={s.id} style={{ marginTop: 8, justifyContent: 'space-between' }}>
                      <Body style={{ fontSize: 13, flex: 1 }} numberOfLines={1}>
                        {s.fullName.split(' ')[0]}
                      </Body>
                      {reg ? (
                        <Badge label={reg.status === 'Paid' ? 'Registered · Paid' : 'Registered · Fee due'} tone={statusTone(reg.status)} />
                      ) : (
                        <Button title="Register" size="sm" onPress={() => setRegistering(test)} />
                      )}
                    </Row>
                  );
                })
              : null}
            {staff ? (
              <Button
                title={t('Candidates ({n})', { n: regs.length })}
                icon="users"
                size="sm"
                variant="outline"
                onPress={() => setCandidatesFor(test)}
                style={{ alignSelf: 'flex-start', marginTop: 8 }}
              />
            ) : null}
          </View>
        </Row>
      </Card>
    );
  };

  const unregistered = registering ? students.data.filter((s) => !regsFor(registering.id).some((r) => r.studentId === s.id)) : [];
  const candidates = candidatesFor ? regsFor(candidatesFor.id) : [];

  return (
    <Screen>
      <PageHeader
        title="Belt Testing"
        subtitle="Upcoming promotion tests and schedules."
        action={admin ? <Button title="Add" icon="plus" size="sm" onPress={() => setAdding(true)} /> : null}
      />

      {tests.loading ? (
        <Loading />
      ) : tests.data.length === 0 ? (
        <Empty icon="award" title="No Upcoming Tests" message="There are no belt tests scheduled at this time." />
      ) : (
        <>
          {sorted.upcoming.map((t) => renderTest(t))}
          {sorted.past.length ? <Overline style={{ color: colors.muted, marginTop: 8 }}>Past tests</Overline> : null}
          {sorted.past.slice(0, 5).map((t) => renderTest(t, true))}
        </>
      )}

      {/* Register (parent/student) */}
      <Sheet
        visible={!!registering}
        onClose={() => setRegistering(null)}
        title="Register for test"
        subtitle={registering?.label}
        footer={<Button title="Done" variant="outline" onPress={() => setRegistering(null)} style={{ flex: 1 }} />}
      >
        {registering ? (
          <>
            <Card style={{ backgroundColor: colors.background, shadowOpacity: 0, elevation: 0 }}>
              <KeyValue label="Date" value={formatDate(registering.date)} />
              <KeyValue label="Location" value={registering.location} />
              <KeyValue label="Testing fee" value={money(Number(registering.cost))} strong />
            </Card>
            <Muted>The testing fee is paid at the front desk; your coach will mark it as paid here.</Muted>
            {unregistered.map((s) => (
              <Row key={s.id} style={{ justifyContent: 'space-between' }}>
                <Body style={{ fontFamily: fonts.semibold }}>{s.fullName}</Body>
                <Button
                  title="Confirm"
                  size="sm"
                  loading={busy}
                  onPress={async () => {
                    setBusy(true);
                    try {
                      await register(registering, s.id);
                      toast('Registered successfully', t('{name} is registered. Please pay the fee at the front desk.', { name: s.fullName }));
                    } catch (e) {
                      toast('Could not register', (e as Error).message, 'error');
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              </Row>
            ))}
            {unregistered.length === 0 ? <Body>Everyone is registered for this test.</Body> : null}
          </>
        ) : null}
      </Sheet>

      {/* Candidates (staff) */}
      <Sheet
        visible={!!candidatesFor}
        onClose={() => {
          setCandidatesFor(null);
          setAddCandidate([]);
        }}
        title="Candidates"
        subtitle={candidatesFor?.label}
        footer={<Button title="Close" onPress={() => setCandidatesFor(null)} style={{ flex: 1 }} />}
      >
        {candidates.length === 0 ? <Muted>No candidates registered yet.</Muted> : null}
        {candidates.map((r) => (
          <Row key={r.id} gap={10}>
            <Avatar name={r.studentName} size={36} />
            <View style={{ flex: 1 }}>
              <Body style={{ fontFamily: fonts.semibold }}>{r.studentName}</Body>
              <Badge label={r.status} tone={statusTone(r.status)} />
            </View>
            {r.status !== 'Paid' ? <Button title="Mark paid" size="sm" variant="outline" onPress={() => update('beltRegistrations', r.id, { status: 'Paid' })} /> : null}
            <IconButton icon="x" label="Remove candidate" color={colors.muted} onPress={() => confirm('Remove candidate?', r.studentName, () => remove('beltRegistrations', r.id), 'Remove')} />
          </Row>
        ))}
        {candidatesFor ? (
          <View style={{ gap: 8, marginTop: 8 }}>
            <Overline>Add candidate</Overline>
            <StudentPicker
              students={students.data.filter((s) => !candidates.some((c) => c.studentId === s.id))}
              value={addCandidate}
              onChange={setAddCandidate}
            />
            <Button
              title="Add candidate"
              size="sm"
              disabled={!addCandidate.length}
              onPress={async () => {
                await register(candidatesFor, addCandidate[0]);
                setAddCandidate([]);
              }}
            />
          </View>
        ) : null}
      </Sheet>

      <FormSheet
        visible={adding}
        onClose={() => setAdding(false)}
        title="Add belt test"
        submitLabel="Add test"
        initial={{ registrationStatus: 'Registration open' }}
        fields={[
          { key: 'label', label: 'Title', placeholder: 'Color Belt Promotion Test' },
          { key: 'date', label: 'Date', type: 'date' },
          {
            key: 'location',
            label: 'Location',
            type: 'select',
            options: (locations.data.length ? locations.data.map((l) => l.name) : ['Tabarbour Branch', 'North Marka Branch']).map((n) => ({ value: n, label: n })),
          },
          { key: 'cost', label: 'Testing fee (JOD)', type: 'number' },
          {
            key: 'registrationStatus',
            label: 'Registration',
            type: 'select',
            options: ['Registration open', 'Upcoming', 'Closed'].map((v) => ({ value: v, label: v })),
          },
        ]}
        onSubmit={async (v) => {
          await create('beltTests', { ...v, cost: Number(v.cost) });
          toast('Belt test added', v.label);
        }}
      />
    </Screen>
  );
}
