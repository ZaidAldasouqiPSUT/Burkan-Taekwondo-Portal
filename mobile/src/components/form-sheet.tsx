import { useState, type ReactNode } from 'react';
import { Button, Chips, ErrorNote, Field, Sheet } from './ui';
import { isISODate, isTime } from '@/lib/format';
import { friendlyAuthError } from '@/lib/auth';
import { t } from '@/lib/i18n';

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'multiline' | 'date' | 'time' | 'select' | 'email' | 'phone';
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
  required?: boolean;
}

export type FormValues = Record<string, string>;

export function FormSheet({
  visible,
  onClose,
  title,
  subtitle,
  fields,
  initial,
  submitLabel = 'Save',
  onSubmit,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields: FieldDef[];
  initial?: FormValues;
  submitLabel?: string;
  onSubmit: (values: FormValues) => Promise<void> | void;
  /** Extra controls rendered above the fields (e.g. a student picker). */
  children?: ReactNode;
}) {
  const [values, setValues] = useState<FormValues>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset the form each time the sheet opens.
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      const start: FormValues = {};
      for (const f of fields) start[f.key] = initial?.[f.key] ?? (f.type === 'select' ? (f.options?.[0]?.value ?? '') : '');
      setValues(start);
      setError(null);
    }
  }

  const set = (key: string, v: string) => setValues((prev) => ({ ...prev, [key]: v }));

  const submit = async () => {
    for (const f of fields) {
      const v = (values[f.key] ?? '').trim();
      if (f.required !== false && !v) return setError(t('{field} is required.', { field: t(f.label) }));
      if (v && f.type === 'date' && !isISODate(v)) return setError(t('{field} must look like 2026-10-17.', { field: t(f.label) }));
      if (v && f.type === 'time' && !isTime(v)) return setError(t('{field} must look like 18:30.', { field: t(f.label) }));
      if (v && f.type === 'number' && Number.isNaN(Number(v))) return setError(t('{field} must be a number.', { field: t(f.label) }));
    }
    setSaving(true);
    setError(null);
    try {
      const trimmed: FormValues = {};
      for (const f of fields) trimmed[f.key] = (values[f.key] ?? '').trim();
      await onSubmit(trimmed);
      onClose();
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      footer={
        <>
          <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1 }} />
          <Button title={submitLabel} onPress={submit} loading={saving} style={{ flex: 1 }} />
        </>
      }
    >
      <ErrorNote message={error} />
      {children}
      {fields.map((f) =>
        f.type === 'select' ? (
          <Chips key={f.key} label={f.label} options={f.options ?? []} value={values[f.key] ?? ''} onChange={(v) => set(f.key, v)} />
        ) : (
          <Field
            key={f.key}
            label={t(f.label) + (f.required === false ? ` ${t('(optional)')}` : '')}
            value={values[f.key] ?? ''}
            onChangeText={(t) => set(f.key, t)}
            placeholder={f.placeholder ?? (f.type === 'date' ? 'YYYY-MM-DD' : f.type === 'time' ? 'HH:MM' : undefined)}
            hint={f.hint}
            multiline={f.type === 'multiline'}
            keyboardType={
              f.type === 'number'
                ? 'decimal-pad'
                : f.type === 'email'
                  ? 'email-address'
                  : f.type === 'phone'
                    ? 'phone-pad'
                    : f.type === 'date' || f.type === 'time'
                      ? 'numbers-and-punctuation'
                      : 'default'
            }
            autoCapitalize={f.type === 'email' ? 'none' : 'sentences'}
          />
        ),
      )}
    </Sheet>
  );
}
