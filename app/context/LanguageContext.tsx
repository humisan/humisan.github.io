'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Language = 'ja' | 'en';

const ja = {
  'nav.about': '自己紹介',
  'nav.links': 'リンク',
  'nav.work': '活動',
  'nav.label': 'メインナビゲーション',
  'nav.home': 'トップへ',
  'nav.skip': '本文へスキップ',
  'language.label': '表示言語',
  'theme.light': '明るい配色に切り替える',
  'theme.dark': '夜の配色に切り替える',
  'hero.greeting': 'こんにちは、humisanです',
  'hero.line1': 'コードでつくる、',
  'hero.line2': '遊べる場所',
  'hero.description': 'Javaでのプラグイン開発と、\nMinecraftサーバーの開発・運営',
  'hero.cta': '活動を見てみる',
  'hero.image': '青空と海を背景に、麦わら帽子とピクセルサングラスを着けたラベンダー色の髪のキャラクター',
  'hero.caption': 'いつも、夏の気分',
  'hero.scroll': 'もう少し下へ',
  'about.title': 'ゲームの裏側も、\nつくっていく',
  'about.description': 'Javaを使ったプラグイン開発や、Minecraftサーバーの開発・運営に取り組んでいます\n遊ぶ場所を、つくる側からも楽しんでいます',
  'tech.title': '使っている技術',
  'tech.description': 'サーバーづくりを支える、いつもの道具',
  'tech.java': 'サーバーの機能をつくる、プラグイン開発',
  'tech.paper': 'Minecraftサーバーとプラグインの開発基盤',
  'tech.gradle': 'Javaプロジェクトのビルドと依存関係の管理',
  'work.title': '参加しているサーバー',
  'work.description': '開発や運営で関わっている、3つのサーバー',
  'work.owner': 'オーナー・創設者',
  'work.admin': '管理者',
  'work.dev': '開発者',
  'work.role': '開発・運営',
  'work.visit': '公式リンクを見る',
  'links.title': 'あちこちに、います',
  'links.description': 'コードも、日々のことも\n気になるところからどうぞ',
  'links.github': 'コードとリポジトリ',
  'links.x': '日々の投稿',
  'links.youtube': '動画とチャンネル',
  'links.external': '新しいタブで開く',
  'footer.message': 'また、ふらっと',
  'footer.top': 'ページの先頭へ',
  'notFound.title': 'ここには、まだ何もないみたい',
  'notFound.description': 'ページが見つかりません\nトップページからどうぞ',
  'notFound.home': 'トップページへ',
};

type TranslationKey = keyof typeof ja;
const en: Record<TranslationKey, string> = {
  'nav.about': 'About',
  'nav.links': 'Links',
  'nav.work': 'Work',
  'nav.label': 'Main navigation',
  'nav.home': 'Home',
  'nav.skip': 'Skip to content',
  'language.label': 'Display language',
  'theme.light': 'Switch to daylight colors',
  'theme.dark': 'Switch to nighttime colors',
  'hero.greeting': "Hey, I'm humisan.",
  'hero.line1': 'A little code.',
  'hero.line2': 'A place to play.',
  'hero.description': 'Java plugin development\nand Minecraft server development & operations.',
  'hero.cta': 'Explore my work',
  'hero.image': 'A lavender-haired character wearing a straw hat and pixel sunglasses, with a blue sky and sea in the background',
  'hero.caption': 'Always in a summer mood.',
  'hero.scroll': 'A little more below',
  'about.title': 'Behind the game,\nbuilding what comes next.',
  'about.description': "I develop Java plugins and work on Minecraft server development and operations.\nI enjoy creating the places we play in, too.",
  'tech.title': 'Tools I work with.',
  'tech.description': 'The everyday tools behind my server projects.',
  'tech.java': 'Building server features through plugin development.',
  'tech.paper': 'The foundation for Minecraft servers and plugins.',
  'tech.gradle': 'Builds and dependency management for Java projects.',
  'work.title': 'Servers I work on.',
  'work.description': 'Three servers I help develop or run.',
  'work.owner': 'Owner & founder',
  'work.admin': 'Administrator',
  'work.dev': 'Developer',
  'work.role': 'Development & operations',
  'work.visit': 'Visit the official link',
  'links.title': 'Find me around the web.',
  'links.description': 'Code, everyday posts, and videos. Pick a place to start.',
  'links.github': 'Code & repositories',
  'links.x': 'Everyday posts',
  'links.youtube': 'Videos & channel',
  'links.external': 'Opens in a new tab',
  'footer.message': 'See you around.',
  'footer.top': 'Back to top',
  'notFound.title': "There's nothing here just yet.",
  'notFound.description': 'This page could not be found. Start from the home page.',
  'notFound.home': 'Back to home',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ja');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('language');
      if (saved === 'ja' || saved === 'en') setLanguageState(saved);
    } catch {
      // Preferences remain available in memory when storage is blocked.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function setLanguage(value: Language) {
    setLanguageState(value);
    try {
      localStorage.setItem('language', value);
    } catch {
      // A blocked preference store must not prevent changing the language.
    }
  }

  function t(key: TranslationKey) {
    return (language === 'ja' ? ja : en)[key];
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage requires LanguageProvider');
  return context;
}
