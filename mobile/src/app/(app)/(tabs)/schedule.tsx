import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { isAdmin, useAuth } from '@/lib/auth';
import { create, remove, useCollection } from '@/lib/data';
import { DAYS, todayISO } from '@/lib/format';
import { colors, fonts } from '@/lib/theme';
import type { ClassSession, Location } from '@/lib/types';
import { Body, Button, Card, Empty, IconButton, Loading, Muted, Overline, PageHeader, Row, Screen, Title, confirm } from '@/components/ui';
import { FormSheet } from '@/components/form-sheet';
import { useToast } from '@/components/toast';
import { t } from '@/lib/i18n';

export default function Schedule() {
  const { profile } = useAuth();
  const toast = useToast();
  const admin = isAdmin(profile);
  const coach = profile?.role === 'coach';
  const { data, loading } = useCollection<ClassSession>('schedule');
  const locations = useCollection<Location>('locations');
  const [adding, setAdding] = useState(false);
  const [timeOff, setTimeOff] = useState(false);
  const [coverage, setCoverage] = useState<ClassSession | null>(null);

  const byDay = useMemo(() => {
    const groups = new Map<string, ClassSession[]>();
    for (const c of [...data].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.startTime.localeCompare(b.startTime))) {
      groups.set(c.day, [...(groups.get(c.day) ?? []), c]);
    }
    return [...groups.entries()];
  }, [data]);

  const sendRequest = async (kind: 'Time off' | 'Coverage', date: string, details: string) => {
    await create('requests', {
      uid: profile!.id,
      coachName: profile!.fullName,
      kind,
      date,
      details,
      status: 'Pending',
      createdAt: Date.now(),
    });
  };

  const locationOptions = locations.data.length
    ? locations.data.map((l) => ({ value: l.name.replace(/ Branch$/, ''), label: l.name.replace(/ Branch$/, '') }))
    : [
        { value: 'Tabarbour', label: 'Tabarbour' },
        { value: 'North Marka', label: 'North Marka' },
      ];

  return (
    <Screen>
      <PageHeader
        title="Class Schedule"
        subtitle="Weekly training schedule and locations."
        action={
          admin ? (
            <Button title="Add" icon="plus" size="sm" onPress={() => setAdding(true)} />
          ) : coach ? (
            <Button title="Time off" icon="clock" size="sm" variant="outline" onPress={() => setTimeOff(true)} />
          ) : null
        }
      />

      {loading ? (
        <Loading />
      ) : byDay.length === 0 ? (
        <Empty icon="calendar" title="No Schedule Found" message="The class schedule is currently unavailable." />
      ) : (
        byDay.map(([day, classes]) => (
          <View key={day} style={{ gap: 10 }}>
            <Overline>{day}</Overline>
            {classes.map((c) => (
              <Card key={c.id} accent={colors.primary}>
                <Row style={{ alignItems: 'flex-start' }} gap={14}>
                  <View style={{ alignItems: 'center', minWidth: 58 }}>
                    <Body style={{ fontFamily: fonts.display, fontSize: 20 }}>{c.startTime}</Body>
                    <Muted style={{ fontSize: 12 }}>{c.endTime}</Muted>
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Title>{c.className}</Title>
                    <Row gap={6}>
                      <Feather name="map-pin" size={13} color={colors.muted} />
                      <Muted>{c.location}</Muted>
                    </Row>
                    <Row gap={6}>
                      <Feather name="user" size={13} color={colors.muted} />
                      <Muted>{c.coachName}</Muted>
                    </Row>
                    {coach ? (
                      <Button title="Request coverage" size="sm" variant="outline" onPress={() => setCoverage(c)} style={{ alignSelf: 'flex-start', marginTop: 6 }} />
                    ) : null}
                  </View>
                  {admin ? (
                    <IconButton
                      icon="trash-2"
                      label="Delete class"
                      color={colors.muted}
                      onPress={() => confirm('Delete class?', t('{cls} on {day} will be removed.', { cls: t(c.className), day: t(c.day) }), () => remove('schedule', c.id))}
                    />
                  ) : null}
                </Row>
              </Card>
            ))}
          </View>
        ))
      )}

      <FormSheet
        visible={adding}
        onClose={() => setAdding(false)}
        title="Add class"
        submitLabel="Add class"
        fields={[
          { key: 'className', label: 'Class name', placeholder: 'Competition Team' },
          { key: 'day', label: 'Day', type: 'select', options: DAYS.map((d) => ({ value: d, label: d.slice(0, 3) })) },
          { key: 'startTime', label: 'Start time', type: 'time' },
          { key: 'endTime', label: 'End time', type: 'time' },
          { key: 'location', label: 'Location', type: 'select', options: locationOptions },
          { key: 'coachName', label: 'Coach', placeholder: 'Coach Mahmoud' },
        ]}
        onSubmit={async (v) => {
          await create('schedule', v);
          toast('Class added', t('{cls} on {day}.', { cls: v.className, day: t(v.day) }));
        }}
      />

      <FormSheet
        visible={timeOff}
        onClose={() => setTimeOff(false)}
        title="Request time off"
        subtitle="Submit your availability changes for approval."
        submitLabel="Submit request"
        initial={{ date: todayISO() }}
        fields={[
          { key: 'date', label: 'Date', type: 'date' },
          { key: 'details', label: 'Reason', type: 'multiline', placeholder: 'Reason for request...' },
        ]}
        onSubmit={async (v) => {
          await sendRequest('Time off', v.date, v.details);
          toast('Time off requested', t('Your request for {date} has been submitted.', { date: v.date }));
        }}
      />

      <FormSheet
        visible={!!coverage}
        onClose={() => setCoverage(null)}
        title="Manage class coverage"
        subtitle={coverage ? `${t(coverage.className)} · ${t(coverage.day)} ${coverage.startTime}` : undefined}
        submitLabel="Request coverage"
        initial={{ date: todayISO() }}
        fields={[
          { key: 'date', label: 'Date needing cover', type: 'date' },
          { key: 'details', label: 'Notes', type: 'multiline', required: false, placeholder: 'Anything the covering coach should know' },
        ]}
        onSubmit={async (v) => {
          if (!coverage) return;
          await sendRequest('Coverage', v.date, `${coverage.className} (${coverage.day} ${coverage.startTime}, ${coverage.location})${v.details ? ` — ${v.details}` : ''}`);
          toast('Coverage requested', t('Coverage request sent for {cls}.', { cls: t(coverage.className) }));
        }}
      />
    </Screen>
  );
}
