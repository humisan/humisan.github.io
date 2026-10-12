import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
const cache=new Map();
async function load(file){
  const url=new URL(file,import.meta.url); const key=url.href;
  if(cache.has(key))return cache.get(key);
  let code=ts.transpileModule(await readFile(url,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ES2020}}).outputText;
  for(const match of [...code.matchAll(/from ['"]([^'"]+)['"]/g)]) if(match[1].startsWith('.')){
    const dependency=await load(new URL(match[1]+'.ts',url).href); code=code.replace(match[1],dependency);
  }
  const data='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(key,data);return data;
}
const {verifyRecord}=await import(await load('../worker/verify.ts'));
const {newDinoGame,advanceDino,jumpDino}=await import(await load('../app/lib/dino-game-v1.ts'));
test('Dino replay verifies actual runs at different rendering frame rates',()=>{
  for(const fps of [30,60,120]){
    const seed=123;let value=seed; const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
    let state=newDinoGame();const jumps=[];
    while(!state.over){
      if(state.time<30&&state.y===0&&state.obstacles.some(o=>o.x<225&&o.x>85)){jumps.push(state.time*1000);state=jumpDino(state);}
      state=advanceDino(state,1/fps,random);
    }
    const result=verifyRecord('dino',seed,{jumps,elapsed:state.time*1000});
    assert.ok(result,`valid ${fps} fps replay rejected`);
    assert.equal(result.score,Math.floor(state.time*10));
  }
});
test('invalid Dino recordings and impossible unfinished records are rejected',()=>{
  for(const record of [null,{jumps:[0,1],elapsed:1000},{jumps:[],elapsed:600001},{jumps:[],elapsed:20000},{jumps:[NaN],elapsed:1000}])assert.equal(verifyRecord('dino',123,record),null);
});
test('catch records cannot inflate scores by repeating IDs or choosing future targets',()=>{
  assert.equal(verifyRecord('catch',123,[{id:1,t:100},{id:1,t:200}]).score,1);
  assert.equal(verifyRecord('catch',123,[{id:47,t:100}]).score,0);
  assert.equal(verifyRecord('catch',123,[{id:999,t:100}]),null);
});
