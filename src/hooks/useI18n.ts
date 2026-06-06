import { useCallback, useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";

export type Locale = "zh" | "en";

const STORAGE_KEY = "r7-locale";

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && ["zh", "en"].includes(stored)) return stored;
  const lang = navigator.language;
  if (lang.startsWith("zh")) return "zh";
  if (lang.startsWith("en")) return "en";
  return "zh";
}

export function useI18n() {
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const { data: serverTranslations } = trpc.i18n.getTranslations.useQuery(
    { locale },
    { staleTime: Infinity }
  );

  useEffect(() => {
    if (serverTranslations) {
      setTranslations(serverTranslations);
    }
  }, [serverTranslations]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback(
    (key: string) => {
      return translations[key] ?? key;
    },
    [translations]
  );

  return { locale, setLocale, t };
}
