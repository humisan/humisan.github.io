'use client';

import { useLanguage } from './context/LanguageContext';
import Icon from './components/Icons';
import Link from 'next/link';

export default function NotFound() {
  const { t } = useLanguage();
  return <section className="not-found content-width"><p className="eyebrow">404 / LOST IN THE CLOUDS</p><h1>{t('notFound.title')}</h1><p>{t('notFound.description')}</p><Link href="/" className="primary-link">{t('notFound.home')}<Icon name="arrow" /></Link></section>;
}
