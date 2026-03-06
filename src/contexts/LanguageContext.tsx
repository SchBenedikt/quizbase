"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { en, type Translations } from "@/lib/i18n";

// Only support English
export type Locale = "en";

const TRANSLATIONS: Record<Locale, Translations> = { en };
const STORAGE_KEY = "qb_locale";

interface LanguageContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  t: en,
  setLocale: () => {},
});

function detectLocale(): Locale {
  // Always return English
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    // Always set to English
    setLocaleState("en");
  }, []);

  const setLocale = useCallback((next: Locale) => {
    // Only allow English
    if (next === "en") {
      setLocaleState(next);
      localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, t: TRANSLATIONS[locale], setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
