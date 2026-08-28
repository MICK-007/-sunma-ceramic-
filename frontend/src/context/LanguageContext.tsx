'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en';
import { th } from '../locales/th';

type Language = 'EN' | 'TH';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('TH');

  useEffect(() => {
    const savedLang = localStorage.getItem('sunma_lang') as Language;
    if (savedLang === 'EN' || savedLang === 'TH') {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sunma_lang', lang);
  };

  const t = language === 'TH' ? th : en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
