'use client';

import { IconButton, ToggleButton, ToggleButtonGroup, ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import { ReactNode, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Ambience from './Ambience';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import Icon from './Icons';

function SiteChrome({ children }: { children: ReactNode }) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  return <>
    <Ambience />
    <a className="skip-link" href="#main">{t('nav.skip')}</a>
    <header className="site-header" id="top">
      <Link className="brand" href="/" aria-label={`humisan — ${t('nav.home')}`}><Icon name="glasses" />humisan<span className="brand-dot">.</span></Link>
      <nav aria-label={t('nav.label')} className="main-nav">
        <Link href="/about/" aria-current={pathname.startsWith('/about') ? 'page' : undefined}>{t('nav.about')}</Link>
        <Link href="/servers/" aria-current={pathname.startsWith('/servers') ? 'page' : undefined}>{t('nav.work')}</Link>
        <Link href="/links/" aria-current={pathname.startsWith('/links') ? 'page' : undefined}>{t('nav.links')}</Link>
        <Link href="/news/" aria-current={pathname.startsWith('/news') ? 'page' : undefined}>{language === 'ja' ? 'お知らせ' : 'News'}</Link>
        <Link href="/play/" aria-current={pathname.startsWith('/play') ? 'page' : undefined}>{language === 'ja' ? '遊ぶ' : 'Play'}<span className="nav-play-star" aria-hidden="true">✦</span></Link>
      </nav>
      <div className="preferences">
        <ToggleButtonGroup className="language-switch" exclusive value={language} onChange={(_, value) => { if (value === 'ja' || value === 'en') setLanguage(value); }} aria-label={t('language.label')}>
          <ToggleButton value="ja" lang="ja" aria-label="日本語">JP</ToggleButton>
          <ToggleButton value="en" lang="en" aria-label="English">EN</ToggleButton>
        </ToggleButtonGroup>
        <IconButton className="theme-toggle" onClick={toggleTheme} aria-label={t(theme === 'dark' ? 'theme.light' : 'theme.dark')} title={t(theme === 'dark' ? 'theme.light' : 'theme.dark')}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></IconButton>
      </div>
    </header>
    <main id="main" tabIndex={-1}>{children}</main>
    <footer className="site-footer">
      <div className="footer-inner">
        <div><p className="footer-message footer-motto">STAY SHARP.</p><p className="copyright">© {new Date().getFullYear()} humisan</p></div>
        <IconButton component="a" className="back-top" href="#top" aria-label={t('footer.top')}><Icon name="arrow" /></IconButton>
      </div>
      <div className="footer-word" aria-hidden="true"><Icon name="glasses" /></div>
    </footer>
  </>;
}

function MaterialTheme({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const materialTheme = useMemo(() => createTheme({
    palette: { mode: theme, primary: { main: theme === 'dark' ? '#89c7ff' : '#125fca' }, secondary: { main: '#9183cd' } },
    typography: { fontFamily: 'Arial, "Hiragino Kaku Gothic ProN", Meiryo, sans-serif', button: { textTransform: 'none' } },
    shape: { borderRadius: 2 },
    components: {
      MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { minHeight: 44 } } },
      MuiToggleButton: { styleOverrides: { root: { minHeight: 44, textTransform: 'none' } } },
      MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
    },
  }), [theme]);
  return <MuiThemeProvider theme={materialTheme}>{children}</MuiThemeProvider>;
}

export function RootClientLayout({ children }: { children: ReactNode }) {
  return <ThemeProvider><MaterialTheme><LanguageProvider><SiteChrome>{children}</SiteChrome></LanguageProvider></MaterialTheme></ThemeProvider>;
}
