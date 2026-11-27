import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AR } from './ar';

export type Lang = 'en' | 'ar';

const STORAGE_KEY = 'burkan_lang';

// The active language lives at module level so plain functions (t, formatDate,
// error messages) can use it. The provider re-mounts the app when it changes.
let current: Lang = 'en';

export const getLang = () => current;
export const isRTL = () => current === 'ar';

/** Translate English UI text. Unknown text (names, user content) is returned unchanged. */
export function t(text: string, vars?: Record<string, string | number>): string {
  let out = current === 'ar' ? (AR[text] ?? text) : text;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  return out;
}

/** Arabic letters must stay joined, so letter-spacing is dropped in Arabic. */
export const ls = (n: number) => (current === 'ar' ? 0 : n);

function deviceLang(): Lang {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase().startsWith('ar') ? 'ar' : 'en';
  } catch {
    return 'en';
  }
}

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'en', setLang: () => {} });

export function LanguageProvider({ children }: { children: (lang: Lang) => ReactNode }) {
  const [lang, setLangState] = useState<Lang | null>(null);

  useEffect(() => {
    const apply = (l: Lang) => {
      current = l;
      setLangState(l);
    };
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => apply(saved === 'ar' || saved === 'en' ? saved : deviceLang()))
      .catch(() => apply(deviceLang()));
  }, []);

  if (!lang) return null;

  const setLang = (l: Lang) => {
    current = l;
    setLangState(l);
    AsyncStorage.setItem(STORAGE_KEY, l).catch(() => {});
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children(lang)}</LangContext.Provider>;
}

export const useLanguage = () => useContext(LangContext);
