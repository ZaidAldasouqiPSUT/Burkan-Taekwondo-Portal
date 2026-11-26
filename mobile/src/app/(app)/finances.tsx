import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { isAdmin, useAuth } from '@/lib/auth';
import { create, remove, update, useScopedCollection, useStudents } from '@/lib/data';
import { formatDate, formatTimestamp, money, todayISO } from '@/lib/format';
import { colors, fonts, lh } from '@/lib/theme';
import type { FinancialRecord } from '@/lib/types';
import {
  Badge,
  Body,
  Button,
  Card,
  Chips,
  Empty,
  IconButton,
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
import { FormSheet } from '@/components/form-sheet';
import { StudentPicker } from '@/components/student-picker';
import { useToast } from '@/components/toast';
import { t } from '@/lib/i18n';

export default function Finances() {
  const { profile } = useAuth();
  const toast = useToast();
  const admin = isAdmin(profile);
  const coach = profile?.role === 'coach';
  const { data, loading } = useScopedCollection<FinancialRecord>('finances', !coach);
  const students = useStudents();
  const [filter, setFilter] = useState<'all' | 'Due' | 'Paid'>('all');
  const [payOpen, setPayOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [chargeStudent, setChargeStudent] = useState<string[]>([]);

  const records = useMemo(
    () => [...data].filter((r) => filter === 'all' || r.status === filter).sort((a, b) => b.timestamp - a.timestamp),
    [data, filter],
  );
  const due = data.filter((r) => r.status === 'Due');
  const balance = due.reduce((s, r) => s + Number(r.amount || 0), 0);

  if (coach) return <Restricted message="Financial records are restricted to Parents, Students, and Admins." />;

  return (
    <Screen>
      <PageHeader
        title="Financial Ledger"
        subtitle="Dues, testing fees, and payment history."
        action={admin ? <Button title="Charge" icon="plus" size="sm" onPress={() => setAdding(true)} /> : null}
      />

      <Card style={{ backgroundColor: colors.black, gap: 6 }}>
        <Overline style={{ color: '#9CA3AF' }}>{admin ? 'Outstanding across club' : 'Outstanding balance'}</Overline>
        <Body style={{ color: balance ? colors.primary : '#4ADE80', fontFamily: fonts.display, fontSize: 40, lineHeight: lh(44) }}>{money(balance)}</Body>
        <Muted style={{ color: '#9CA3AF' }}>{due.length ? t('{n} open item(s)', { n: due.length }) : t('You are all paid up. Thank you!')}</Muted>
        {!admin && balance > 0 ? <Button title="How to pay" icon="credit-card" onPress={() => setPayOpen(true)} style={{ marginTop: 8 }} /> : null}
      </Card>

      <Chips
        options={[
          { value: 'all', label: 'All' },
          { value: 'Due', label: 'Due' },
          { value: 'Paid', label: 'Paid' },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {loading ? (
        <Loading />
      ) : records.length === 0 ? (
        <Empty icon="credit-card" title="No records" message="No financial records found." />
      ) : (
        records.map((r) => (
          <Card key={r.id} accent={r.status === 'Due' ? colors.primary : colors.success}>
            <Row style={{ alignItems: 'flex-start' }} gap={10}>
              <View style={{ flex: 1, gap: 2 }}>
                <Row gap={6}>
                  <Badge label={r.type} />
                  <Badge label={r.status} tone={statusTone(r.status)} />
                </Row>
                <Title style={{ marginTop: 6 }}>{r.description}</Title>
                <Muted>{r.studentName}</Muted>
                <Muted style={{ fontSize: 12 }}>
                  {formatTimestamp(r.timestamp)}
                  {r.status === 'Due' && r.dueDate ? t(' · due {date}', { date: formatDate(r.dueDate) }) : ''}
                </Muted>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Body style={{ fontFamily: fonts.display, fontSize: 20 }}>{money(Number(r.amount))}</Body>
                {admin && r.status === 'Due' ? (
                  <Button
                    title="Mark paid"
                    size="sm"
                    variant="outline"
                    onPress={async () => {
                      await update('finances', r.id, { status: 'Paid', timestamp: Date.now() });
                      toast('Payment recorded', `${r.studentName} · ${money(Number(r.amount))}`);
                    }}
                  />
                ) : null}
                {admin ? (
                  <IconButton icon="trash-2" label="Delete record" color={colors.muted} onPress={() => confirm('Delete record?', r.description, () => remove('finances', r.id))} />
                ) : null}
              </View>
            </Row>
          </Card>
        ))
      )}

      <Sheet
        visible={payOpen}
        onClose={() => setPayOpen(false)}
        title="Make a payment"
        subtitle={t('Total due: {amount}', { amount: money(balance) })}
        footer={<Button title="Got it" onPress={() => setPayOpen(false)} style={{ flex: 1 }} />}
      >
        <Body>Payments are made at the front desk of either branch (cash, card, or CliQ). The admin records it and this ledger updates automatically.</Body>
        {due.map((r) => (
          <Row key={r.id} style={{ justifyContent: 'space-between' }}>
            <Muted style={{ flex: 1 }}>
              {r.studentName} · {r.description}
            </Muted>
            <Body style={{ fontFamily: fonts.bold }}>{money(Number(r.amount))}</Body>
          </Row>
        ))}
      </Sheet>

      <FormSheet
        visible={adding}
        onClose={() => {
          setAdding(false);
          setChargeStudent([]);
        }}
        title="New charge or payment"
        submitLabel="Save"
        initial={{ dueDate: todayISO() }}
        fields={[
          { key: 'type', label: 'Type', type: 'select', options: ['Membership', 'Belt Test', 'Product', 'Tournament', 'Other'].map((v) => ({ value: v, label: v })) },
          { key: 'description', label: 'Description', placeholder: 'November Competition Program' },
          { key: 'amount', label: 'Amount (JOD)', type: 'number' },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: 'Due', label: 'Due' },
              { value: 'Paid', label: 'Paid' },
            ],
          },
          { key: 'dueDate', label: 'Due date', type: 'date', required: false },
        ]}
        onSubmit={async (v) => {
          const studentId = chargeStudent[0];
          if (!studentId) throw new Error('Choose a student.');
          const s = students.data.find((x) => x.id === studentId);
          await create('finances', {
            studentId,
            studentName: s?.fullName ?? 'Student',
            type: v.type,
            description: v.description,
            amount: Number(v.amount),
            status: v.status,
            timestamp: Date.now(),
            dueDate: v.status === 'Due' ? v.dueDate || todayISO() : null,
          });
          toast('Record saved', `${s?.fullName} · ${money(Number(v.amount))}`);
          setChargeStudent([]);
        }}
      >
        <StudentPicker students={students.data} value={chargeStudent} onChange={setChargeStudent} />
      </FormSheet>
    </Screen>
  );
}

