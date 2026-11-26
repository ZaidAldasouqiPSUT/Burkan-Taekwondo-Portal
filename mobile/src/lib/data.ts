import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentReference,
  type Query,
} from 'firebase/firestore';
import { db } from './firebase';
import { isStaff, useAuth } from './auth';
import type { Student } from './types';

type Source = Query<DocumentData> | DocumentReference<DocumentData>;

export interface LiveList<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

const isDocRef = (s: Source): s is DocumentReference<DocumentData> => s.type === 'document';

/** Subscribes to one or more Firestore sources and merges the results by document id. */
const LOADING: LiveList<never> = { data: [], loading: true, error: null };
const EMPTY: LiveList<never> = { data: [], loading: false, error: null };

function useLiveList<T extends { id: string }>(sources: Source[] | null, key: string): LiveList<T> {
  const [state, setState] = useState<LiveList<T> & { key: string }>({ ...LOADING, key: '' });

  useEffect(() => {
    if (!sources || sources.length === 0) return;
    const parts = new Map<number, T[]>();
    let error: string | null = null;
    const emit = () => {
      if (parts.size < sources.length) return;
      const byId = new Map<string, T>();
      for (const list of parts.values()) for (const item of list) byId.set(item.id, item);
      setState({ data: [...byId.values()], loading: false, error, key });
    };
    const onError = (i: number) => (e: Error) => {
      error = e.message;
      parts.set(i, []);
      emit();
    };
    const unsubs = sources.map((src, i) =>
      isDocRef(src)
        ? onSnapshot(
            src,
            (snap) => {
              parts.set(i, snap.exists() ? [{ id: snap.id, ...snap.data() } as T] : []);
              emit();
            },
            onError(i),
          )
        : onSnapshot(
            src,
            (snap) => {
              parts.set(i, snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
              emit();
            },
            onError(i),
          ),
    );
    return () => unsubs.forEach((u) => u());
    // `key` captures everything `sources` is built from.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!sources) return LOADING;
  if (sources.length === 0) return EMPTY;
  // Results from a previous key are stale until the new subscription reports.
  return state.key === key ? state : LOADING;
}

/** Whole collection, readable by any approved member (schedule, news, belt tests, locations). */
export function useCollection<T extends { id: string }>(name: string, enabled = true): LiveList<T> {
  const { profile } = useAuth();
  const ready = enabled && profile?.status === 'approved';
  const key = `${name}|${ready}`;
  const sources = useMemo(() => (ready ? [collection(db, name)] : null), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const result = useLiveList<T>(sources, key);
  return enabled ? result : EMPTY;
}

/**
 * Records tied to a student (attendance, feedback, finances, belt registrations).
 * Staff see everything; parents/students only see their linked students — matching firestore.rules.
 */
export function useScopedCollection<T extends { id: string }>(name: string, enabled = true): LiveList<T> {
  const { profile } = useAuth();
  const staff = isStaff(profile);
  const ids = profile?.studentIds ?? [];
  const ready = enabled && profile?.status === 'approved';
  const key = `${name}|${ready}|${staff}|${ids.join(',')}`;
  const sources = useMemo(() => {
    if (!ready) return null;
    if (staff) return [collection(db, name)];
    // One equality query per linked student (families have a handful) — this is the
    // query shape Firestore rules can always prove against `studentId in me().studentIds`.
    return ids.map((id) => query(collection(db, name), where('studentId', '==', id)));
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const result = useLiveList<T>(sources, key);
  return enabled ? result : EMPTY;
}

/** Students the current account can see. */
export function useStudents(): LiveList<Student> {
  const { profile } = useAuth();
  const staff = isStaff(profile);
  const ids = profile?.studentIds ?? [];
  const ready = profile?.status === 'approved';
  const key = `students|${ready}|${staff}|${ids.join(',')}`;
  const sources = useMemo(() => {
    if (!ready) return null;
    if (staff) return [collection(db, 'students')];
    return ids.map((id) => doc(db, 'students', id));
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const result = useLiveList<Student>(sources, key);
  const sorted = useMemo(
    () => [...result.data].sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [result.data],
  );
  return { ...result, data: sorted };
}

// ---------- writes ----------

export const create = (name: string, data: DocumentData) => addDoc(collection(db, name), data);
export const update = (name: string, id: string, data: DocumentData) => updateDoc(doc(db, name, id), data);
export const remove = (name: string, id: string) => deleteDoc(doc(db, name, id));

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateCode(length = 6) {
  let out = '';
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return out;
}

async function freshCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = generateCode();
    const exists = (await getDoc(doc(db, 'joinCodes', code))).exists();
    if (!exists) return code;
  }
  throw new Error('Could not generate a unique code, please try again.');
}

export async function createStudent(data: Omit<Student, 'id' | 'joinCode'>) {
  const code = await freshCode();
  const ref = doc(collection(db, 'students'));
  const batch = writeBatch(db);
  batch.set(ref, { ...data, joinCode: code });
  batch.set(doc(db, 'joinCodes', code), { kind: 'family', studentId: ref.id, studentName: data.fullName });
  await batch.commit();
  return { id: ref.id, joinCode: code };
}

export async function regenerateStudentCode(student: Student) {
  const code = await freshCode();
  const batch = writeBatch(db);
  if (student.joinCode) batch.delete(doc(db, 'joinCodes', student.joinCode));
  batch.set(doc(db, 'joinCodes', code), { kind: 'family', studentId: student.id, studentName: student.fullName });
  batch.update(doc(db, 'students', student.id), { joinCode: code });
  await batch.commit();
  return code;
}

export async function deleteStudent(student: Student) {
  const batch = writeBatch(db);
  if (student.joinCode) batch.delete(doc(db, 'joinCodes', student.joinCode));
  batch.delete(doc(db, 'students', student.id));
  await batch.commit();
}

/** Coach invite code: anyone signing up as Coach with it is approved automatically. */
export async function regenerateCoachCode(previous: string | null) {
  const code = await freshCode();
  const batch = writeBatch(db);
  if (previous) batch.delete(doc(db, 'joinCodes', previous));
  batch.set(doc(db, 'joinCodes', code), { kind: 'coach' });
  batch.set(doc(db, 'meta', 'coachCode'), { code });
  await batch.commit();
  return code;
}

export async function disableCoachCode(previous: string) {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'joinCodes', previous));
  batch.set(doc(db, 'meta', 'coachCode'), { code: null });
  await batch.commit();
}

export function useCoachCode() {
  const [code, setCode] = useState<string | null>(null);
  useEffect(
    () =>
      onSnapshot(
        doc(db, 'meta', 'coachCode'),
        (s) => setCode((s.data()?.code as string | null) ?? null),
        () => setCode(null),
      ),
    [],
  );
  return code;
}
