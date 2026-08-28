'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const { t } = useLanguage();

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={t.shop.searchPlaceholder}
        className="w-full pl-10 pr-10 py-2.5 bg-bg-card border border-border-subtle rounded-lg text-xs text-txt-main placeholder-stone-dark focus:outline-none focus:border-gold transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
