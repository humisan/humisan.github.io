export interface NewsItem {
  slug: string;
  date: string;
  title: { ja: string; en: string };
  paragraphs: { ja: readonly string[]; en: readonly string[] };
}
export const news: readonly NewsItem[] = [{
  slug: 'site-renewal',
  date: '2026-10-12',
  title: { ja: 'サイトリニューアル', en: 'Site renewal' },
  paragraphs: {
    ja: ['サイトをリニューアルしました', '自己紹介と使っている技術をまとめました\nGankMC・LzPvP・日ノ本鯖での活動も紹介しています', 'ミニゲームはサングラス集め・メガネDino・TARGET RUSHの3つ\nBGMと効果音付きで遊べます\n各ゲームの公開ランキングにも記録を登録できます', '今後のお知らせはこのページに載せます'],
    en: ['The site has been rebuilt.', 'You can find my profile, tools, and activities at GankMC, LzPvP, and 日ノ本鯖.', 'There are three games: Sunglasses, Glasses Run, and TARGET RUSH. Each has audio and a public leaderboard.', 'Future updates will appear on this page.'],
  },
}];
