'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center space-x-1 border border-border-subtle bg-bg-secondary px-2 py-1 rounded text-xs font-semibold tracking-wider">
      <button
        onClick={() => setLanguage('TH')}
        className={`px-1.5 py-0.5 transition-colors ${
          language === 'TH' ? 'text-gold font-bold' : 'text-txt-muted hover:text-txt-main'
        }`}
      >
        TH
      </button>
      <span className="text-border-subtle">|</span>
      <button
        onClick={() => setLanguage('EN')}
        className={`px-1.5 py-0.5 transition-colors ${
          language === 'EN' ? 'text-gold font-bold' : 'text-txt-muted hover:text-txt-main'
        }`}
      >
        EN
      </button>
    </div>
  );
};
