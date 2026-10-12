import { readFile } from 'node:fs/promises';
const args=process.argv.slice(2);
const get=name=>args[args.indexOf(name)+1];
const game=get('--game'), name=get('--name'), file=get('--key-file');
if (!args.includes('--game') || !args.includes('--name') || !args.includes('--key-file') || !['catch','dino','dino-v2','rush'].includes(game) || !name || !file) {
  console.error('使い方: node worker/moderate.mjs --game catch|dino|dino-v2|rush --name 公開名 --key-file 管理キーのファイル');
  process.exit(2);
}
try {
  const key=(await readFile(file,'utf8')).trim();
  if (!/^[a-f0-9]{64}$/.test(key)) throw new Error('Invalid key file');
  const response=await fetch('https://humisan-games.f14518887.workers.dev/moderate',{method:'POST',headers:{Origin:'https://hanyuu.lol','Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({game,name}),signal:AbortSignal.timeout(12000)});
  if (!response.ok) { console.error(`削除に失敗しました: HTTP ${response.status}`); process.exit(1); }
  console.log('指定した公開名の記録を削除しました');
} catch (error) { console.error('記録の削除に失敗しました', { cause:error instanceof Error?error.name:'UnknownError' }); process.exit(1); }
