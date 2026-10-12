'use client';

import Link from 'next/link';
import { useLanguage } from './context/LanguageContext';
import Icon from './components/Icons';
import Portrait from './components/Portrait';

export default function Home() {
  const { language, t } = useLanguage();
  const ja = language === 'ja';
  return <>
    <section className="hero" aria-labelledby="hero-title"><div className="hero-inner"><div className="hero-copy"><p className="eyebrow"><span className="tiny-sun" aria-hidden="true" />HELLO, WORLD.</p><p className="greeting">{t('hero.greeting')}</p><h1 id="hero-title">humisan<span>.</span></h1><h2 className="hero-tagline">{t('hero.line1')}<br />{t('hero.line2')}</h2><p className="hero-description">{t('hero.description')}</p><Link className="primary-link" href="/servers/">{t('hero.cta')}<Icon name="arrow" /></Link></div><Portrait /></div><div className="hero-bottom"><span>JAVA / MINECRAFT / SUMMER</span><a href="#explore">{t('hero.scroll')}<span aria-hidden="true">↓</span></a></div></section>
    <section className="home-explore content-width" id="explore" aria-labelledby="explore-title"><p className="section-label">A LITTLE MORE ABOUT ME</p><h2 id="explore-title">{ja ? '気になるところから、どうぞ' : 'Follow your curiosity.'}</h2><div className="explore-list">{[
      { href: '/about/', number: '01', title: ja ? '自己紹介と技術' : 'About & skills', description: ja ? 'Java、プラグイン開発、サーバー運営' : 'Java, plugins, and server operations.', word: 'ABOUT' },
      { href: '/servers/', number: '02', title: ja ? 'サーバーでの活動' : 'Server projects', description: 'GankMC / LzPvP / 日ノ本鯖', word: 'SERVERS' },
      { href: '/play/', number: '03', title: ja ? 'ひと休み、していこう' : 'Take a playful break.', description: ja ? '30秒のサングラス集め' : 'A 30-second sunglasses hunt.', word: 'PLAY' },
    ].map(item => <Link key={item.href} href={item.href} className="explore-link"><span className="section-label">{item.number} / {item.word}</span><h3>{item.title}</h3><p>{item.description}</p><Icon name="arrow" /></Link>)}</div></section>
  </>;
}
