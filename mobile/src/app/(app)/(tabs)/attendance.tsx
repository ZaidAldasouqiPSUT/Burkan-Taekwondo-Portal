import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isStaff, useAuth } from '@/lib/auth';
import { remove, useCollection, useScopedCollection, useStudents } from '@/lib/data';
import { attendanceRate, formatDate, isISODate, todayISO } from '@/lib/format';
import { colors, fonts, lh } from '@/lib/theme';
import type { AttendanceRecord, ClassSession } from '@/lib/types';
import {
  Badge,
  Body,
  Button,
  Card,
  Chips,
  Empty,
  ErrorNote,
  Field,
  IconButton,
  Loading,
  Muted,
  Overline,
  PageHeader,
  Row,
  Screen,
  Title,
  confirm,
  statusTone,
} from '@/components/ui';
import { StudentPicker } from '@/components/student-picker';
import { useToast } from '@/components/toast';
import { t } from '@/lib/i18n';

const STATUSES = ['Present', 'Late', 'Absent', 'Excused'] as const;
const DEFAULT_CLASSES = ['Beginners TKD', 'Advanced Poomsae', 'Sparring Team'];

export default function Attendance() {
  const { profile } = useAuth();
  const staff = isStaff(profile);
  const toast = useToast();
  const records = useScopedCollection<AttendanceRecord>('attendance');
  const students = useStudents();
  const schedule = useCollection<ClassSession>('schedule', staff);

  const [selected, setSelected] = useState<string[]>([]);
  const [className, setClassName] = useState('');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('Present');
  const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const classOptions = useMemo(() => {
    const names = [...new Set(schedule.data.map((c) => c.className))];
    return (names.length ? names : DEFAULT_CLASSES).map((n) => ({ value: n, label: n }));
  }, [schedule.data]);
  const currentClass = className || classOptions[0]?.value || '';

  const history = useMemo(() => {
    const list = filter === 'all' ? records.data : records.data.filter((r) => r.studentId === filter);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [records.data, filter]);
  const rate = attendanceRate(history);

  const submit = async () => {
    setError(null);
    if (!selected.length) return setError('Select at least one student.');
    if (!isISODate(date)) return setError('Date must look like 2026-10-17.');
    setSaving(true);
    try {
      const batch = writeBatch(db);
      for (const id of selected) {
        const s = students.data.find((x) => x.id === id);
        batch.set(doc(collection(db, 'attendance')), {
          studentId: id,
          studentName: s?.fullName ?? 'Student',
          date,
          status,
          className: currentClass,
          markedBy: profile!.fullName,
        });
      }
      await batch.commit();
      toast('Attendance recorded', t('{n} student(s) marked {status}.', { n: selected.length, status: t(status) }));
      setSelected([]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <PageHeader title="Attendance" subtitle="Track classes and training history." />

      {staff ? (
        <Card style={{ gap: 14 }}>
          <View>
            <Title style={{ textTransform: 'uppercase' }}>Record attendance</Title>
            <Muted>{"Mark presence for today's classes. Select several students at once."}</Muted>
          </View>
          <ErrorNote message={error} />
          <StudentPicker students={students.data} value={selected} onChange={setSelected} multi label="Students" />
          <Chips label="Class" options={classOptions} value={currentClass} onChange={setClassName} />
          <Chips label="Status" options={STATUSES.map((s) => ({ value: s, label: s }))} value={status} onChange={setStatus} />
          <Field label="Date" value={date} onChangeText={setDate} keyboardType="numbers-and-punctuation" />
          <Button title="Save record" icon="check" onPress={submit} loading={saving} />
        </Card>
      ) : null}

      {students.data.length > 1 ? (
        <Chips
          options={[{ value: 'all', label: 'All' }, ...students.data.map((s) => ({ value: s.id, label: s.fullName.split(' ')[0] }))]}
          value={filter}
          onChange={setFilter}
        />
      ) : null}

      <Card style={{ gap: 4 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <Title>Recent history</Title>
            <Muted>{staff ? 'Latest training sessions' : 'Your latest training sessions'}</Muted>
          </View>
          {rate !== null ? (
            <View style={{ alignItems: 'flex-end' }}>
              <Body style={{ fontFamily: fonts.display, fontSize: 26, color: colors.success }}>{rate}%</Body>
              <Overline style={{ color: colors.muted, fontSize: 9 }}>Attendance</Overline>
            </View>
          ) : null}
        </Row>
      </Card>

      {records.loading ? (
        <Loading />
      ) : history.length === 0 ? (
        <Empty icon="check-square" title="No records yet" message="No attendance records found." />
      ) : (
        history.slice(0, 100).map((r) => (
          <Card key={r.id}>
            <Row gap={12}>
              <View style={{ width: 52, alignItems: 'center' }}>
                <Body style={{ fontFamily: fonts.display, fontSize: 22, lineHeight: lh(24) }}>{r.date.slice(8, 10)}</Body>
                <Muted style={{ fontSize: 11, textTransform: 'uppercase' }}>{formatDate(r.date).split(' ')[1]}</Muted>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Body style={{ fontFamily: fonts.semibold }}>{r.className}</Body>
                {staff || students.data.length > 1 ? <Muted>{r.studentName}</Muted> : null}
                <Muted style={{ fontSize: 12 }}>{t('Marked by {name}', { name: t(r.markedBy) })}</Muted>
              </View>
              <Badge label={r.status} tone={statusTone(r.status)} />
              {staff ? (
                <IconButton
                  icon="trash-2"
                  label="Delete record"
                  color={colors.muted}
                  onPress={() => confirm('Delete record?', `${r.studentName} · ${r.date}`, () => remove('attendance', r.id))}
                />
              ) : null}
            </Row>
          </Card>
        ))
      )}
    </Screen>
  );
}
