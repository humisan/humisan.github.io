import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
const source = await readFile(new URL('../app/lib/dino-game.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 } }).outputText;
const { newDinoGame, jumpDino, advanceDino, dinoScore, dinoSpeed, readDinoBest } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

test('jump lands, cannot double jump, and simulation is independent of frame rate', () => {
  const initial = jumpDino(newDinoGame());
  assert.strictEqual(jumpDino(initial), initial);
  let slow = initial, fast = initial;
  for (let i = 0; i < 30; i++) slow = advanceDino(slow, 1 / 30);
  for (let i = 0; i < 120; i++) fast = advanceDino(fast, 1 / 120);
  assert.equal(slow.y, 0);
  assert.equal(fast.y, 0);
  assert.ok(Math.abs(slow.time - fast.time) < .001);
});
test('ground collision ends the run while a high jump clears the same obstacle', () => {
  const ground = { ...newDinoGame(), obstacles: [{ id: 1, x: 110, width: 26, height: 42 }] };
  assert.equal(advanceDino(ground, .016).over, true);
  assert.equal(advanceDino({ ...ground, y: 80 }, .016).over, false);
  const ended = advanceDino(ground, .016);
  assert.strictEqual(advanceDino(ended, 1), ended);
  assert.strictEqual(jumpDino(ended), ended);
});
test('no-input run encounters a real obstacle and ends with a score', () => {
  let state = newDinoGame();
  for (let i = 0; i < 600 && !state.over; i++) state = advanceDino(state, 1 / 60, () => .5);
  assert.equal(state.over, true);
  assert.ok(dinoScore(state) > 0);
});
test('invalid clocks, delayed frames, and corrupted storage cannot break the game', () => {
  const state = newDinoGame();
  for (const elapsed of [NaN, Infinity, -1, 0]) assert.strictEqual(advanceDino(state, elapsed), state);
  assert.ok(advanceDino(state, 60).time <= .10001);
  for (const value of ['NaN', 'Infinity', '-1', '1.5', '999999999']) assert.equal(readDinoBest(value), 0);
  assert.equal(readDinoBest('123'), 123);
  const spawned = advanceDino({ ...state, spawnIn: 0 }, .016, () => NaN);
  assert.ok(Number.isFinite(spawned.obstacles[0].width));
});

test('higher scores increase obstacle speed with a playable upper bound', () => {
  const base = newDinoGame();
  assert.equal(dinoSpeed(base), 260);
  assert.ok(dinoSpeed({ ...base, time: 30 }) > dinoSpeed(base));
  assert.equal(dinoSpeed({ ...base, time: 1000 }), 480);
});
