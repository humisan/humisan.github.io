'use client';

import { ReactNode } from 'react';
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
        <Link href="/play/" aria-current={pathname.startsWith('/play') ? 'page' : undefined}>{language === 'ja' ? '遊ぶ' : 'Play'}<span className="nav-play-star" aria-hidden="true">✦</span></Link>
      </nav>
      <div className="preferences">
        <div className="language-switch" role="group" aria-label={t('language.label')}>
          <button type="button" lang="ja" aria-label="日本語" aria-pressed={language === 'ja'} onClick={() => setLanguage('ja')}>JP</button>
          <span aria-hidden="true">/</span>
          <button type="button" lang="en" aria-label="English" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
        </div>
        <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={t(theme === 'dark' ? 'theme.light' : 'theme.dark')} title={t(theme === 'dark' ? 'theme.light' : 'theme.dark')}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button>
      </div>
    </header>
    <main id="main" tabIndex={-1}>{children}</main>
    <footer className="site-footer">
      <div className="footer-inner">
        <div><p className="footer-message">{t('footer.message')}<Icon name="sparkle" /></p><p className="copyright">© {new Date().getFullYear()} humisan</p></div>
        <a className="back-top" href="#top" aria-label={t('footer.top')}><Icon name="arrow" /></a>
      </div>
      <div className="footer-word" aria-hidden="true">humisan.</div>
    </footer>
  </>;
}

export function RootClientLayout({ children }: { children: ReactNode }) {
  return <ThemeProvider><LanguageProvider><SiteChrome>{children}</SiteChrome></LanguageProvider></ThemeProvider>;
}
