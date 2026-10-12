// Gameplay constants and collision geometry follow Chromium's standard runner.
// See docs/dino-reference.md for source and attribution.
export const FIELD_WIDTH = 600;
export const FLOOR = 140;
export const DINO_X = 50;
export const DINO_WIDTH = 44;
export const DINO_HEIGHT = 47;
export const FRAME_MS = 1000 / 60;
export type DinoAction = 'jump' | 'release' | 'duck' | 'stand';
export interface DinoInput { tick: number; action: DinoAction; }
export interface CollisionBox { x: number; y: number; width: number; height: number; }
export interface Obstacle { id:number; kind:'small'|'large'|'bird'; x:number; y:number; width:number; height:number; count:number; gap:number; offset:number; boxes:CollisionBox[]; }
export interface DinoState {
  tick:number; time:number; remainder:number; width:number; initialSpeed:number; speed:number; distance:number;
  y:number; velocity:number; jumping:boolean; reachedMinimum:boolean; ducking:boolean; down:boolean; dropping:boolean;
  obstacles:Obstacle[]; nextId:number; history:Obstacle['kind'][]; random:number; over:boolean; nightUntil:number; nightMilestone:number;
}
const standing:CollisionBox[] = [
  {x:22,y:0,width:17,height:16},{x:1,y:18,width:30,height:9},{x:10,y:35,width:14,height:8},
  {x:1,y:24,width:29,height:5},{x:5,y:30,width:21,height:4},{x:9,y:34,width:15,height:4},
];
const ducking:CollisionBox[] = [{x:1,y:18,width:55,height:25}];
const obstacleShapes = {
  small:{width:17,height:35,y:105,minGap:120,multipleSpeed:4,boxes:[{x:0,y:7,width:5,height:27},{x:4,y:0,width:6,height:34},{x:10,y:4,width:7,height:14}]},
  large:{width:25,height:50,y:90,minGap:120,multipleSpeed:7,boxes:[{x:0,y:12,width:7,height:38},{x:8,y:0,width:7,height:49},{x:13,y:10,width:10,height:38}]},
  bird:{width:46,height:40,y:75,minGap:150,multipleSpeed:999,boxes:[{x:15,y:15,width:16,height:5},{x:18,y:21,width:24,height:6},{x:2,y:14,width:4,height:3},{x:6,y:10,width:4,height:7},{x:10,y:8,width:6,height:9}]},
};
export function newDinoGame(seed = 1, width = FIELD_WIDTH): DinoState {
  const safeWidth=Number.isFinite(width)?Math.max(200,Math.min(600,Math.round(width))):600;
  const speed=Math.min(6,6*safeWidth/600*1.2);
  return {tick:0,time:0,remainder:0,width:safeWidth,initialSpeed:speed,speed,distance:0,y:0,velocity:0,jumping:false,reachedMinimum:false,ducking:false,down:false,dropping:false,obstacles:[],nextId:1,history:[],random:seed>>>0,over:false,nightUntil:0,nightMilestone:0};
}
export function applyDinoInput(state:DinoState, action:DinoAction):DinoState {
  if(state.over)return state;
  if(action==='jump')return state.jumping||state.ducking?state:{...state,jumping:true,velocity:10+state.speed/10,reachedMinimum:false,dropping:false};
  if(action==='release')return state.jumping&&state.reachedMinimum&&state.velocity>5?{...state,velocity:5}:state;
  if(action==='duck')return state.down?state:{...state,down:true,ducking:!state.jumping,dropping:state.jumping,velocity:state.jumping?-1:state.velocity};
  return state.down||state.ducking||state.dropping?{...state,down:false,ducking:false,dropping:false}:state;
}
export const jumpDino=(state:DinoState)=>applyDinoInput(state,'jump');
export function dinoScore(state:DinoState):number {return Math.round(Math.ceil(state.distance)*.025);}
export function dinoSpeed(state:DinoState):number {return state.speed*60;}
export function readDinoBest(value:string|null):number {const n=Number(value);return Number.isSafeInteger(n)&&n>=0&&n<=100000000?n:0;}
export function dinoCollides(state:DinoState, obstacle:Obstacle):boolean {
  const baseY=FLOOR-DINO_HEIGHT-state.y;
  return (state.ducking?ducking:standing).some(p=>obstacle.boxes.some(o=>
    DINO_X+p.x<obstacle.x+o.x+o.width && DINO_X+p.x+p.width>obstacle.x+o.x &&
    baseY+p.y<obstacle.y+o.y+o.height && baseY+p.y+p.height>obstacle.y+o.y));
}
function spawn(state:DinoState):DinoState {
  let randomState=state.random;
  const random=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;};
  const kinds:Obstacle['kind'][]=state.speed>=8.5?['small','large','bird']:['small','large'];
  const candidates=kinds.filter(kind=>!(state.history.length===2&&state.history.every(previous=>previous===kind)));
  const kind=candidates[Math.floor(random()*candidates.length)]!;
  const shape=obstacleShapes[kind];
  const drawnCount=1+Math.floor(random()*3);
  const count=state.speed>=shape.multipleSpeed?drawnCount:1;
  const width=shape.width*count;
  const boxes=shape.boxes.map(box=>({...box}));
  if(count>1){boxes[1]!.width=width-boxes[0]!.width-boxes[2]!.width;boxes[2]!.x=width-boxes[2]!.width;}
  const heights=state.width<600?[100,50]:[100,75,50];
  const y=kind==='bird'?heights[Math.floor(random()*heights.length)]!:shape.y;
  const offset=kind==='bird'?(random()>.5?.8:-.8):0;
  const minGap=Math.round(width*state.speed+shape.minGap*.6);
  const gap=minGap+Math.floor(random()*(Math.round(minGap*1.5)-minGap+1));
  const obstacle:Obstacle={id:state.nextId,kind,x:state.width,y,width,height:shape.height,count,gap,offset,boxes};
  return {...state,random:randomState,nextId:state.nextId+1,history:[...state.history,kind].slice(-2),obstacles:[...state.obstacles,obstacle]};
}
export function stepDino(state:DinoState):DinoState {
  if(state.over)return state;
  let y=state.y,velocity=state.velocity,jumping=state.jumping,reachedMinimum=state.reachedMinimum,dropping=state.dropping,ducking=state.ducking;
  if(jumping){
    y+=Math.round(velocity*(dropping?3:1));velocity-=.6;
    if(y>30||dropping)reachedMinimum=true;
    if((y>FLOOR-DINO_HEIGHT-30||dropping)&&reachedMinimum&&velocity>5)velocity=5;
    if(y<0){y=0;velocity=0;jumping=false;dropping=false;ducking=state.down;}
  }
  const tick=state.tick+1,time=tick/60;
  let next={...state,tick,time,y,velocity,jumping,reachedMinimum,dropping,ducking};
  if(time>3){
    next={...next,obstacles:next.obstacles.map(o=>({...o,x:o.x-Math.floor(next.speed+o.offset)})).filter(o=>o.x+o.width>0)};
    const last=next.obstacles[next.obstacles.length-1];
    if(!last||last.x+last.width+last.gap<next.width)next=spawn(next);
    if(next.obstacles.some(o=>dinoCollides(next,o)))return {...next,over:true};
  }
  next={...next,distance:next.distance+next.speed,speed:Math.min(13,next.speed+.001)};
  const milestone=Math.floor(dinoScore(next)/700);
  if(milestone>next.nightMilestone)next={...next,nightMilestone:milestone,nightUntil:time+12};
  return next;
}
export function advanceDino(state:DinoState, elapsed:number):DinoState {
  if(state.over||!Number.isFinite(elapsed)||elapsed<=0)return state;
  let remainder=state.remainder+Math.min(elapsed,.1)*1000;
  let next=state;
  while(remainder+1e-7>=FRAME_MS&&!next.over){remainder-=FRAME_MS;next=stepDino(next);}
  return {...next,remainder:Math.max(0,remainder)};
}
export function replayDino(state:DinoState, endTick:unknown, value:unknown):DinoState|null {
  if(!Number.isSafeInteger(endTick)||typeof endTick!=='number'||endTick<state.tick||endTick-state.tick>3600||!Array.isArray(value)||value.length>600)return null;
  const actions=new Set(['jump','release','duck','stand']);let previous=state.tick;let perTick=0;
  for(const input of value){
    if(!input||!Number.isSafeInteger(input.tick)||input.tick<state.tick||input.tick>endTick||!actions.has(input.action)||input.tick<previous)return null;
    perTick=input.tick===previous?perTick+1:1;if(perTick>4)return null;previous=input.tick;
  }
  let next=state;let i=0;
  while(next.tick<endTick&&!next.over){
    while(i<value.length&&value[i].tick===next.tick)next=applyDinoInput(next,value[i++].action);
    next=stepDino(next);
  }
  while(i<value.length&&value[i].tick===next.tick&&!next.over)next=applyDinoInput(next,value[i++].action);
  return i===value.length&&next.tick===endTick?next:null;
}
