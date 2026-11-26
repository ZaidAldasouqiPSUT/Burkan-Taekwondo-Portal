import { useMemo, useState } from 'react';
import { View } from 'react-native';
import type { Student } from '@/lib/types';
import { Chips, Field, Muted } from './ui';
import { t } from '@/lib/i18n';

/** Searchable chip picker for students; single or multi select. */
export function StudentPicker({
  students,
  value,
  onChange,
  multi,
  label = 'Student',
}: {
  students: Student[];
  value: string[];
  onChange: (ids: string[]) => void;
  multi?: boolean;
  label?: string;
}) {
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = needle ? students.filter((s) => s.fullName.toLowerCase().includes(needle)) : students;
    // Always keep selected students visible.
    const selected = students.filter((s) => value.includes(s.id) && !list.includes(s));
    return [...selected, ...list].slice(0, 24);
  }, [students, q, value]);

  return (
    <View style={{ gap: 8 }}>
      {students.length > 8 ? <Field label={`${label} search`} value={q} onChangeText={setQ} placeholder="Type a name..." /> : null}
      {students.length === 0 ? (
        <Muted>No students yet. An admin can add them from the Students screen.</Muted>
      ) : (
        <Chips
          label={students.length > 8 ? undefined : label}
          multi
          options={shown.map((s) => ({ value: s.id, label: s.fullName }))}
          value={value}
          onChange={(id) => {
            if (!multi) return onChange([id]);
            onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
          }}
        />
      )}
      {multi && students.length > 1 ? (
        <Muted
          style={{ alignSelf: 'flex-start' }}
          // Quick select all / none.
        >
          {t('{n} selected', { n: value.length })}
        </Muted>
      ) : null}
    </View>
  );
}
