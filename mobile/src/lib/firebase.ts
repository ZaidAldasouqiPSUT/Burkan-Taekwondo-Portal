import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';
// The React Native persistence helper is only exposed through the RN build of @firebase/auth.
import { getReactNativePersistence } from '@firebase/auth';
import { getFirestore } from 'firebase/firestore';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

function createAuth(): Auth {
  const app = getApp();
  if (Platform.OS === 'web') return getAuth(app);
  try {
    // Keeps people signed in across app restarts.
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // Already initialised (fast refresh).
    return getAuth(app);
  }
}

const app = isFirebaseConfigured ? (getApps().length ? getApp() : initializeApp(config)) : null;

export const auth = (app ? createAuth() : null) as Auth;
export const db = (app ? getFirestore(app) : null) as ReturnType<typeof getFirestore>;
