import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { isAdmin, isStaff, useAuth } from '@/lib/auth';
import { create, remove, update, useScopedCollection, useStudents } from '@/lib/data';
import { formatDate, todayISO } from '@/lib/format';
import { colors } from '@/lib/theme';
import type { Feedback as FeedbackItem } from '@/lib/types';
import {
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
  PageHeader,
  Row,
  Screen,
  Sheet,
  Title,
  confirm,
} from '@/components/ui';
import { StudentPicker } from '@/components/student-picker';
import { useToast } from '@/components/toast';
import { t } from '@/lib/i18n';

const CATEGORIES = [
  { value: 'Technical', label: 'Technical' },
  { value: 'Behavior', label: 'Behavior / Discipline' },
  { value: 'Tournament', label: 'Tournament Review' },
  { value: 'General', label: 'General Progress' },
];

export default function Feedback() {
  const { profile } = useAuth();
  const staff = isStaff(profile);
  const toast = useToast();
  const { data, loading } = useScopedCollection<FeedbackItem>('feedback');
  const students = useStudents();

  const [composeOpen, setComposeOpen] = useState(false);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [category, setCategory] = useState('Technical');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<FeedbackItem | null>(null);

  const items = useMemo(() => [...data].sort((a, b) => b.date.localeCompare(a.date)), [data]);

  const send = async () => {
    setError(null);
    const studentId = studentIds[0];
    if (!studentId || !title.trim() || !message.trim()) return setError('Choose a student and fill in the title and message.');
    setSending(true);
    try {
      const s = students.data.find((x) => x.id === studentId);
      await create('feedback', {
        studentId,
        studentName: s?.fullName ?? 'Student',
        coachName: profile!.fullName,
        date: todayISO(),
        category,
        title: title.trim(),
        message: message.trim(),
        read: false,
      });
      toast('Feedback sent', 'Your message has been sent successfully.');
      setComposeOpen(false);
      setTitle('');
      setMessage('');
      setStudentIds([]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const open = (item: FeedbackItem) => {
    setSelected(item);
    if (!item.read && !staff) update('feedback', item.id, { read: true }).catch(() => {});
  };

  return (
    <Screen>
      <PageHeader
        title="Coach Feedback"
        subtitle="Direct evaluations and progress notes."
        action={staff ? <Button title="New" icon="plus" size="sm" onPress={() => setComposeOpen(true)} /> : null}
      />

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty icon="message-square" title="No Feedback Yet" message="Feedback from coaches will appear here." />
      ) : (
        items.map((item) => {
          const unread = !item.read && !staff;
          return (
            <Card key={item.id} onPress={() => open(item)} accent={unread ? colors.primary : 'transparent'} style={unread ? { backgroundColor: '#FFF7F8' } : undefined}>
              <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                <Row gap={6}>
                  <Badge label={item.category} tone="neutral" />
                  {unread ? <Badge label="New" tone="primary" /> : null}
                  {staff && item.read ? <Badge label="Read" tone="success" /> : null}
                </Row>
                <Muted style={{ fontSize: 12 }}>{formatDate(item.date)}</Muted>
              </Row>
              <Title style={unread ? { color: colors.primary } : undefined}>{item.title}</Title>
              <Muted numberOfLines={2} style={{ marginTop: 4 }}>
                {item.message}
              </Muted>
              <Muted style={{ marginTop: 8, fontSize: 12 }}>{staff ? t('To: {name}', { name: item.studentName }) : t('From: {name}', { name: t(item.coachName) })}</Muted>
            </Card>
          );
        })
      )}

      <Sheet
        visible={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="New feedback"
        subtitle="Send progress updates or disciplinary notes to students."
        footer={
          <>
            <Button title="Cancel" variant="outline" onPress={() => setComposeOpen(false)} style={{ flex: 1 }} />
            <Button title="Send" icon="send" onPress={send} loading={sending} style={{ flex: 1 }} />
          </>
        }
      >
        <ErrorNote message={error} />
        <StudentPicker students={students.data} value={studentIds} onChange={setStudentIds} />
        <Chips label="Category" options={CATEGORIES} value={category} onChange={setCategory} />
        <Field label="Title" value={title} onChangeText={setTitle} placeholder="Performance update title" />
        <Field label="Message" value={message} onChangeText={setMessage} multiline placeholder="Detailed feedback..." />
      </Sheet>

      <Sheet
        visible={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ''}
        subtitle={selected ? `${staff ? t('To: {name}', { name: selected.studentName }) : t('From: {name}', { name: t(selected.coachName) })} · ${formatDate(selected.date)}` : undefined}
        footer={
          <>
            {selected && isAdmin(profile) ? (
              <Button
                title="Delete"
                variant="danger"
                onPress={() =>
                  confirm('Delete feedback?', 'This cannot be undone.', () => {
                    remove('feedback', selected.id);
                    setSelected(null);
                  })
                }
                style={{ flex: 1 }}
              />
            ) : null}
            <Button title="Close" onPress={() => setSelected(null)} style={{ flex: 1 }} />
          </>
        }
      >
        {selected ? (
          <View style={{ gap: 12 }}>
            <Badge label={selected.category} />
            <Body style={{ fontSize: 16, lineHeight: 25 }}>{selected.message}</Body>
          </View>
        ) : null}
      </Sheet>
    </Screen>
  );
}
