'use client';
import { Button, Slider } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { advanceDino, DinoState, dinoScore, dinoSpeed, DINO_HEIGHT, DINO_X, FLOOR, jumpDino, newDinoGame, readDinoBest } from '../lib/dino-game';
import { GameAudio } from '../lib/game-audio';
import GameRanking from './GameRanking';
import { RankedSession, rankingApi, rankingError, seededRandom } from '../lib/ranking-api';
import GameNavigation from './GameNavigation';

type Phase = 'loading' | 'idle' | 'running' | 'paused' | 'finished';
export default function DinoGame() {
  const { language } = useLanguage();
  const ja = language === 'ja';
  const [game, setGame] = useState<DinoState>(newDinoGame);
  const current = useRef(game);
  const [phase, setPhase] = useState<Phase>('idle');
  const [session, setSession] = useState<RankedSession | null>(null);
  const [connectionError, setConnectionError] = useState('');
  const random = useRef<() => number>(() => .5);
  const jumps = useRef<number[]>([]);
  const mounted = useRef(true);
  const [best, setBest] = useState(0);
  const [sound, setSound] = useState(true);
  const [volume, setVolume] = useState(35);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const audio = useRef<GameAudio | null>(null);
  const field = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mounted.current = true;
    try {
      setBest(readDinoBest(localStorage.getItem('humisan-dino-best')));
      setSound(localStorage.getItem('humisan-dino-sound') !== 'off');
    } catch { /* Play remains available without storage. */ }
    return () => { mounted.current = false; audio.current?.dispose(); };
  }, []);

  function update(next: DinoState) { current.current = next; setGame(next); }
  async function music(enabled = sound) {
    if (!enabled) return;
    try {
      if (!audio.current) audio.current = new GameAudio(volume / 100);
      audio.current.setEnabled(true, volume / 100);
      await audio.current.startMusic();
      setAudioUnavailable(false);
    } catch { setAudioUnavailable(true); }
  }
  async function start() {
    void music(); setPhase('loading'); setConnectionError('');
    try {
      const next = await rankingApi<RankedSession>('/sessions', {game:'dino'});
      if (!mounted.current) return;
      setSession(next); random.current = seededRandom(next.seed); jumps.current = [];
      update(newDinoGame()); setPhase('running'); void music(); field.current?.focus();
    } catch (e) { if (mounted.current) { setPhase('idle'); setConnectionError(rankingError(e instanceof Error ? e.message : 'NETWORK',ja)); } }
  }
  function resume() { setPhase('running'); void music(); field.current?.focus(); }
  function jump() {
    if (phase !== 'running') return;
    const next = jumpDino(current.current);
    if (next !== current.current) { jumps.current.push(current.current.time * 1000); update(next); audio.current?.catch(); }
  }
  function toggleSound() {
    const enabled = !sound;
    setSound(enabled);
    try { localStorage.setItem('humisan-dino-sound', enabled ? 'on' : 'off'); } catch { /* Keep the preference for this visit. */ }
    audio.current?.setEnabled(enabled, volume / 100);
    if (enabled && phase === 'running') void music(enabled);
  }

  useEffect(() => {
    if (phase !== 'running') { audio.current?.stopMusic(); return; }
    let frame: number;
    let previous = performance.now();
    function tick(now: number) {
      let next = advanceDino(current.current, (now - previous) / 1000, random.current);
      if (next.time >= 600) next = {...next,time:600,over:true};
      previous = now;
      current.current = next;
      setGame(next);
      if (!next.over) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    function pauseHidden() { if (document.hidden) setPhase('paused'); }
    document.addEventListener('visibilitychange', pauseHidden);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', pauseHidden); };
  }, [phase]);

  useEffect(() => {
    if (!game.over || phase !== 'running') return;
    setPhase('finished');
    audio.current?.stopMusic();
    audio.current?.finish();
    const score = dinoScore(game);
    setBest(previous => Math.max(previous, score));
    try {
      localStorage.setItem('humisan-dino-best', String(Math.max(readDinoBest(localStorage.getItem('humisan-dino-best')), score)));
    } catch { /* Results remain visible if saving is blocked. */ }
    field.current?.focus();
  }, [game, phase]);

  return <article className="interior-page content-width play-page">
    <header className="page-intro"><p className="section-label">DINO RUN</p><h1>GLASSES RUN</h1><p>{ja ? 'メガネ版Dino\nジャンプで障害物を避けよう\n走るほどスピードが上がります' : 'Jump over obstacles. The longer you run, the faster it gets.'}</p></header>
    <GameNavigation />
    {connectionError && <p role="alert" className="rush-message">{connectionError}</p>}
    <div className="game-audio-controls"><Button className="sound-toggle" aria-pressed={sound} onClick={toggleSound}>{ja ? 'サウンド' : 'Sound'} {sound ? 'ON' : 'OFF'}</Button><label>{ja ? '音量' : 'Volume'}<Slider className="volume-slider" aria-label={ja ? '音量' : 'Volume'} value={volume} min={0} max={100} onChange={(_, value) => { const v = Array.isArray(value) ? value[0] : value; if (Number.isFinite(v)) { setVolume(v); audio.current?.setVolume(v / 100); } }} /><span>{volume}%</span></label><p>Original BGM: Summer Pixels</p></div>
    {audioUnavailable && <p className="audio-message" role="status">{ja ? '音を再生できません\nサウンドをONにし直すか音なしで遊べます' : 'Audio could not start. Toggle sound on again or play without audio.'}</p>}
    <div className="game-scoreboard"><div><span>{ja ? 'スコア' : 'Score'}</span><strong>{dinoScore(game)}</strong></div><div><span>{ja ? '自己ベスト' : 'Personal best'}</span><strong>{best}</strong></div><div><span>{ja ? 'スピード' : 'Speed'}</span><strong>{(dinoSpeed(game) / 260).toFixed(2)}<small>×</small></strong></div></div>
    <div className="dino-field" ref={field} tabIndex={0} role="group" aria-label={ja ? 'メガネDino スペースキーか上矢印でジャンプ' : 'Dino game. Press Space or Arrow Up to jump'} onPointerDown={event => { if (phase === 'running') { event.preventDefault(); field.current?.focus(); jump(); } }} onKeyDown={event => { if (event.target !== event.currentTarget || event.repeat) return; if (event.code === 'Space' || event.code === 'ArrowUp') { event.preventDefault(); if (phase === 'idle' || phase === 'finished') start(); else if (phase === 'paused') resume(); else jump(); } }}>
      <svg viewBox="0 0 800 300" preserveAspectRatio="xMinYMid slice" aria-hidden="true" className="dino-scene">
        <path className="dino-cloud" d="M500 60h75m-65-12h45M650 100h90m-80-12h60" />
        <path className="dino-ground" d={`M0 ${FLOOR}H800`} />
        {[0,1,2,3,4,5,6,7].map(n => <path key={n} className="dino-ground" d={`M${(n * 120 - game.time * 100 % 120)} 254h12`} />)}
        <ellipse cx={DINO_X + 28} cy={FLOOR + 5} rx={Math.max(10, 25 - game.y / 8)} ry="3" className="dino-shadow" />
        <g transform={`translate(${DINO_X} ${FLOOR - DINO_HEIGHT - game.y}) scale(1.4)`} className="dino-sprite">
          <path d="M0 2h40v4h-3v8h-3v3H23V6h-6v11H6v-3H3V6H0Z" />
          <path className="dino-eye" d="M6 5h3v3H6zm3 3h3v3H9zm3-3h3v3h-3zm12 0h3v3h-3zm3 3h3v3h-3zm3-3h3v3h-3z" />
        </g>
        {game.obstacles.map(o => <g key={o.id} className="dino-obstacle" transform={`translate(${o.x} ${FLOOR - o.height})`}><rect x={o.width * .35} width={o.width * .3} height={o.height} rx="2" /><path d={`M0 ${o.height * .28}v${o.height * .32}h${o.width}v-${o.height * .42}`} fill="none" stroke="currentColor" strokeWidth="6" /></g>)}
      </svg>
      {phase !== 'running' && <div className="dino-overlay"><h2>{phase === 'finished' ? (ja ? 'ゲームオーバー' : 'Game over') : phase === 'paused' ? (ja ? '一時停止' : 'Paused') : 'GLASSES RUN'}</h2><Button className="primary-link" disabled={phase === 'loading'} onClick={phase === 'paused' ? resume : start}>{phase === 'loading' ? (ja ? '接続中' : 'Connecting') : phase === 'paused' ? (ja ? '再開する' : 'Resume') : phase === 'finished' ? (ja ? 'もう一回' : 'Play again') : (ja ? 'スタート' : 'Start')}</Button></div>}
    </div>
    <div className="game-controls"><p>{ja ? 'スペース・↑キー・タップでジャンプ' : 'Jump with Space, ↑, or a tap'}</p>{phase === 'running' && <Button onClick={() => setPhase('paused')}>{ja ? '一時停止' : 'Pause'}</Button>}{phase === 'paused' && <Button onClick={() => { setPhase('idle'); update(newDinoGame()); }}>{ja ? '終了する' : 'End game'}</Button>}</div>
    <p role="status" className="game-result">{phase === 'finished' ? (ja ? `スコア ${dinoScore(game)} / 自己ベスト ${best}` : `Score ${dinoScore(game)} / Personal best ${best}`) : ''}</p>
    <GameRanking key={session?.id || 'idle'} game="dino" session={session} finished={phase === 'finished'} record={{jumps:jumps.current,elapsed:game.time*1000}} score={dinoScore(game)} />
  </article>;
}
