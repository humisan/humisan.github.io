import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
const source = await readFile(new URL('../app/lib/target-rush.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 } }).outputText;
const { rushTargets, scoreRush, validRushShots, validPublicName } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
test('targets are deterministic and fit inside the play area', () => {
  assert.deepEqual(rushTargets(123), rushTargets(123));
  assert.notDeepEqual(rushTargets(123), rushTargets(124));
  for (const t of rushTargets(123)) { assert.ok(t.x > t.radius && t.x < 100-t.radius); assert.ok(t.y > t.radius*2 && t.y < 100-t.radius*2); }
});
test('scores depend on valid hits, timing, precision, and consecutive targets', () => {
  const [a,b] = rushTargets(123);
  const hit = { t: a.start+200, x:a.x, y:a.y };
  const score = scoreRush(123,[hit]);
  assert.equal(score.hits,1);
  assert.equal(scoreRush(123,[hit,{...hit,t:hit.t+50}]).hits,1);
  assert.equal(scoreRush(123,[{...hit,t:a.start+20}]).hits,0);
  assert.equal(scoreRush(123,[{...hit,x:0,y:0}]).score,0);
  assert.ok(scoreRush(123,[hit,{t:b.start+200,x:b.x,y:b.y}]).score > score.score*2);
  assert.ok(scoreRush(123,[{...hit,t:a.start+100}]).score > score.score);
});
test('malformed or impossible shot logs are rejected', () => {
  for (const value of [null,{},[{t:NaN,x:50,y:50}],[{t:30001,x:50,y:50}],[{t:100,x:-1,y:50}],[{t:100,x:50,y:50},{t:110,x:50,y:50}],Array(241).fill({t:100,x:50,y:50})]) assert.equal(validRushShots(value),false);
  assert.equal(validRushShots([{t:1000,x:50,y:50},{t:1100,x:60,y:50}]),true);
});
test('public names reject markup, links, controls, and excessive lengths', () => {
  for (const value of ['', '<script>', 'https://a.test', 'a\nb', 'a'.repeat(21),' name ']) assert.equal(validPublicName(value),false);
  for (const value of ['humisan','プレイヤー1','Player_01']) assert.equal(validPublicName(value),true);
});
