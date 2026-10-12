'use client';
import { Alert, Button, Slider } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { advanceDino, applyDinoInput, DinoAction, DinoInput, DinoState, dinoScore, DINO_X, FLOOR, DINO_HEIGHT, newDinoGame, readDinoBest } from '../lib/dino-game';
import { GameAudio } from '../lib/game-audio';
import { RankedSession, rankingApi, rankingError } from '../lib/ranking-api';
import GameNavigation from './GameNavigation';
import GameRanking from './GameRanking';
type Phase='idle'|'loading'|'running'|'paused'|'finished';
export default function DinoGame(){
  const {language}=useLanguage();const ja=language==='ja';
  const [game,setGame]=useState<DinoState>(()=>newDinoGame());const current=useRef(game);
  const [phase,setPhase]=useState<Phase>('idle');const phaseRef=useRef(phase);
  const [session,setSession]=useState<RankedSession|null>(null);const sessionRef=useRef<RankedSession|null>(null);
  const inputs=useRef<DinoInput[]>([]);
  const acknowledged=useRef(0);
  const pending=useRef<{endTick:number;inputs:DinoInput[]}|null>(null);const syncBusy=useRef(false);
  const [verified,setVerified]=useState(false);const [syncing,setSyncing]=useState(false);
  const [error,setError]=useState('');const [best,setBest]=useState(0);
  const [sound,setSound]=useState(true);const soundRef=useRef(true);
  const [volume,setVolume]=useState(35);const volumeRef=useRef(35);
  const [audioUnavailable,setAudioUnavailable]=useState(false);
  const audio=useRef<GameAudio|null>(null);const mounted=useRef(true);const field=useRef<HTMLDivElement>(null);
  const finishedAt=useRef(0);const milestone=useRef(0);const [achievement,setAchievement]=useState(0);
  const update=useCallback((value:DinoState)=>{current.current=value;setGame(value);},[]);
  const changePhase=useCallback((value:Phase)=>{phaseRef.current=value;setPhase(value);},[]);
  useEffect(()=>{
    mounted.current=true;
    try{setBest(readDinoBest(localStorage.getItem('humisan-dino-v2-best')));const enabled=localStorage.getItem('humisan-dino-sound')!=='off';setSound(enabled);soundRef.current=enabled;}catch{/* Play stays available when local preferences are blocked. */}
    return()=>{mounted.current=false;audio.current?.dispose();};
  },[]);
  async function music(){
    if(!soundRef.current)return;
    try{if(!audio.current)audio.current=new GameAudio(volumeRef.current/100);audio.current.setEnabled(true,volumeRef.current/100);await audio.current.startMusic();if(mounted.current)setAudioUnavailable(false);}catch{if(mounted.current)setAudioUnavailable(true);}
  }
  const control=useCallback((action:DinoAction)=>{
    if(phaseRef.current!=='running')return;
    const next=applyDinoInput(current.current,action);
    if(next===current.current)return;
    inputs.current.push({tick:current.current.tick,action});
    if(action==='jump')audio.current?.catch();
    update(next);
  },[update]);
  const synchronize=useCallback(async()=>{
    const active=sessionRef.current;
    if(!active||syncBusy.current)return;
    syncBusy.current=true;if(mounted.current)setSyncing(true);
    try{
      for(let attempt=0;attempt<20;attempt++){
        if(!pending.current){const endTick=Math.min(current.current.tick,acknowledged.current+3600);pending.current={endTick,inputs:inputs.current.filter(input=>input.tick<=endTick)};}
        const packet=pending.current;
        const result=await rankingApi<{score:number;over:boolean}>('/checkpoint',{id:active.id,game:'dino-v2',...packet});
        if(!mounted.current||sessionRef.current?.id!==active.id)return;
        inputs.current.splice(0,packet.inputs.length);acknowledged.current=packet.endTick;pending.current=null;setError('');
        if(result.over){setVerified(true);setError('');break;}
        if(!current.current.over&&current.current.tick-acknowledged.current<3600)break;
      }
    }catch(e){if(mounted.current)setError(rankingError(e instanceof Error?e.message:'NETWORK',ja));}
    finally{syncBusy.current=false;if(mounted.current)setSyncing(false);}
  },[ja]);
  async function start(){
    if(syncBusy.current)return;
    void music();changePhase('loading');setError('');setVerified(false);
    try{
      const width=Math.max(200,Math.min(600,Math.round(field.current?.clientWidth||600)));
      const active=await rankingApi<RankedSession>('/sessions',{game:'dino-v2',width});
      if(!mounted.current)return;
      sessionRef.current=active;setSession(active);inputs.current=[];pending.current=null;acknowledged.current=0;milestone.current=0;setAchievement(0);
      const initial=applyDinoInput(newDinoGame(active.seed,active.width||width),'jump');
      inputs.current.push({tick:0,action:'jump'});update(initial);changePhase('running');void music();field.current?.focus();
    }catch(e){if(mounted.current){changePhase('idle');setError(rankingError(e instanceof Error?e.message:'NETWORK',ja));}audio.current?.stopMusic();}
  }
  function resume(){changePhase('running');void music();field.current?.focus();}
  useEffect(()=>{
    if(phase!=='running'){audio.current?.stopMusic();return;}
    let frame:number;let previous=performance.now();
    function tick(now:number){const next=advanceDino(current.current,(now-previous)/1000);previous=now;update(next);if(!next.over)frame=requestAnimationFrame(tick);}
    frame=requestAnimationFrame(tick);
    function hidden(){if(document.hidden){control('stand');changePhase('paused');}}
    document.addEventListener('visibilitychange',hidden);
    return()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',hidden);};
  },[phase,control,update,changePhase]);
  useEffect(()=>{
    if(!session)return;
    const timer=setInterval(()=>{if(phaseRef.current==='running'||phaseRef.current==='paused')void synchronize();},15000);
    return()=>clearInterval(timer);
  },[session,synchronize]);
  useEffect(()=>{
    if(!game.over||phase!=='running')return;
    finishedAt.current=performance.now();changePhase('finished');audio.current?.stopMusic();audio.current?.finish();
    const score=dinoScore(game);setBest(old=>Math.max(old,score));
    try{localStorage.setItem('humisan-dino-v2-best',String(Math.max(readDinoBest(localStorage.getItem('humisan-dino-v2-best')),score)));}catch{/* The current score stays visible. */}
    field.current?.focus();void synchronize();
  },[game,phase,synchronize,changePhase]);
  const score=dinoScore(game);
  useEffect(()=>{const reached=Math.floor(score/100);if(phase==='running'&&reached>milestone.current){milestone.current=reached;setAchievement(reached);audio.current?.catch();}},[score,phase]);
  function toggleSound(){const enabled=!soundRef.current;soundRef.current=enabled;setSound(enabled);audio.current?.setEnabled(enabled,volumeRef.current/100);try{localStorage.setItem('humisan-dino-sound',enabled?'on':'off');}catch{/* Sound changes for this visit. */}if(enabled&&phaseRef.current==='running')void music();}
  function keyDown(event:React.KeyboardEvent<HTMLDivElement>){
    if(event.target!==event.currentTarget||event.repeat)return;
    if(event.code==='Space'||event.code==='ArrowUp'){event.preventDefault();if(phase==='idle')void start();else if(phase==='running')control('jump');else if(phase==='paused')resume();}
    if(event.code==='ArrowDown'&&phase==='running'){event.preventDefault();control('duck');}
  }
  function keyUp(event:React.KeyboardEvent<HTMLDivElement>){
    if(event.target!==event.currentTarget)return;
    if(event.code==='Space'||event.code==='ArrowUp'){event.preventDefault();if(phase==='finished'&&performance.now()-finishedAt.current>=1200)void start();else control('release');}
    if(event.code==='ArrowDown'){event.preventDefault();control('stand');}
    if(event.code==='Enter'&&phase==='finished'){event.preventDefault();void start();}
  }
  const playerY=FLOOR-DINO_HEIGHT-game.y;const night=game.time<game.nightUntil;
  return <article className="interior-page content-width play-page">
    <header className="page-intro"><p className="section-label">DINO RUN</p><h1>GLASSES RUN</h1><p>{ja?'Google版Dinoの操作で走るメガネ\nスペースでジャンプ ↓でしゃがむ':'Glasses with Chrome Dino controls. Space to jump, ↓ to duck.'}</p></header>
    <GameNavigation />
    {error&&<Alert severity="error" className="rush-message" action={session?<Button onClick={synchronize} disabled={syncing}>{ja?'再試行':'Retry'}</Button>:undefined}>{error}</Alert>}
    <div className="game-audio-controls"><Button className="sound-toggle" aria-pressed={sound} onClick={toggleSound}>{ja?'サウンド':'Sound'} {sound?'ON':'OFF'}</Button><label>{ja?'音量':'Volume'}<Slider className="volume-slider" aria-label={ja?'音量':'Volume'} value={volume} onChange={(_,value)=>{const next=Array.isArray(value)?value[0]:value;if(Number.isFinite(next)){setVolume(next);volumeRef.current=next;audio.current?.setVolume(next/100);}}}/><span>{volume}%</span></label><p>Original BGM: Summer Pixels</p></div>
    {audioUnavailable&&<p role="status" className="audio-message">{ja?'音を再生できません 音なしで続けられます':'Audio could not start. Continue without sound.'}</p>}
    <div className="game-scoreboard"><div><span>{ja?'スコア':'Score'}</span><strong>{score.toString().padStart(5,'0')}</strong></div><div><span>HI</span><strong>{best.toString().padStart(5,'0')}</strong></div><div><span>{ja?'スピード':'Speed'}</span><strong>{(game.speed/game.initialSpeed).toFixed(2)}<small>×</small></strong></div></div>
    <div className={`dino-field${night?' dino-night':''}`} ref={field} tabIndex={0} role="group" aria-label={ja?'メガネDino スペースでジャンプ 下矢印でしゃがむ':'Glasses Dino. Space to jump, Down to duck'} onKeyDown={keyDown} onKeyUp={keyUp} onBlur={()=>{if(phaseRef.current==='running')control('stand');}}
      onPointerDown={event=>{if(phase==='running'){event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);field.current?.focus();control('jump');}}}
      onPointerUp={()=>control('release')} onPointerCancel={()=>control('release')}>
      <svg viewBox={`0 0 ${game.width} 150`} aria-hidden="true" className="dino-scene">
        <text key={achievement} x={game.width-8} y="18" textAnchor="end" className={`dino-canvas-score${achievement?' dino-achievement':''}`}>HI {best.toString().padStart(5,'0')}　{score.toString().padStart(5,'0')}</text>
        <path className="dino-cloud" d={`M${game.width-120} 45h50m-42-8h35`}/>
        {night&&<><circle cx={game.width-55} cy="50" r="10" className="dino-shadow"/><path className="dino-cloud" d="M220 22h3m30 25h3m-80-10h3"/></>}
        <path className="dino-ground" d={`M0 ${FLOOR}H${game.width}`}/>
        {[0,1,2,3,4,5,6].map(n=><path key={n} className="dino-ground" d={`M${n*100-game.distance%100} 146h10`}/>)}
        <ellipse cx={DINO_X+22} cy={FLOOR+3} rx="22" ry="2" className="dino-shadow"/>
        <g transform={`translate(${DINO_X} ${playerY})`} className="dino-sprite">
          <g transform={game.ducking?'translate(0 18) scale(1.475 1.1)':'scale(1.1)'}><path d="M0 2h40v4h-3v8h-3v3H23V6h-6v11H6v-3H3V6H0Z"/><path className="dino-eye" d="M6 5h3v3H6zm3 3h3v3H9zm3-3h3v3h-3zm12 0h3v3h-3zm3 3h3v3h-3zm3-3h3v3h-3z"/></g>
          {!game.ducking&&<><path d="M17 18h10v15H17z"/><path d={Math.floor(game.time*12)%2?'M13 29h6v13h-8v4h13V29m3 0h6v9h-6z':'M13 29h6v9h-6zm14 0h6v13h8v4H27z'}/></>}
        </g>
        {game.obstacles.map(o=><g key={o.id} className="dino-obstacle" transform={`translate(${o.x} ${o.y})`}>
          {o.kind==='bird'?<><path d="M2 17h12l8-7h8v8h12v5H25l-9-2H2z"/><path d={Math.floor(game.time*6)%2?'M18 18l-6-15h8l10 15z':'M18 20l-6 15h8l10-15z'}/></>:Array.from({length:o.count},(_,i)=><g key={i} transform={`translate(${i*(o.width/o.count)} 0)`}><rect x={o.width/o.count*.35} width={o.width/o.count*.3} height={o.height} rx="1"/><path d={`M1 ${o.height*.3}v${o.height*.3}h${o.width/o.count-2}v-${o.height*.4}`} fill="none" stroke="currentColor" strokeWidth="4"/></g>)}
        </g>)}
      </svg>
      {phase!=='running'&&<div className="dino-overlay"><h2>{phase==='finished'?'GAME OVER':phase==='paused'?(ja?'一時停止':'Paused'):'SPACE / TAP'}</h2><Button className="primary-link" disabled={phase==='loading'||syncing} onClick={phase==='paused'?resume:start}>{phase==='loading'?(ja?'接続中':'Connecting'):phase==='paused'?(ja?'再開する':'Resume'):phase==='finished'?(ja?'もう一回':'Restart'):(ja?'スタート':'Start')}</Button></div>}
    </div>
    <div className="game-controls"><p>{ja?'スペース・↑・タップでジャンプ ↓でしゃがむ\n空中の↓は急降下 Enterで再スタート':'Space / ↑ / tap to jump, ↓ to duck or drop, Enter to restart'}</p>{phase==='running'&&<Button onClick={()=>changePhase('paused')}>{ja?'一時停止':'Pause'}</Button>}{phase==='paused'&&<Button onClick={()=>{changePhase('idle');sessionRef.current=null;setSession(null);update(newDinoGame());}}>{ja?'終了する':'End game'}</Button>}</div>
    {phase==='finished'&&syncing&&<p role="status" className="game-hint">{ja?'記録を確認中':'Verifying your result'}</p>}
    <GameRanking key={session?.id||'idle'} game="dino-v2" session={session} finished={phase==='finished'&&verified} record={{version:2}} score={score}/>
  </article>;
}
