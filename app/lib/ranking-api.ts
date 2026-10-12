export type RankedGame = 'rush' | 'catch' | 'dino';
export interface RankedSession { id: string; seed: number; game: RankedGame; }
export interface RankingEntry { name: string; score: number; created: number; }
const API = process.env.NEXT_PUBLIC_GAMES_API || 'https://humisan-games.f14518887.workers.dev';
export async function rankingApi<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API}${path}`, { method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(12000), cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'NETWORK');
  return data as T;
}
export function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
}
export function rankingError(code: string, ja: boolean): string {
  const messages: Record<string, [string, string]> = {
    RATE_LIMIT: ['プレイや登録が多すぎます\n10分ほど待ってから試してください', 'Too many requests. Try again in about 10 minutes.'],
    INVALID_INPUT: ['公開名または記録を確認してください', 'Check your name or game record.'],
    INVALID_RECORD: ['記録を確認できませんでした\nもう一度プレイしてください', 'The record could not be verified. Play again.'],
    SESSION_EXPIRED: ['登録期限が切れました\nもう一度プレイしてください', 'The result has expired. Play again.'],
    NO_HITS: ['スコアが0の記録は登録できません', 'Zero-score results cannot be registered.'],
    ROUND_INCOMPLETE: ['まだ登録できません\n少し待ってから再送してください', 'Wait a moment and retry.'],
  };
  return messages[code]?.[ja ? 0 : 1] || (ja ? '接続できませんでした\n通信状態を確認してもう一度試してください' : 'Could not connect. Check your connection and retry.');
}
