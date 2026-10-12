import { validRushShots, scoreRush } from '../app/lib/target-rush';
import { scoreCatch, CatchRecord } from '../app/lib/catch-game';
import { advanceDino, jumpDino, newDinoGame } from '../app/lib/dino-game';
export function verifyRecord(game: string, seed: number, record: unknown): {score:number; duration:number} | null {
  if (game === 'rush') return validRushShots(record) ? { score:scoreRush(seed,record).score,duration:30000 } : null;
  if (game === 'catch') {
    if (!Array.isArray(record) || record.length > 47) return null;
    let previous = -40;
    if (!record.every(r => { const ok = r && Number.isInteger(r.id) && r.id>=1 && r.id<=47 && Number.isFinite(r.t) && r.t>=0 && r.t<=30000 && r.t-previous>=40; previous=r?.t; return ok; })) return null;
    return { score:scoreCatch(record as CatchRecord[]),duration:30000 };
  }
  if (game !== 'dino' || !record || typeof record !== 'object') return null;
  const { jumps, elapsed } = record as {jumps:unknown;elapsed:unknown};
  if (!Array.isArray(jumps) || jumps.length > 2000 || typeof elapsed !== 'number' || !Number.isFinite(elapsed) || elapsed<0 || elapsed>600000) return null;
  let previous = -120;
  if (!jumps.every(t => {const ok=Number.isFinite(t)&&t>=0&&t<=elapsed&&t-previous>=120;previous=t;return ok;})) return null;
  let value=seed>>>0;
  const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
  let state=newDinoGame(); let index=0;
  while (!state.over && state.time*1000<Math.min(elapsed+250,600000)) {
    if(index<jumps.length && jumps[index]<=state.time*1000+9) { if(state.y>2) return null; state=jumpDino({...state,y:0});index++; }
    state=advanceDino(state,1/120,random);
  }
  if(index!==jumps.length || Math.abs(state.time*1000-elapsed)>250 || (!state.over && elapsed<599990)) return null;
  return {score:Math.floor(elapsed/100),duration:elapsed};
}
