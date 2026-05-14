"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import en from "@/messages/en.json";
import rw from "@/messages/rw.json";

export const locales = ["en", "rw"] as const;
export type Locale = (typeof locales)[number];

const labels: Record<Locale, string> = {
  en: "English",
  rw: "Kinyarwanda",
};

type Dict = typeof en;
const dicts: Record<Locale, Dict> = {
  en: en as Dict,
  rw: rw as Dict,
};

const STORAGE_KEY = "themalliwacu:locale:v1";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LocaleCtx = createContext<Ctx>({
  locale: "en",
  setLocale: () => {},
  t: (k) => k,
});

function lookup(dict: Dict, key: string): unknown {
  const parts = key.split(".");
  let v: unknown = dict;
  for (const p of parts) {
    if (typeof v !== "object" || v === null) return undefined;
    v = (v as Record<string, unknown>)[p];
  }
  return v;
}

function interpolate(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Always start with "en" so the server-rendered HTML and the first client
  // render match. We swap to the stored / browser-preferred locale in effect.
  const [locale, setLocaleState] = useState<Locale>("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let chosen: Locale = "en";
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && (locales as readonly string[]).includes(stored)) {
        chosen = stored;
      } else if (
        typeof navigator !== "undefined" &&
        navigator.language?.toLowerCase().startsWith("rw")
      ) {
        chosen = "rw";
      }
    } catch {
      // ignore
    }
    setLocaleState(chosen);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = dicts[locale];
      let v = lookup(dict, key);
      if (typeof v !== "string") {
        // Fall back to English so missing translations never break the UI.
        v = lookup(dicts.en, key);
      }
      if (typeof v !== "string") return key;
      return interpolate(v, vars);
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  // Until we have read storage, render with the default ("en"). Avoids
  // hydration mismatch — the brief flash for rw users is acceptable.
  void hydrated;

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useLocale() {
  return useContext(LocaleCtx);
}

export function useT() {
  return useContext(LocaleCtx).t;
}

export function localeLabel(l: Locale): string {
  return labels[l];
}
