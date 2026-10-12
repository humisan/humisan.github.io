import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import type { Metadata } from 'next';
import './globals.css';
import { RootClientLayout } from './components/RootClientLayout';

const title = 'humisan | Java開発とMinecraftサーバー運営';
const description = 'Javaでのプラグイン開発とMinecraftサーバーの開発・運営をするhumisanのポートフォリオ｜GankMC・LzPvP・日ノ本鯖での活動と使用技術を紹介';

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL('https://hanyuu.lol'),
  alternates: { canonical: '/' },
  openGraph: {
    title, description, url: '/', siteName: 'humisan', type: 'website', locale: 'ja_JP', alternateLocale: ['en_US'],
    images: [{ url: '/profile-summer.png', width: 1024, height: 1024, alt: 'humisan' }],
  },
  twitter: { card: 'summary', title, description, creator: '@humisan7626', images: ['/profile-summer.png'] },
  icons: { icon: '/profile-summer.png', apple: '/profile-summer.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ja" data-theme="light" suppressHydrationWarning><body><AppRouterCacheProvider options={{ enableCssLayer: true }}><RootClientLayout>{children}</RootClientLayout></AppRouterCacheProvider></body></html>;
}
