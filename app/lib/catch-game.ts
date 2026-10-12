export interface Target { id: number; x: number; y: number; life: number; }
export interface GameState { remaining: number; score: number; targets: Target[]; spawnIn: number; nextId: number; }

export function newGame(): GameState {
  return { remaining: 30, score: 0, targets: [], spawnIn: 0, nextId: 1 };
}

export function advanceGame(state: GameState, elapsed: number, random: () => number = Math.random): GameState {
  if (!Number.isFinite(elapsed) || elapsed <= 0 || state.remaining <= 0) return state;
  const remaining = Math.max(0, state.remaining - elapsed);
  if (remaining === 0) return { ...state, remaining, targets: [] };
  const targets = state.targets.map(target => ({ ...target, life: target.life - elapsed })).filter(target => target.life > 0);
  let spawnIn = state.spawnIn - elapsed;
  let nextId = state.nextId;
  if (spawnIn <= 0 && targets.length < 5) {
    const safeRandom = () => {
      const value = random();
      return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : .5;
    };
    targets.push({ id: nextId++, x: 8 + safeRandom() * 76, y: 10 + safeRandom() * 66, life: 3.2 });
    spawnIn = .65;
  }
  return { ...state, remaining, targets, spawnIn, nextId };
}

export function catchTarget(state: GameState, id: number): GameState {
  if (state.remaining <= 0 || !state.targets.some(target => target.id === id)) return state;
  return { ...state, score: state.score + 1, targets: state.targets.filter(target => target.id !== id) };
}

export function readBestScore(value: string | null): number {
  const score = Number(value);
  return Number.isSafeInteger(score) && score >= 0 && score <= 10000 ? score : 0;
}

export interface CatchRecord { t: number; id: number; }
export function catchTargets(seed: number, elapsed: number): Target[] {
  let value = seed >>> 0;
  const random = () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
  const targets: Target[] = [];
  for (let id = 1; (id - 1) * 650 < 30000; id++) {
    const x = 8 + random() * 76, y = 10 + random() * 66;
    const life = (3200 - (elapsed - (id - 1) * 650)) / 1000;
    if (elapsed >= (id - 1) * 650 && life > 0) targets.push({ id, x, y, life });
  }
  return targets;
}
export function rankedCatchState(seed: number, elapsed: number, caught: ReadonlySet<number>): GameState {
  return { remaining: Math.max(0, 30 - elapsed / 1000), score: caught.size, targets: elapsed >= 30000 ? [] : catchTargets(seed, elapsed).filter(t => !caught.has(t.id)), spawnIn: 0, nextId: 0 };
}
export function scoreCatch(records: readonly CatchRecord[]): number {
  const seen = new Set<number>();
  for (const record of records) if (record.id >= 1 && record.id <= 47 && record.t >= (record.id - 1) * 650 && record.t <= (record.id - 1) * 650 + 3200 && record.t <= 30000) seen.add(record.id);
  return seen.size;
}
