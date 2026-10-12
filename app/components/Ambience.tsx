'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';

interface Spark { id: number; x: number; y: number; }

export default function Ambience() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    let frame = 0;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let sequence = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function updateProgress() {
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(distance > 0 ? Math.min(100, Math.max(0, window.scrollY / distance * 100)) : 0);
      frame = 0;
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    }
    function onPointer(event: PointerEvent) {
      if (reducedMotion.matches || event.button !== 0) return;
      const id = ++sequence;
      setSparks(current => [...current.slice(-7), { id, x: event.clientX, y: event.clientY }]);
      const timer = setTimeout(() => {
        setSparks(current => current.filter(spark => spark.id !== id));
        timers.delete(timer);
      }, 700);
      timers.add(timer);
    }
    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('pointerdown', onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointerdown', onPointer);
      timers.forEach(clearTimeout);
    };
  }, [pathname]);

  return <>
    <div className="sky-ambience" aria-hidden="true"><span className="cloud cloud-one" /><span className="cloud cloud-two" /><span className="sky-stars">✦</span></div>
    <div className="reading-progress" role="progressbar" aria-label={language === 'ja' ? 'ページのスクロール位置' : 'Page scroll position'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><span style={{ width: `${progress}%` }} /></div>
    <div className="click-sparks" aria-hidden="true">{sparks.map(spark => <span key={spark.id} style={{ left: spark.x, top: spark.y }}>✧</span>)}</div>
  </>;
}
