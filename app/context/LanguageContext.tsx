'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ja' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ja: {
    'nav.github': 'GitHub',
    'nav.twitter': 'Twitter',
    'nav.youtube': 'YouTube',
    'profile.title': 'デベロッパー',
    'profile.description': 'ウェブデザインとコードを探索するクリエイティブデベロッパー',
    'profile.welcome': 'ようこそ',
    'spotify.now_playing': '🎵 再生中',
    'spotify.last_played': '⏸️ 最後に再生',
    'github.title': '🐙 GitHub統計',
    'github.repositories': 'リポジトリ',
    'github.followers': 'フォロワー',
    'github.following': 'フォロー中',
    'github.top_languages': 'トップ言語',
    'github.top_repositories': 'トップリポジトリ',
  },
  en: {
    'nav.github': 'GitHub',
    'nav.twitter': 'Twitter',
    'nav.youtube': 'YouTube',
    'profile.title': 'Developer',
    'profile.description': 'Creative developer exploring web design and code',
    'profile.welcome': 'Welcome to my portfolio',
    'spotify.now_playing': '🎵 Now Playing',
    'spotify.last_played': '⏸️ Last Played',
    'github.title': '🐙 GitHub Statistics',
    'github.repositories': 'Repositories',
    'github.followers': 'Followers',
    'github.following': 'Following',
    'github.top_languages': 'Top Languages',
    'github.top_repositories': 'Top Repositories',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ja');

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && ['ja', 'en'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ja']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Return default values if used outside provider
    return {
      language: 'ja' as Language,
      setLanguage: () => {},
      t: (key: string) => key,
    };
  }
  return context;
}
