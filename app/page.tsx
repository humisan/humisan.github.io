'use client';

import { Button } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from './context/LanguageContext';
import Icon from './components/Icons';
import Portrait from './components/Portrait';

export default function Home() {
  const { language, t } = useLanguage();
  const ja = language === 'ja';
  return <>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-masthead"><p>JAVA DEVELOPER / MINECRAFT</p><h1 id="hero-title">humisan<span>.</span></h1></div>
      <div className="hero-inner"><div className="hero-copy"><Icon name="glasses" className="hero-glasses" /><h2 className="hero-tagline">{ja ? <>Java開発と<br />サーバー運営</> : <>Java &<br />Minecraft.</>}</h2><p className="hero-description">{t('hero.description')}</p><div className="hero-roles"><span>GankMC <b>Owner / Founder</b></span><span>LzPvP <b>Admin</b></span><span>日ノ本鯖 <b>Dev</b></span></div><Button component={Link} className="primary-link" href="/servers/">{t('hero.cta')}<Icon name="arrow" /></Button></div><Portrait /></div>
      <div className="hero-bottom"><span>SUMMER / SHADES / CODE</span><a href="#explore">{ja ? 'ページを選ぶ' : 'Explore'}<span aria-hidden="true">↓</span></a></div>
    </section>
    <section className="home-explore content-width" id="explore" aria-labelledby="explore-title"><p className="section-label">INDEX</p><h2 id="explore-title">{ja ? '活動と好きなもの' : 'Work & interests'}</h2><div className="explore-list">{[
      { href: '/about/', number: '01', title: ja ? '自己紹介と技術' : 'About & skills', description: ja ? 'JavaとMinecraftプラグイン開発' : 'Java, plugins, and server operations.', word: 'ABOUT' },
      { href: '/servers/', number: '02', title: ja ? 'サーバーでの活動' : 'Server projects', description: 'GankMC / LzPvP / 日ノ本鯖', word: 'SERVERS' },
      { href: '/play/', number: '03', title: ja ? 'ミニゲーム' : 'Mini games', description: ja ? 'サングラス集め / メガネDino / TARGET RUSH' : 'Sunglasses / Glasses Run / TARGET RUSH', word: 'PLAY' },
      { href: '/news/', number: '04', title: ja ? 'お知らせ' : 'News', description: ja ? 'サイトの更新情報' : 'Site updates', word: 'NEWS' },
    ].map(item => <Link key={item.href} href={item.href} className="explore-link"><span className="section-label"><b>{item.number}</b>{item.word}</span><h3>{item.title}</h3><p>{item.description}</p><Icon name="arrow" /></Link>)}</div>
    <Link href="/about/#music" className="home-music"><Image src="/tens-unique.png" alt="TEN'S UNIQUE" width={486} height={486} sizes="100px" /><div><span className="section-label">MUSIC</span><h3>TEN&apos;S UNIQUE</h3><p>WALK / OMOIDE</p></div><Icon name="arrow" /></Link></section>
  </>;
}
