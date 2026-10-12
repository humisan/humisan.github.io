'use client';
import { Alert, Button, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { RankedGame, RankedSession, rankingApi, RankingEntry, rankingError } from '../lib/ranking-api';
import { validPublicName } from '../lib/target-rush';
export default function GameRanking({ game, session, finished, record, score }: { game: RankedGame; session: RankedSession | null; finished: boolean; record: unknown; score: number }) {
  const { language } = useLanguage(); const ja = language === 'ja';
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true); const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false); const [registered, setRegistered] = useState(false);
  const [name, setName] = useState(''); const [error, setError] = useState('');
  const mounted = useRef(true);
  async function refresh() {
    setLoading(true); setFailed(false);
    try { const result = await rankingApi<{ entries: RankingEntry[] }>(`/leaderboard?game=${game}`); if (mounted.current) setEntries(result.entries); }
    catch { if (mounted.current) setFailed(true); }
    finally { if (mounted.current) setLoading(false); }
  }
  useEffect(() => {
    mounted.current = true; void refresh();
    try { setName(localStorage.getItem('humisan-ranking-name') || ''); } catch { /* Registration works without local storage. */ }
    return () => { mounted.current = false; };
    // The parent mounts one ranking component for each game route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);
  useEffect(() => { setRegistered(false); setError(''); }, [session?.id]);
  async function submit() {
    if (!session || !finished || sending || registered) return;
    const normalized = name.normalize('NFKC').trim();
    if (!validPublicName(normalized)) { setError(ja ? '公開名は1〜20文字\n文字・数字・スペース・_・.・- が使えます' : 'Use 1–20 letters, numbers, spaces, _, ., or -.'); return; }
    setSending(true); setError('');
    try {
      await rankingApi('/scores', { id: session.id, name: normalized, game, record });
      if (!mounted.current) return;
      setRegistered(true);
      try { localStorage.setItem('humisan-ranking-name', normalized); } catch { /* The score is already saved remotely. */ }
      await refresh();
    } catch (e) { if (mounted.current) setError(rankingError(e instanceof Error ? e.message : 'NETWORK', ja)); }
    finally { if (mounted.current) setSending(false); }
  }
  return <>
    {finished && session && <section className="ranking-submit" aria-labelledby="register-title"><h2 id="register-title">{ja ? 'ランキングに登録' : 'Register your score'}</h2><p>{ja ? '公開名は1〜20文字 本名は不要\n同じ名前は最高記録だけ表示されます' : 'Use a public nickname. Only the best result for each name is shown.'}</p><TextField label={ja ? '公開名' : 'Public name'} value={name} onChange={e => setName(e.target.value)} slotProps={{ htmlInput: { maxLength: 40 } }} disabled={sending || registered} size="small" /><Button variant="contained" onClick={submit} disabled={sending || registered || score === 0}>{sending ? <CircularProgress size={20} /> : registered ? (ja ? '登録済み' : 'Registered') : (ja ? '記録を登録' : 'Submit score')}</Button>{registered && <p role="status">{ja ? '登録しました' : 'Score registered'}</p>}</section>}
    {error && <Alert severity="error" className="rush-message">{error}</Alert>}
    <section className="ranking-section" aria-labelledby="ranking-title"><div className="ranking-heading"><h2 id="ranking-title">{ja ? '公開ランキング' : 'Leaderboard'}</h2><Button onClick={refresh} disabled={loading}>{ja ? '更新' : 'Refresh'}</Button></div>{loading ? <p role="status">{ja ? '読み込み中' : 'Loading'}</p> : failed ? <Alert severity="warning" action={<Button onClick={refresh}>{ja ? '再試行' : 'Retry'}</Button>}>{ja ? 'ランキングを取得できませんでした' : 'Could not load the leaderboard'}</Alert> : entries.length === 0 ? <p>{ja ? 'まだ記録がありません\n最初の記録を登録しよう' : 'No records yet. Be the first to submit a score.'}</p> : <Table aria-label={ja ? 'スコアランキング' : 'Score ranking'} size="small"><TableHead><TableRow><TableCell>#</TableCell><TableCell>{ja ? '公開名' : 'Name'}</TableCell><TableCell align="right">SCORE</TableCell></TableRow></TableHead><TableBody>{entries.map((entry, index) => <TableRow key={`${entry.name}-${entry.created}`}><TableCell>{index + 1}</TableCell><TableCell>{entry.name}</TableCell><TableCell align="right">{entry.score}</TableCell></TableRow>)}</TableBody></Table>}</section>
  </>;
}
