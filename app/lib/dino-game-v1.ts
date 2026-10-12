export interface Obstacle { id: number; x: number; width: number; height: number; }
export interface DinoState { time: number; y: number; velocity: number; obstacles: Obstacle[]; spawnIn: number; nextId: number; over: boolean; }
export const FIELD_WIDTH = 800;
export const FLOOR = 240;
export const DINO_X = 80;
export const DINO_WIDTH = 56;
export const DINO_HEIGHT = 24;

export function newDinoGame(): DinoState {
  return { time: 0, y: 0, velocity: 0, obstacles: [], spawnIn: 1.2, nextId: 1, over: false };
}
export function jumpDino(state: DinoState): DinoState {
  return state.over || state.y > 0 ? state : { ...state, velocity: 650, y: .01 };
}
export function advanceDino(state: DinoState, elapsed: number, random: () => number = Math.random): DinoState {
  if (state.over || !Number.isFinite(elapsed) || elapsed <= 0) return state;
  // Small steps keep collision detection reliable even after a delayed frame.
  let next = state;
  let remaining = Math.min(elapsed, .1);
  while (remaining > 0 && !next.over) {
    const dt = Math.min(remaining, 1 / 120);
    remaining -= dt;
    const time = next.time + dt;
    const speed = dinoSpeed({ ...next, time });
    const velocity = next.velocity - 1800 * dt;
    const y = Math.max(0, next.y + velocity * dt);
    const obstacles = next.obstacles.map(o => ({ ...o, x: o.x - speed * dt })).filter(o => o.x + o.width > 0);
    let spawnIn = next.spawnIn - dt;
    let nextId = next.nextId;
    if (spawnIn <= 0) {
      const sample = random();
      const r = Number.isFinite(sample) ? Math.max(0, Math.min(1, sample)) : .5;
      obstacles.push({ id: nextId++, x: FIELD_WIDTH, width: 22 + r * 16, height: 34 + r * 22 });
      // At maximum speed the shortest gap still leaves time to land and jump again.
      spawnIn = 1.35 + r * .65;
    }
    const over = obstacles.some(o => DINO_X + DINO_WIDTH - 5 > o.x + 3 && DINO_X + 5 < o.x + o.width - 3 && y + 5 < o.height);
    next = { time, y, velocity: y === 0 ? 0 : velocity, obstacles, spawnIn, nextId, over };
  }
  return next;
}
export function dinoScore(state: DinoState): number { return Math.floor(state.time * 10); }
export function readDinoBest(value: string | null): number {
  const score = Number(value);
  return Number.isSafeInteger(score) && score >= 0 && score <= 10000000 ? score : 0;
}

export function dinoSpeed(state: DinoState): number { return 260 + Math.min(dinoScore(state) * .3, 220); }
