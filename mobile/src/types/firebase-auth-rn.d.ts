// @firebase/auth ships getReactNativePersistence in its React Native build, but its
// top-level "types" entry (which TypeScript resolves first) doesn't declare it.
import type { Persistence } from 'firebase/auth';

declare module '@firebase/auth' {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
