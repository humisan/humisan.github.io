'use client';

import { Button, Slider } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { catchTargets, CatchRecord, rankedCatchState, newGame, readBestScore } from '../lib/catch-game';
import Icon from './Icons';
import GameRanking from './GameRanking';
import { RankedSession, rankingApi, rankingError } from '../lib/ranking-api';
import GameNavigation from './GameNavigation';
import { GameAudio } from '../lib/game-audio';

type Phase = 'loading' | 'idle' | 'running' | 'paused' | 'finished';

export default function CatchGame() {
  const { language } = useLanguage();
  const ja = language === 'ja';
  const [game, setGame] = useState(newGame);
  const [phase, setPhase] = useState<Phase>('idle');
  const [session, setSession] = useState<RankedSession | null>(null);
  const [connectionError, setConnectionError] = useState('');
  const caught = useRef(new Set<number>());
  const records = useRef<CatchRecord[]>([]);
  const played = useRef(0);
  const clock = useRef(0);
  const mounted = useRef(true);
  const [best, setBest] = useState(0);
  const field = useRef<HTMLDivElement>(null);
  const audio = useRef<GameAudio | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(35);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const remainingSeconds = Math.ceil(game.remaining);

  useEffect(() => {
    mounted.current = true;
    try { setSoundEnabled(localStorage.getItem('humisan-catch-sound') !== 'off'); } catch { /* Use the default sound preference. */ }
    return () => { mounted.current = false; audio.current?.dispose(); };
  }, []);

  useEffect(() => {
    if (phase !== 'running') audio.current?.stopMusic();
  }, [phase]);

  useEffect(() => {
    if (phase === 'running' && remainingSeconds > 0 && remainingSeconds <= 3) audio.current?.countdown();
  }, [phase, remainingSeconds]);

  async function playMusic() {
    if (!soundEnabled) return;
    try {
      if (!audio.current) audio.current = new GameAudio(volume / 100);
      audio.current.setEnabled(true, volume / 100);
      await audio.current.startMusic();
      setAudioUnavailable(false);
    } catch {
      setAudioUnavailable(true);
    }
  }

  function toggleSound() {
    const enabled = !soundEnabled;
    setSoundEnabled(enabled);
    try { localStorage.setItem('humisan-catch-sound', enabled ? 'on' : 'off'); } catch { /* Sound still changes for this visit. */ }
    try {
      if (!audio.current && enabled) audio.current = new GameAudio(volume / 100);
      audio.current?.setEnabled(enabled, volume / 100);
      if (enabled && phase === 'running') void audio.current?.startMusic().then(() => setAudioUnavailable(false)).catch(() => setAudioUnavailable(true));
    } catch { setAudioUnavailable(true); }
  }

  function resume() {
    void playMusic();
    setPhase('running');
  }

  useEffect(() => {
    try { setBest(readBestScore(localStorage.getItem('humisan-catch-best'))); } catch { /* The game works without persistent storage. */ }
  }, []);

  useEffect(() => {
    if (phase !== 'running') return;
    let previous = performance.now();
    clock.current = previous;
    const timer = setInterval(() => {
      const now = performance.now();
      const elapsed = (now - previous) / 1000;
      previous = now;
      played.current += elapsed * 1000;
      clock.current = now;
      if (session) setGame(rankedCatchState(session.seed, played.current, caught.current));
    }, 100);
    function pauseWhenHidden() {
      if (document.hidden) setPhase('paused');
    }
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', pauseWhenHidden); };
  }, [phase, session]);

  useEffect(() => {
    if (phase !== 'running' || game.remaining > 0) return;
    setPhase('finished');
    audio.current?.stopMusic();
    audio.current?.finish();
    setBest(previous => Math.max(previous, game.score));
    try {
      const stored = readBestScore(localStorage.getItem('humisan-catch-best'));
      localStorage.setItem('humisan-catch-best', String(Math.max(stored, best, game.score)));
    } catch { /* Keep the result available for this visit. */ }
    field.current?.focus();
  }, [phase, game.remaining, game.score, best]);

  async function start() {
    void playMusic(); setPhase('loading'); setConnectionError('');
    try {
      const next = await rankingApi<RankedSession>('/sessions', { game: 'catch' });
      if (!mounted.current) return;
      setSession(next); caught.current = new Set(); records.current = []; played.current = 0;
      setGame(newGame()); setPhase('running'); void playMusic(); field.current?.focus();
    } catch (e) { if (mounted.current) { setPhase('idle'); setConnectionError(rankingError(e instanceof Error ? e.message : 'NETWORK',ja)); } }
  }
  function catchGlasses(id: number) {
    if (!session || phase !== 'running' || caught.current.has(id)) return;
    const t = Math.min(30000, played.current + performance.now() - clock.current);
    const last = records.current[records.current.length - 1];
    if ((last && t - last.t < 40) || !catchTargets(session.seed, t).some(target => target.id === id)) return;
    caught.current.add(id); records.current.push({id,t});
    audio.current?.catch();
    setGame(current => ({ ...current, score: caught.current.size, targets: current.targets.filter(target => target.id !== id) }));
    field.current?.focus();
  }

  return <article className="interior-page content-width play-page">
    <header className="page-intro"><p className="section-label">TAKE A LITTLE BREAK</p><h1>{ja ? 'ミニゲーム' : 'Stay for a little play?'}</h1><p>{ja ? 'サングラスを集めよう\n30秒でいくつキャッチできる？' : 'Collect the sunglasses. How many can you catch in 30 seconds?'}</p></header>
    <GameNavigation />
    {connectionError && <p role="alert" className="rush-message">{connectionError}</p>}
    <div className="game-audio-controls"><Button type="button" className="sound-toggle" aria-pressed={soundEnabled} onClick={toggleSound}>{ja ? (soundEnabled ? 'サウンド ON' : 'サウンド OFF') : (soundEnabled ? 'Sound ON' : 'Sound OFF')}<span aria-hidden="true">{soundEnabled ? '♪' : '—'}</span></Button><label>{ja ? '音量' : 'Volume'}<Slider className="volume-slider" aria-label={ja ? '音量' : 'Volume'} min={0} max={100} value={volume} onChange={(_, value) => { const parsed = Array.isArray(value) ? value[0] : value; const next = Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 35; setVolume(next); audio.current?.setVolume(next / 100); }} /><span>{volume}%</span></label><p>{ja ? 'オリジナルBGM「Summer Pixels」' : 'Original BGM: Summer Pixels'}</p></div>
    {audioUnavailable && <p className="audio-message" role="status">{ja ? 'このブラウザーでは音を再生できません\nサウンドをONにし直すか音なしで遊べます' : 'Audio could not start. Toggle sound on again, or play without audio.'}</p>}
    <div className="game-scoreboard"><div><span>{ja ? 'スコア' : 'Score'}</span><strong>{game.score.toString().padStart(2, '0')}</strong></div><div><span>{ja ? '残り時間' : 'Time left'}</span><strong>{Math.ceil(game.remaining)}<small>s</small></strong></div><div><span>{ja ? '自己ベスト' : 'Personal best'}</span><strong>{best.toString().padStart(2, '0')}</strong></div></div>
    <div className="game-field" ref={field} tabIndex={-1} aria-label={ja ? 'サングラスをキャッチするゲーム' : 'Sunglasses catch game'}>
      <span className="game-sun" aria-hidden="true" />
      {phase === 'running' && game.targets.map(target => <Button key={target.id} type="button" className="game-target" style={{ left: `${target.x}%`, top: `${target.y}%` }} aria-label={ja ? `サングラス ${target.id} をキャッチ` : `Catch sunglasses ${target.id}`} onClick={() => catchGlasses(target.id)}><Icon name="glasses" /></Button>)}
      {phase !== 'running' && <div className="game-overlay"><Icon name="glasses" /><h2>{phase === 'finished' ? (ja ? `${game.score}個キャッチ！` : `${game.score} caught!`) : phase === 'paused' ? (ja ? 'ひと休み中' : 'Taking a break.') : (ja ? '夏のサングラス集め' : 'A summer sunglasses hunt.')}</h2><p>{phase === 'paused' ? (ja ? '残り時間はそのまま\n準備ができたら再開しよう' : 'Your time is saved. Resume when you are ready.') : (ja ? '現れたサングラスをタップしてキャッチ' : 'Tap the sunglasses as they appear.')}</p><Button type="button" className="primary-link" disabled={phase === 'loading'} onClick={phase === 'paused' ? resume : start}>{phase === 'loading' ? (ja ? '接続中' : 'Connecting') : phase === 'paused' ? (ja ? '再開する' : 'Resume') : phase === 'finished' ? (ja ? 'もう一回！' : 'Play again!') : (ja ? 'スタート' : 'Start')}</Button></div>}
    </div>
    <div className="game-controls"><p>{ja ? 'タップ・クリックか Tab と Enter でキャッチ' : 'Catch with a tap, a click, or Tab and Enter.'}</p>{phase === 'running' && <Button type="button" onClick={() => setPhase('paused')}>{ja ? '一時停止' : 'Pause'}</Button>}{phase === 'paused' && <Button type="button" onClick={() => { setPhase('idle'); setGame(newGame()); }}>{ja ? '終了する' : 'End game'}</Button>}</div>
    <p className="game-result" role="status">{phase === 'finished' ? (ja ? `終了！ スコア ${game.score} / 自己ベスト ${best}` : `Finished! Score ${game.score}, personal best ${best}.`) : ''}</p>
    <GameRanking key={session?.id || 'idle'} game="catch" session={session} finished={phase === 'finished'} record={records.current} score={game.score} />
  </article>;
}
