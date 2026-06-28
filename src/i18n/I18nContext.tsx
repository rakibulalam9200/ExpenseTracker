import React, { createContext, useContext, useState, useCallback } from 'react';
import { Language, TranslationKey, translations } from './translations';

interface I18nContextType {
  lang: Language;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  toggleLanguage: () => { },
  t: (key: TranslationKey) => translations.en[key],
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  const toggleLanguage = useCallback(() => {
    setLang(prev => (prev === 'en' ? 'bn' : 'en'));
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
