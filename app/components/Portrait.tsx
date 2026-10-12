'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Icon from './Icons';

export default function Portrait() {
  const { language, t } = useLanguage();
  const frame = useRef<HTMLButtonElement>(null);
  const [party, setParty] = useState(false);

  return <div className={`portrait-area ${party ? 'portrait-party' : ''}`}>
    <span className="orbit" aria-hidden="true" />
    <Icon name="sparkle" className="portrait-star star-one" />
    <Icon name="sparkle" className="portrait-star star-two" />
    <span className="hello-note" aria-hidden="true">oh, hi!<svg viewBox="0 0 88 56"><path d="M4 5c44-10 73 10 64 35M54 31l14 14 14-12" /></svg></span>
    <button ref={frame} type="button" className="portrait-frame" aria-pressed={party} aria-label={language === 'ja' ? 'アイコンのきらめきを切り替える' : 'Toggle portrait sparkles'} onClick={() => setParty(value => !value)}
      onPointerMove={event => {
        if (!frame.current || event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const box = event.currentTarget.getBoundingClientRect();
        frame.current.style.setProperty('--tilt-x', `${((event.clientY - box.top) / box.height - .5) * -8}deg`);
        frame.current.style.setProperty('--tilt-y', `${((event.clientX - box.left) / box.width - .5) * 8}deg`);
      }} onPointerLeave={() => {
        frame.current?.style.setProperty('--tilt-x', '0deg');
        frame.current?.style.setProperty('--tilt-y', '0deg');
      }}>
      <Image src="/icon.png" alt={t('hero.image')} width={1024} height={1024} priority sizes="(max-width: 700px) 82vw, (max-width: 1000px) 42vw, 440px" className="portrait-image" />
      <span className="portrait-caption"><span>SUMMER STATE OF MIND</span><Icon name="glasses" /></span>
    </button>
    <div className="portrait-sticker"><span aria-hidden="true">✳</span>{t('hero.caption')}</div>
    {party && <div className="portrait-confetti" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <span key={index} style={{ '--i': index } as React.CSSProperties}>✦</span>)}</div>}
  </div>;
}
