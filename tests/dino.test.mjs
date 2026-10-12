import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
const source=await readFile(new URL('../app/lib/dino-game.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ES2020}}).outputText;
const {newDinoGame,advanceDino,applyDinoInput,stepDino,dinoScore,dinoCollides,replayDino,readDinoBest}=await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
test('Chrome speed and distance scoring use a fixed 60fps simulation',()=>{
  for(const fps of [30,60,120]){let state=newDinoGame();for(let i=0;i<fps;i++)state=advanceDino(state,1/fps);assert.equal(state.tick,60);assert.equal(dinoScore(state),9);assert.ok(Math.abs(state.speed-6.06)<.00001);}
  assert.ok(Math.abs(newDinoGame(1,300).speed-3.6)<1e-9);
});
test('jump release lowers the jump, double jumps are rejected, and down accelerates falling',()=>{
  let full=applyDinoInput(newDinoGame(),'jump');assert.strictEqual(applyDinoInput(full,'jump'),full);
  let short=full;for(let i=0;i<5;i++)short=stepDino(short);short=applyDinoInput(short,'release');
  let maxFull=0,maxShort=short.y;
  for(let i=0;i<60;i++){full=stepDino(full);short=stepDino(short);maxFull=Math.max(maxFull,full.y);maxShort=Math.max(maxShort,short.y);}
  assert.ok(maxFull>maxShort);assert.equal(full.y,0);assert.equal(short.y,0);
  let air=applyDinoInput(newDinoGame(),'jump');for(let i=0;i<6;i++)air=stepDino(air);
  const dropped=stepDino(applyDinoInput(air,'duck'));assert.ok(dropped.y<air.y);
});
test('ducking avoids mid-height birds while ground obstacles still collide',()=>{
  const state=newDinoGame();const bird={id:1,kind:'bird',x:70,y:75,width:46,height:40,count:1,gap:150,offset:0,boxes:[{x:15,y:15,width:16,height:5}]};
  assert.equal(dinoCollides(state,bird),true);assert.equal(dinoCollides(applyDinoInput(state,'duck'),bird),false);
  const cactus={...bird,kind:'small',y:105,width:17,height:35,boxes:[{x:4,y:0,width:6,height:34}]};
  assert.equal(dinoCollides(applyDinoInput(state,'duck'),cactus),true);
});
test('three seconds of grace precede real obstacles and an unplayed run ends',()=>{
  let state=newDinoGame(123);for(let i=0;i<180;i++)state=stepDino(state);assert.equal(state.obstacles.length,0);
  for(let i=0;i<300&&!state.over;i++)state=stepDino(state);
  assert.equal(state.over,true);assert.ok(dinoScore(state)>0);assert.strictEqual(stepDino(state),state);
});
test('obstacle groups, flying obstacles, speed cap, and night milestones appear',()=>{
  let state={...newDinoGame(123),tick:3000,time:50,speed:9,distance:27990,y:1000};let bird=false,group=false;
  for(let i=0;i<6000;i++){state=stepDino({...state,y:1000,jumping:false});for(const o of state.obstacles){bird||=o.kind==='bird';group||=o.count>1;}assert.equal(state.over,false);}
  assert.equal(bird,true);assert.equal(group,true);assert.equal(state.speed,13);assert.ok(state.nightMilestone>0);
});
test('checkpoint replay matches inputs exactly and rejects skipped or excessive logs',()=>{
  const initial=newDinoGame(123);const inputs=[{tick:0,action:'jump'},{tick:6,action:'release'},{tick:55,action:'duck'},{tick:60,action:'stand'}];
  let client=initial;
  for(let tick=0;tick<120;tick++){for(const input of inputs.filter(x=>x.tick===tick))client=applyDinoInput(client,input.action);client=stepDino(client);}
  const server=replayDino(initial,120,inputs);assert.deepEqual(server,client);
  assert.equal(replayDino(initial,3601,[]),null);assert.equal(replayDino(initial,10,[{tick:11,action:'jump'}]),null);assert.equal(replayDino(initial,10,[{tick:0,action:'teleport'}]),null);
});
test('invalid clocks and corrupted saved scores cannot break play',()=>{
  const state=newDinoGame();for(const dt of [NaN,Infinity,0,-1])assert.strictEqual(advanceDino(state,dt),state);
  assert.equal(advanceDino(state,60).tick,6);for(const value of ['NaN','Infinity','-1','1.5'])assert.equal(readDinoBest(value),0);
});
