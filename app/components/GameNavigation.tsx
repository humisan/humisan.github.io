'use client';
import Link from 'next/link';
import { Button } from '@mui/material';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
export default function GameNavigation() {
  const pathname = usePathname();
  const { language } = useLanguage();
  return <nav className="game-navigation" aria-label={language === 'ja' ? 'ゲーム選択' : 'Choose a game'}>
    {[['/play/', language === 'ja' ? 'サングラス集め' : 'Sunglasses'], ['/play/dino/', language === 'ja' ? 'メガネDino' : 'Glasses Run'], ['/play/rush/', 'TARGET RUSH']].map(([href, label]) => <Button key={href} component={Link} href={href} variant={pathname === href ? 'contained' : 'outlined'} aria-current={pathname === href ? 'page' : undefined}>{label}</Button>)}
  </nav>;
}
