export interface RushTarget { id: number; x: number; y: number; radius: number; start: number; end: number; }
export interface RushShot { t: number; x: number; y: number; }
export const RUSH_DURATION = 30000;
export function rushTargets(seed: number): RushTarget[] {
  let value = seed >>> 0;
  const random = () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
  return Array.from({ length: 29 }, (_, id) => ({ id, x: 12 + random() * 76, y: 15 + random() * 70, radius: 6, start: (id + 1) * 1000, end: (id + 1) * 1000 + 850 }));
}
export function scoreRush(seed: number, shots: readonly RushShot[]) {
  const targets = rushTargets(seed);
  const hitIds = new Set<number>();
  let score = 0, combo = 0, hits = 0, previousId = -1;
  for (const shot of shots) {
    const target = targets.find(t => shot.t >= t.start && shot.t <= t.end);
    const distance = target ? Math.hypot(shot.x - target.x, (shot.y - target.y) * .5) : Infinity;
    if (!target || (Math.abs(shot.x - target.x) > target.radius || Math.abs(shot.y - target.y) > 5.4) || hitIds.has(target.id) || shot.t - target.start < 80) { combo = 0; continue; }
    combo = target.id === previousId + 1 ? combo + 1 : 1;
    previousId = target.id;
    hitIds.add(target.id);
    hits++;
    score += 100 + Math.floor((1 - (shot.t - target.start) / 850) * 100) + Math.floor(Math.max(0, 1 - distance / target.radius) * 50) + Math.min(combo, 5) * 20;
  }
  return { score, hits, combo, hitIds };
}
export function validRushShots(value: unknown): value is RushShot[] {
  if (!Array.isArray(value) || value.length > 240) return false;
  let previous = -100;
  return value.every(shot => {
    if (!shot || typeof shot !== 'object' || !Number.isFinite(shot.t) || !Number.isFinite(shot.x) || !Number.isFinite(shot.y) || shot.t < 0 || shot.t > RUSH_DURATION || shot.t - previous < 40 || shot.x < 0 || shot.x > 100 || shot.y < 0 || shot.y > 100) return false;
    previous = shot.t;
    return true;
  });
}
export function validPublicName(value: unknown): value is string {
  return typeof value === 'string' && value === value.normalize('NFKC').trim() && [...value].length >= 1 && [...value].length <= 20 && /^[\p{L}\p{N} _.-]+$/u.test(value);
}
