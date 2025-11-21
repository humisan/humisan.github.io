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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && ['ja', 'en'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ja']] || key;
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

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
