'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { advanceGame, catchTarget, newGame, readBestScore } from '../lib/catch-game';
import Icon from './Icons';
import { GameAudio } from '../lib/game-audio';

type Phase = 'idle' | 'running' | 'paused' | 'finished';

export default function CatchGame() {
  const { language } = useLanguage();
  const ja = language === 'ja';
  const [game, setGame] = useState(newGame);
  const [phase, setPhase] = useState<Phase>('idle');
  const [best, setBest] = useState(0);
  const field = useRef<HTMLDivElement>(null);
  const audio = useRef<GameAudio | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(35);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const remainingSeconds = Math.ceil(game.remaining);

  useEffect(() => {
    try { setSoundEnabled(localStorage.getItem('humisan-catch-sound') !== 'off'); } catch { /* Use the default sound preference. */ }
    return () => audio.current?.dispose();
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
    const timer = setInterval(() => {
      const now = performance.now();
      const elapsed = (now - previous) / 1000;
      previous = now;
      setGame(current => advanceGame(current, elapsed));
    }, 100);
    function pauseWhenHidden() {
      if (document.hidden) setPhase('paused');
    }
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', pauseWhenHidden); };
  }, [phase]);

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

  function start() {
    void playMusic();
    setGame(newGame());
    setPhase('running');
    field.current?.focus();
  }

  return <article className="interior-page content-width play-page">
    <header className="page-intro"><p className="section-label">TAKE A LITTLE BREAK</p><h1>{ja ? 'ちょっと、遊んでいく？' : 'Stay for a little play?'}</h1><p>{ja ? 'サングラスを集めよう\n30秒で、いくつキャッチできる？' : 'Collect the sunglasses. How many can you catch in 30 seconds?'}</p></header>
    <div className="game-audio-controls"><button type="button" className="sound-toggle" aria-pressed={soundEnabled} onClick={toggleSound}>{ja ? (soundEnabled ? 'サウンド ON' : 'サウンド OFF') : (soundEnabled ? 'Sound ON' : 'Sound OFF')}<span aria-hidden="true">{soundEnabled ? '♪' : '—'}</span></button><label>{ja ? '音量' : 'Volume'}<input type="range" min="0" max="100" value={volume} onChange={event => { const parsed = Number(event.target.value); const next = Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 35; setVolume(next); audio.current?.setVolume(next / 100); }} /><span>{volume}%</span></label><p>{ja ? 'オリジナルBGM「Summer Pixels」' : 'Original BGM: Summer Pixels'}</p></div>
    {audioUnavailable && <p className="audio-message" role="status">{ja ? 'このブラウザーでは音を再生できません\nサウンドをONにし直すか、音なしで遊べます' : 'Audio could not start. Toggle sound on again, or play without audio.'}</p>}
    <div className="game-scoreboard"><div><span>{ja ? 'スコア' : 'Score'}</span><strong>{game.score.toString().padStart(2, '0')}</strong></div><div><span>{ja ? '残り時間' : 'Time left'}</span><strong>{Math.ceil(game.remaining)}<small>s</small></strong></div><div><span>{ja ? '自己ベスト' : 'Personal best'}</span><strong>{best.toString().padStart(2, '0')}</strong></div></div>
    <div className="game-field" ref={field} tabIndex={-1} aria-label={ja ? 'サングラスをキャッチするゲーム' : 'Sunglasses catch game'}>
      <span className="game-sun" aria-hidden="true" />
      {phase === 'running' && game.targets.map(target => <button key={target.id} type="button" className="game-target" style={{ left: `${target.x}%`, top: `${target.y}%` }} aria-label={ja ? `サングラス ${target.id} をキャッチ` : `Catch sunglasses ${target.id}`} onClick={() => { audio.current?.catch(); setGame(current => catchTarget(current, target.id)); field.current?.focus(); }}><Icon name="glasses" /></button>)}
      {phase !== 'running' && <div className="game-overlay"><Icon name="glasses" /><h2>{phase === 'finished' ? (ja ? `${game.score}個、キャッチ！` : `${game.score} caught!`) : phase === 'paused' ? (ja ? 'ひと休み中' : 'Taking a break.') : (ja ? '夏のサングラス集め' : 'A summer sunglasses hunt.')}</h2><p>{phase === 'paused' ? (ja ? '残り時間はそのまま\n準備ができたら再開しよう' : 'Your time is saved. Resume when you are ready.') : (ja ? '現れたサングラスを、タップしてキャッチ' : 'Tap the sunglasses as they appear.')}</p><button type="button" className="primary-link" onClick={phase === 'paused' ? resume : start}>{phase === 'paused' ? (ja ? '再開する' : 'Resume') : phase === 'finished' ? (ja ? 'もう一回！' : 'Play again!') : (ja ? 'スタート' : 'Start')}</button></div>}
    </div>
    <div className="game-controls"><p>{ja ? 'タップ・クリック、または Tab と Enter でキャッチ' : 'Catch with a tap, a click, or Tab and Enter.'}</p>{phase === 'running' && <button type="button" onClick={() => setPhase('paused')}>{ja ? '一時停止' : 'Pause'}</button>}{phase === 'paused' && <button type="button" onClick={() => { setPhase('idle'); setGame(newGame()); }}>{ja ? '終了する' : 'End game'}</button>}</div>
    <p className="game-result" role="status">{phase === 'finished' ? (ja ? `終了！ スコア ${game.score}、自己ベスト ${best}` : `Finished! Score ${game.score}, personal best ${best}.`) : ''}</p>
  </article>;
}
