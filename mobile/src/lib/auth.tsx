import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, updateDoc, writeBatch, arrayUnion } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import type { Role, UserProfile } from './types';
import { t } from './i18n';

interface SignUpInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: Exclude<Role, 'admin'>;
  joinCode: string;
}

interface AuthContextValue {
  initializing: boolean;
  user: User | null;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  linkChild: (code: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured);
  const [profileReady, setProfileReady] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setProfileReady(!u);
      if (!u) setProfile(null);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        setProfile(snap.exists() ? ({ id: snap.id, ...snap.data() } as UserProfile) : null);
        setProfileReady(true);
      },
      () => {
        setProfile(null);
        setProfileReady(true);
      },
    );
  }, [user]);

  const value: AuthContextValue = {
    initializing: !authReady || !profileReady,
    user,
    profile,

    async signIn(email, password) {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    },

    async signUp({ fullName, email, phone, password, role, joinCode }) {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const u = cred.user;
      await updateProfile(u, { displayName: fullName.trim() });

      const base = {
        fullName: fullName.trim(),
        email: u.email ?? email.trim(),
        phone: phone.trim(),
        createdAt: Date.now(),
        notifyPush: true,
        notifyEmail: true,
        notifySms: false,
      };

      try {
        // The very first account becomes the club administrator.
        const bootstrap = await getDoc(doc(db, 'meta', 'bootstrap'));
        if (!bootstrap.exists()) {
          const data = { ...base, role: 'admin' as Role, status: 'approved' as const, studentIds: [], joinCode: null };
          const batch = writeBatch(db);
          batch.set(doc(db, 'users', u.uid), data);
          batch.set(doc(db, 'meta', 'bootstrap'), { adminUid: u.uid, createdAt: Date.now() });
          await batch.commit();
          return { id: u.uid, ...data };
        }

        const code = normalizeCode(joinCode);
        if (code) {
          const codeSnap = await getDoc(doc(db, 'joinCodes', code));
          if (!codeSnap.exists()) throw new Error('That join code is not valid. Check it with your coach, or leave it empty to request approval.');
          const c = codeSnap.data() as { kind: 'family' | 'coach'; studentId?: string };
          if (c.kind === 'coach' && role !== 'coach') throw new Error('That is a coach code. Choose the Coach role to use it.');
          if (c.kind === 'family' && role === 'coach') throw new Error('That is a student/family code. Choose Student or Parent to use it.');
          const data = {
            ...base,
            role,
            status: 'approved' as const,
            studentIds: c.kind === 'family' && c.studentId ? [c.studentId] : [],
            joinCode: code,
          };
          await setDoc(doc(db, 'users', u.uid), data);
          return { id: u.uid, ...data };
        }

        const data = { ...base, role, status: 'pending' as const, studentIds: [], joinCode: null };
        await setDoc(doc(db, 'users', u.uid), data);
        return { id: u.uid, ...data };
      } catch (err) {
        // Don't leave a half-created login behind if the profile step failed.
        await u.delete().catch(() => fbSignOut(auth));
        throw err;
      }
    },

    async signOut() {
      await fbSignOut(auth);
    },

    async resetPassword(email) {
      await sendPasswordResetEmail(auth, email.trim());
    },

    async linkChild(rawCode) {
      if (!user || !profile) throw new Error('Not signed in');
      const code = normalizeCode(rawCode);
      const snap = await getDoc(doc(db, 'joinCodes', code));
      if (!snap.exists()) throw new Error('That join code is not valid.');
      const c = snap.data() as { kind: string; studentId?: string; studentName?: string };
      if (c.kind !== 'family' || !c.studentId) throw new Error('That code cannot be used to link a child.');
      if (profile.studentIds.includes(c.studentId)) throw new Error(t('{name} is already linked.', { name: c.studentName ?? t('This student') }));
      await updateDoc(doc(db, 'users', user.uid), { studentIds: arrayUnion(c.studentId), joinCode: code });
      return c.studentName ?? 'Student';
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export const isStaff = (p: UserProfile | null | undefined) => p?.role === 'coach' || p?.role === 'admin';
export const isAdmin = (p: UserProfile | null | undefined) => p?.role === 'admin';

export function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'No internet connection.';
    case 'permission-denied':
      return 'You do not have permission to do that.';
    default:
      return (err as Error)?.message ?? 'Something went wrong.';
  }
}
