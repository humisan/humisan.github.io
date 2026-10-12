'use client';
import { Chip } from '@mui/material';
import { useLanguage } from '../context/LanguageContext';
import { news } from '../lib/news';
export default function NewsPage() {
  const { language } = useLanguage();
  const ja = language === 'ja';
  return <article className="interior-page content-width">
    <header className="page-intro"><p className="section-label">NEWS</p><h1>{ja ? 'お知らせ' : 'News'}</h1><p>{ja ? 'サイトの更新情報' : 'Site updates'}</p></header>
    {news.length === 0 ? <p className="news-empty">{ja ? 'お知らせはまだありません' : 'No updates yet.'}</p> : <div className="news-list">{news.map(item => <article key={item.slug} id={item.slug} className="news-entry"><div className="news-meta"><time dateTime={item.date}>{item.date.replace(/-/g, '.')}</time><Chip size="small" variant="outlined" label={ja ? 'サイト更新' : 'Site update'} /></div><h2>{item.title[language]}</h2>{item.paragraphs[language].map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article>)}</div>}
  </article>;
}
