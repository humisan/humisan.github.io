'use client';
import { Alert, Button, CircularProgress } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { RUSH_DURATION, rushTargets, RushShot, scoreRush } from '../lib/target-rush';
import GameRanking from './GameRanking';
import Icon from './Icons';
import { RankedSession, rankingApi, rankingError } from '../lib/ranking-api';
import GameNavigation from './GameNavigation';
import { GameAudio } from '../lib/game-audio';

type Phase = 'idle' | 'loading' | 'running' | 'finished';
export default function TargetRush() {
  const { language } = useLanguage();
  const ja = language === 'ja';
  const [phase, setPhase] = useState<Phase>('idle');
  const [session, setSession] = useState<RankedSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [shots, setShots] = useState<RushShot[]>([]);
  const shotRef = useRef<RushShot[]>([]);
  const started = useRef(0);
  const [error, setError] = useState('');
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const [sound, setSound] = useState(true);
  const soundRef = useRef(true);
  const audio = useRef<GameAudio | null>(null);
  const mounted = useRef(true);
  const stats = scoreRush(session?.seed || 0, shots);
  const target = session ? rushTargets(session.seed).find(t => elapsed >= t.start && elapsed <= t.end && !stats.hitIds.has(t.id)) : undefined;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; audio.current?.dispose(); };
  }, []);
  async function start() {
    setPhase('loading'); setError('');
    audio.current?.stopMusic();
    if (soundRef.current) {
      try { if (!audio.current) audio.current = new GameAudio(.25); void audio.current.startMusic().then(() => setAudioUnavailable(false)).catch(() => setAudioUnavailable(true)); } catch { setAudioUnavailable(true); }
    }
    try {
      const next = await rankingApi<RankedSession>('/sessions', {game:'rush'});
      if (!mounted.current) return;
      setSession(next); shotRef.current = []; setShots([]); setElapsed(0); started.current = performance.now(); setPhase('running');
    } catch (e) { if (mounted.current) { setPhase('idle'); setError(rankingError(e instanceof Error ? e.message : 'NETWORK',ja)); } audio.current?.stopMusic(); }
  }
  useEffect(() => {
    if (phase !== 'running') return;
    let frame: number;
    function tick() {
      const time = Math.min(RUSH_DURATION, performance.now() - started.current);
      setElapsed(time);
      if (time >= RUSH_DURATION) { setPhase('finished'); audio.current?.stopMusic(); audio.current?.finish(); }
      else frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    function stopHidden() { if (document.hidden) { cancelAnimationFrame(frame); setPhase('idle'); setSession(null); setError(ja ? 'ページを離れたためプレイを終了しました\nもう一度スタートしてください' : 'The round ended because the page was hidden. Start again.'); audio.current?.stopMusic(); } }
    document.addEventListener('visibilitychange', stopHidden);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', stopHidden); };
  }, [phase, ja]);
  function shoot(event: React.PointerEvent<HTMLDivElement>) {
    if (phase !== 'running' || !session || !event.isTrusted || !event.isPrimary || event.button !== 0) return;
    const t = performance.now() - started.current;
    const previous = shotRef.current[shotRef.current.length - 1];
    if (t > RUSH_DURATION || (previous && t - previous.t < 40) || shotRef.current.length >= 240) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const shot = { t, x: (event.clientX - bounds.left) / bounds.width * 100, y: (event.clientY - bounds.top) / bounds.height * 100 };
    const next = [...shotRef.current, shot];
    if (scoreRush(session.seed, next).hits > stats.hits) audio.current?.catch();
    shotRef.current = next; setShots(next);
  }
  return <article className="interior-page content-width play-page">
    <header className="page-intro"><p className="section-label">AIM / SPEED / COMBO</p><h1>TARGET RUSH</h1><p>{ja ? '30秒で的を狙おう\n速さ・正確さ・連続ヒットでスコアを伸ばせ' : 'Aim for 30 seconds. Speed, accuracy, and combos raise your score.'}</p></header>
    <GameNavigation />
    <div className="game-audio-controls"><Button aria-pressed={sound} className="sound-toggle" onClick={() => { const enabled = !sound; setSound(enabled); soundRef.current = enabled; audio.current?.setEnabled(enabled, .25); if (enabled && phase === 'running') void audio.current?.startMusic().then(() => setAudioUnavailable(false)).catch(() => setAudioUnavailable(true)); }}>{ja ? 'サウンド' : 'Sound'} {sound ? 'ON' : 'OFF'}</Button><p>{ja ? '的はクリック・タップ専用' : 'Targets accept clicks and taps only'}</p></div>
    {audioUnavailable && <p role="status" className="audio-message">{ja ? '音を再生できません 音なしで続けられます' : 'Audio could not start. You can continue without sound.'}</p>}
    <div className="game-scoreboard"><div><span>{ja ? 'スコア' : 'Score'}</span><strong>{stats.score}</strong></div><div><span>{ja ? '残り時間' : 'Time left'}</span><strong>{Math.ceil((RUSH_DURATION - elapsed) / 1000)}<small>s</small></strong></div><div><span>COMBO</span><strong>{stats.combo}</strong></div></div>
    <div className="rush-field" onPointerDown={shoot} role="group" aria-label={ja ? '的をクリック・タップするゲーム' : 'Click or tap targets'}>
      {phase === 'running' && target && <span className="rush-target" aria-hidden="true" style={{ left: `${target.x}%`, top: `${target.y}%` }}><Icon name="glasses" /></span>}
      {phase === 'running' && !target && <span className="rush-ready" aria-hidden="true">{elapsed < 1000 ? 'READY' : '+'}</span>}
      {phase !== 'running' && <div className="rush-overlay"><h2>{phase === 'finished' ? `${stats.score} POINTS` : 'TARGET RUSH'}</h2><Button className="primary-link" onClick={start} disabled={phase === 'loading'}>{phase === 'loading' ? <CircularProgress size={20} /> : ja ? (phase === 'finished' ? 'もう一回' : 'スタート') : (phase === 'finished' ? 'Play again' : 'Start')}</Button></div>}
    </div>
    <p className="game-hint">{ja ? '的の中心に近いほど高得点\n連続ヒットは最大5コンボまでボーナス' : 'Aim near the center for more points. Combo bonuses grow up to five hits.'}</p>
    {error && <Alert severity="error" className="rush-message">{error}</Alert>}
    <GameRanking key={session?.id || 'idle'} game="rush" session={session} finished={phase === 'finished'} record={shots} score={stats.score} />
  </article>;
}
