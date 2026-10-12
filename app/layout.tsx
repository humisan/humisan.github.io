import type { Metadata } from 'next';
import './globals.css';
import { RootClientLayout } from './components/RootClientLayout';

const title = 'humisan — Java・Minecraftサーバー開発';
const description = 'Javaでのプラグイン開発とMinecraftサーバーの開発・運営に取り組むhumisanのポートフォリオ。技術・活動・SNSを紹介します。';

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL('https://hanyuu.lol'),
  alternates: { canonical: '/' },
  openGraph: {
    title, description, url: '/', siteName: 'humisan', type: 'website', locale: 'ja_JP', alternateLocale: ['en_US'],
    images: [{ url: '/icon.png', width: 1024, height: 1024, alt: 'humisan' }],
  },
  twitter: { card: 'summary', title, description, creator: '@humisan7626', images: ['/icon.png'] },
  icons: { icon: '/icon.png', apple: '/icon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ja" data-theme="light" suppressHydrationWarning><body><RootClientLayout>{children}</RootClientLayout></body></html>;
}
