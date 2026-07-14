import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Language, TranslationKey, translations } from './translations';
import { getSetting, setSetting } from '../db/database';

const LANG_KEY = 'app_language';

interface I18nContextType {
  lang: Language;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  toggleLanguage: () => {},
  t: (key: TranslationKey) => translations.en[key],
});

function getStoredLanguage(): Language {
  try {
    const saved = getSetting(LANG_KEY);
    if (saved === 'bn' || saved === 'en') {
      return saved;
    }
  } catch (_e) {
    // DB not ready yet, fall back to default
  }
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(getStoredLanguage);

  const toggleLanguage = useCallback(() => {
    setLang(prev => {
      const next: Language = prev === 'en' ? 'bn' : 'en';
      try {
        setSetting(LANG_KEY, next);
      } catch (_e) {
        // Silently ignore if DB write fails
      }
      return next;
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[lang][key],
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
