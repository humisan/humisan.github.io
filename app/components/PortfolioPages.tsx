'use client';

import { Button, Chip, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import Icon from './Icons';

export function AboutPage() {
  const { language, t } = useLanguage();
  const ja = language === 'ja';
  const [tab, setTab] = useState<'code' | 'operations'>('code');

  return <article className="interior-page content-width">
    <header className="page-intro"><p className="section-label">ABOUT ME</p><h1>{ja ? 'Java開発とサーバー運営' : 'Building behind the game.'}</h1><p>{ja ? 'Minecraftサーバーでの活動をまとめています' : 'Java and Minecraft. Creating the places we play in.'}</p></header>
    <section className="profile-story" aria-labelledby="profile-name">
      <div className="profile-avatar"><Image src="/profile-summer.png" alt="humisan" width={1024} height={1024} sizes="(max-width: 700px) 95px, 140px" /></div>
      <div><p className="eyebrow">JAVA DEVELOPER / SERVER OPERATOR</p><h2 id="profile-name">humisan</h2><p>{ja ? 'JavaでMinecraftのプラグインを開発しています\nGankMC・LzPvP・日ノ本鯖で開発や運営に参加しています' : 'I develop Java plugins and work on Minecraft server development and operations.\nI write code and help build the places we play in.'}</p></div>
    </section>
    <section className="about-narrative" aria-label={ja ? '詳しい自己紹介' : 'More about me'}>
      <div><p className="section-label">01 / WHAT I DO</p><h2>{ja ? '普段やっていること' : 'On the building side of Minecraft.'}</h2><p>{ja ? 'humisanです\n主にJavaでMinecraftプラグインを開発しています\nサーバーの機能を作ることに加えて運営や管理にも関わっています' : "Hey, I’m humisan. I work on Java plugin development and Minecraft server development and operations. Alongside playing the game, I’m involved in founding servers, administration, and building features with code. I enjoy Minecraft from the building side, too."}</p><p>{ja ? '現在関わっているのは3つのサーバーです\nGankMCではOwner / Founderとして運営しています\nLzPvPではAdminを担当しています\n日ノ本鯖にはDevとして参加しています' : 'My role varies from server to server. I’m involved as an Owner and Founder, as an Admin, and as a Dev. Both operations and development are part of what I do.'}</p></div>
      <div><p className="section-label">02 / MY SERVERS</p><h2>{ja ? '参加しているサーバー' : 'Three servers. Different roles.'}</h2><p>{ja ? 'GankMCは自分がOwner / Founderを務めるPvPサーバーです\nFFAや1対1のDuelsがあるサーバーです\n立ち上げと運営を担当しています' : 'At GankMC, I’m involved as Owner and Founder. It’s a Minecraft PvP server focused on FFA and one-on-one duels, and a project I work on from the operations side.'}</p><p>{ja ? 'LzPvPではAdminとして参加しています\nFFA・Duels・Party Fightなどがある日本のPvP練習サーバーです\n日ノ本鯖ではJavaを使ったサーバー機能の開発を担当しています\n活動ページには各サーバーの紹介と参加アドレスを載せています' : 'I participate in LzPvP as an Admin. It’s a Japanese PvP practice server with FFA, duels, and party fights. At 日ノ本鯖, I’m a Dev working on server features with Java. Each server and each role is different, so I introduce them separately on the Work page.'}</p><Link href="/servers/" className="text-link">{ja ? 'サーバーでの活動を詳しく見る' : 'Explore my server projects'}<Icon name="arrow" /></Link></div>
      <div><p className="section-label">03 / DEVELOPMENT</p><h2>{ja ? '開発に使っている技術' : 'From Java to server features.'}</h2><p>{ja ? 'プラグイン開発にはJavaとPaper / Spigotを使っています\nビルドと依存関係の管理はGradleです\nサーバー側の機能を作るために使っている技術を下にまとめています' : 'Java is the language I work with. I develop Minecraft plugins for Paper and Spigot and use Gradle for builds and dependency management. Behind what players see are the server’s systems and features. My development work helps turn those into code.'}</p></div>
      <div><p className="section-label">04 / THIS LITTLE SPACE</p><h2>{ja ? 'このサイトについて' : 'A small space with a summer mood.'}</h2><p>{ja ? '活動内容と使っている技術を紹介するために作りました\nデザインは今使っているアイコンに合わせています\n自己紹介・サーバー紹介・リンク集のほかに30秒で遊べるミニゲームもあります\n右上のボタンで配色と表示言語を切り替えられます' : 'This site brings together my activities and the tools I use. Its bright, summery look comes from my icon’s blue sky, sea, and lavender hair. Alongside the projects and links, you can interact with the portrait, switch between day and night, or take a little break with a game. Feel free to explore whatever catches your eye.'}</p></div>
    </section>
    <section id="music" className="favorite-music" aria-labelledby="music-title">
      <div className="music-heading"><p className="section-label">MUSIC</p><h2 id="music-title">{ja ? '好きなアーティスト' : 'Favorite artist'}</h2></div>
      <div className="music-feature">
        <figure className="music-photo"><Image src="/tens-unique.png" alt="TEN'S UNIQUE" width={486} height={486} sizes="(max-width: 700px) 100vw, 320px" /><figcaption><a href="https://music.apple.com/jp/artist/tens-unique/1434253818" target="_blank" rel="noopener noreferrer">{ja ? '画像出典：Apple Music' : 'Image source: Apple Music'}</a></figcaption></figure>
        <div className="music-details"><h3>TEN&apos;S UNIQUE</h3><p className="music-caption">{ja ? '好きな曲はこの2曲' : 'My two favorites'}</p><ol className="music-tracks">{[{title:'WALK',href:'https://music.apple.com/jp/song/1520829525'},{title:'OMOIDE',href:'https://music.apple.com/jp/song/1520829572'}].map((track,index)=><li key={track.title}><a href={track.href} target="_blank" rel="noopener noreferrer" aria-label={`${track.title} — Apple Music — ${t('links.external')}`}><span className="music-track-number" aria-hidden="true">0{index+1}</span><span className="music-track-title">{track.title}<small>Apple Music</small></span><Icon name="arrow" /></a></li>)}</ol><a className="text-link" href="https://open.spotify.com/artist/0tNoGA6RfiW4j8pcLAzWNU" target="_blank" rel="noopener noreferrer" aria-label={`TEN'S UNIQUE — Spotify — ${t('links.external')}`}>Spotify<Icon name="arrow" /></a></div>
      </div>
    </section>
    <section className="about-focus" aria-labelledby="focus-title">
      <h2 id="focus-title">{ja ? '取り組んでいること' : 'What I work on.'}</h2>
      <ToggleButtonGroup className="focus-tabs" exclusive value={tab} onChange={(_, value) => { if (value === 'code' || value === 'operations') setTab(value); }} aria-label={ja ? '活動の切り替え' : 'Choose an area'}><ToggleButton value="code">{ja ? 'プラグイン開発' : 'Plugin development'}</ToggleButton><ToggleButton value="operations">{ja ? 'サーバー運営' : 'Server operations'}</ToggleButton></ToggleButtonGroup>
      <div className="focus-panel" aria-live="polite"><span className="focus-mark" aria-hidden="true">{tab === 'code' ? '</>' : '▦'}</span><div><h3>{tab === 'code' ? 'Java / Minecraft Plugins' : 'Minecraft Server Operations'}</h3><p>{tab === 'code' ? (ja ? 'Javaを使ったMinecraftプラグインの開発に取り組んでいます' : 'I work on Minecraft plugin development with Java.') : (ja ? 'GankMCのOwner / FounderとLzPvPのAdminを担当しています' : 'I work on GankMC as Owner and Founder, and LzPvP as Admin.')}</p></div></div>
    </section>
    <section className="tech-section" aria-labelledby="tech-title"><div className="tech-heading"><p className="section-label">TOOLBOX</p><h2 id="tech-title">{t('tech.title')}</h2><p className="section-description">{t('tech.description')}</p><span className="code-mark" aria-hidden="true">{'{ }'}</span></div><dl className="tech-list"><div><dt><span className="tech-symbol java-symbol" aria-hidden="true">J</span>Java</dt><dd>{t('tech.java')}</dd></div><div><dt><span className="tech-symbol paper-symbol" aria-hidden="true">P</span>Paper / Spigot</dt><dd>{t('tech.paper')}</dd></div><div><dt><span className="tech-symbol gradle-symbol" aria-hidden="true">G</span>Gradle</dt><dd>{t('tech.gradle')}</dd></div></dl></section>
  </article>;
}

const servers = [
  {
    name: 'GankMC', role: 'Owner / Founder', detail: 'work.owner', group: 'operations', logo: '/gankmc.png', theme: 'gank',
    description: { ja: 'FFAと1対1のDuelsがあるMinecraft PvPサーバー', en: 'A competitive Minecraft PvP server focused on free-for-all combat and one-on-one duels.' },
    tags: ['PvP', 'FFA', 'Duels'], address: 'play.gankmc.com', href: 'https://www.gankmc.com/',
    linkLabel: { ja: '公式サイト', en: 'Official website' },
  },
  {
    name: 'LzPvP', role: 'Admin', detail: 'work.admin', group: 'operations', logo: '/lzpvp.png', theme: 'lzpvp',
    description: { ja: 'FFA・Duels・Party Fightで遊べる日本のMinecraft PvP練習サーバー', en: 'A Japanese Minecraft PvP practice server with FFA, duels, and party fights.' },
    tags: ['PvP Practice', 'FFA', 'Party Fight'], address: 'lzpvp.xyz', href: 'https://modrinth.com/server/lzpvp',
    linkLabel: { ja: 'サーバー紹介', en: 'Server details' },
  },
  {
    name: '日ノ本鯖', role: 'Dev', detail: 'work.dev', group: 'development', logo: null, theme: 'hinomoto',
    description: { ja: 'DevとしてJavaでサーバー機能を開発しています', en: 'I participate as a developer, working on server features with Java.' },
    tags: ['Minecraft', 'Java', 'Development'], address: null, href: null, linkLabel: null,
  },
] as const;

export function ServersPage() {
  const { language, t } = useLanguage();
  const ja = language === 'ja';
  const [filter, setFilter] = useState('all');
  const [copyMessage, setCopyMessage] = useState('');
  const visible = servers.filter(server => filter === 'all' || server.group === filter);

  async function copyAddress(address: string) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard is unavailable');
      await navigator.clipboard.writeText(address);
      setCopyMessage(ja ? `${address} をコピーしました` : `Copied ${address}.`);
    } catch {
      setCopyMessage(ja ? 'コピーできませんでした\n表示されているアドレスを選択してコピーしてください' : 'Could not copy. Select and copy the displayed address instead.');
    }
  }

  return <article className="interior-page content-width">
    <header className="page-intro"><p className="section-label">MINECRAFT SERVERS</p><h1>{ja ? 'サーバーでの活動' : 'Build a place to play. Keep it going.'}</h1><p>{ja ? 'GankMC・LzPvP・日ノ本鯖\nそれぞれの担当とサーバーの紹介' : 'From founding a server to administration and development, I contribute in different roles.'}</p></header>
    <ToggleButtonGroup className="server-filters" exclusive value={filter} onChange={(_, value) => { if (['all', 'operations', 'development'].includes(value)) setFilter(value); }} aria-label={ja ? 'サーバーを役割で絞り込む' : 'Filter servers by role'}>{[['all', ja ? 'すべて / 3' : 'All / 3'], ['operations', ja ? '運営・管理 / 2' : 'Operations / 2'], ['development', ja ? '開発 / 1' : 'Development / 1']].map(([value, label]) => <ToggleButton key={value} value={value}>{label}</ToggleButton>)}</ToggleButtonGroup>
    <p className="filter-result" role="status">{ja ? `${visible.length}つのサーバーを表示` : `Showing ${visible.length} ${visible.length === 1 ? 'server' : 'servers'}`}</p>
    <div className="server-showcase">{visible.map(server => <section className={`server-detail ${server.theme}`} key={server.name} aria-label={server.name}>
      <div className="server-art">{server.logo ? <Image src={server.logo} alt={`${server.name} ${ja ? 'ロゴ' : 'logo'}`} width={server.theme === 'gank' ? 256 : 899} height={server.theme === 'gank' ? 256 : 899} sizes="(max-width: 700px) 140px, 220px" /> : <span className="hinomoto-name" aria-hidden="true">日ノ本<span>HINOMOTO</span></span>}</div>
      <div className="server-information"><div className="server-card-top"><p className="section-label">{server.name === 'GankMC' ? 'OWNER & FOUNDER' : 'PART OF THE TEAM'}</p><Chip className="role-badge" size="small" label={server.role} /></div><h2>{server.name}</h2><p className="server-summary">{server.description[language]}</p><ul className="server-tags" aria-label={ja ? 'サーバーの特徴' : 'Server features'}>{server.tags.map(tag => <li key={tag}><Chip size="small" variant="outlined" label={tag} /></li>)}</ul><dl className="server-responsibility"><div><dt>{ja ? '担当' : 'My role'}</dt><dd>{t(server.detail)}</dd></div></dl><div className="server-actions">{server.href && <a href={server.href} target="_blank" rel="noopener noreferrer" aria-label={`${server.name} ${server.linkLabel[language]} — ${t('links.external')}`}>{server.linkLabel[language]}<Icon name="arrow" /></a>}{server.address && <Button type="button" onClick={() => copyAddress(server.address)} aria-label={`${server.name} ${ja ? '参加アドレスをコピー' : 'copy server address'}`}><code>{server.address}</code><span>{ja ? 'コピー' : 'Copy'}</span></Button>}</div></div>
    </section>)}</div>
    <p className="copy-message" role="status">{copyMessage}</p>
  </article>;
}

const links = [
  { name: 'GitHub', handle: '@humisan', href: 'https://github.com/humisan', icon: 'github', description: 'links.github', color: 'lavender' },
  { name: 'X / Twitter', handle: '@humisan7626', href: 'https://twitter.com/humisan7626', icon: 'x', description: 'links.x', color: 'blue' },
  { name: 'YouTube', handle: '@humisan', href: 'https://youtube.com/@humisan', icon: 'youtube', description: 'links.youtube', color: 'pink' },
] as const;

export function LinksPage() {
  const { t } = useLanguage();
  return <article className="interior-page content-width"><header className="page-intro"><p className="section-label">ELSEWHERE</p><h1>{t('links.title')}</h1><p>{t('links.description')}</p></header><div className="social-list">{links.map((link, index) => <a key={link.name} className={`social-row ${link.color}`} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${link.name} ${link.handle} — ${t('links.external')}`}><span className="link-number" aria-hidden="true">0{index + 1}</span><span className="social-icon"><Icon name={link.icon} /></span><span className="social-name">{link.name}<span>{link.handle}</span></span><span className="social-description">{t(link.description)}</span><span className="social-arrow"><Icon name="arrow" /></span></a>)}</div></article>;
}
