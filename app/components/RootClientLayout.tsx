'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

export function RootClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ThemeToggle />
      {children}
    </ThemeProvider>
  );
}
