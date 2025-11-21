'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

export function RootClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ThemeToggle />
        <LanguageSwitcher />
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
