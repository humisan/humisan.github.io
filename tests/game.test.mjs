import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../app/lib/catch-game.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 } }).outputText;
const { newGame, advanceGame, catchTarget, readBestScore } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

test('a full round ends after 30 seconds and clears all targets', () => {
  let state = newGame();
  for (let tick = 0; tick < 300; tick++) state = advanceGame(state, .1, () => .5);
  state = advanceGame(state, .01);
  assert.equal(state.remaining, 0);
  assert.deepEqual(state.targets, []);
  assert.strictEqual(advanceGame(state, 1), state);
});

test('a target can be caught only once and only during a live round', () => {
  const initial = newGame();
  const spawned = advanceGame(initial, .1, () => .5);
  assert.equal(initial.targets.length, 0);
  const caught = catchTarget(spawned, spawned.targets[0].id);
  assert.equal(caught.score, 1);
  assert.strictEqual(catchTarget(caught, spawned.targets[0].id), caught);
  assert.strictEqual(catchTarget({ ...spawned, remaining: 0 }, spawned.targets[0].id).score, 0);
});

test('expired targets disappear and the field stays bounded', () => {
  let state = newGame();
  for (let tick = 0; tick < 100; tick++) {
    state = advanceGame(state, .1, () => tick % 2 ? -10 : 10);
    assert.ok(state.targets.length <= 5);
    for (const target of state.targets) {
      assert.ok(target.x >= 8 && target.x <= 84);
      assert.ok(target.y >= 10 && target.y <= 76);
      assert.ok(target.life > 0);
    }
  }
  assert.ok(state.targets.every(target => target.id > 1));
});

test('invalid clock values and corrupted stored scores are handled safely', () => {
  const state = newGame();
  for (const value of [NaN, Infinity, -1, 0]) assert.strictEqual(advanceGame(state, value), state);
  for (const value of [null, 'broken', '-1', 'Infinity', '3.5', '10001']) assert.equal(readBestScore(value), 0);
  assert.equal(readBestScore('42'), 42);
  assert.equal(readBestScore('10000'), 10000);
});
