'use client';

import { useEffect, useState } from 'react';
import styles from './DiscordStatus.module.css';

interface SpotifyActivity {
  name: string;
  details?: string;
  state?: string;
  assets?: {
    image_url: string;
  };
}

const DISCORD_USER_ID = '556283324914728970';

export default function DiscordStatus() {
  const [status, setStatus] = useState<string>('offline');
  const [username, setUsername] = useState<string>('');
  const [spotify, setSpotify] = useState<SpotifyActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 初期データ取得
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`
        );
        if (!response.ok) throw new Error('Failed to fetch data');

        const result = await response.json();

        if (result.data) {
          setStatus(result.data.discord_status || 'offline');

          // Discord ユーザー名を取得
          if (result.data.discord_user) {
            setUsername(result.data.discord_user.username || '');
          }

          // Spotify アクティビティを抽出
          const spotifyActivity = result.data.activities?.find(
            (activity: any) => activity.name === 'Spotify'
          );
          setSpotify(spotifyActivity || null);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching Lanyard data:', err);
        setError('Unable to load Discord status');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // WebSocket でリアルタイム更新を試みる
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(
        `wss://api.lanyard.rest?user_id=${DISCORD_USER_ID}`
      );

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { d } = message;

          // Lanyard WebSocket データはあらゆる時点で来る
          if (d) {
            setStatus(d.discord_status || 'offline');

            // Discord ユーザー名を取得
            if (d.discord_user) {
              setUsername(d.discord_user.username || '');
            }

            const spotifyActivity = d.activities?.find(
              (activity: any) => activity.name === 'Spotify'
            );
            setSpotify(spotifyActivity || null);
          }
        } catch (e) {
          console.error('WebSocket message error:', e);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  if (error) {
    return null; // エラー時は非表示
  }

  if (loading) {
    return (
      <div className={styles.statusContainer}>
        <div className={styles.loadingDot}></div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    online: '#43b581',
    idle: '#faa61a',
    dnd: '#f04747',
    offline: '#747f8d',
  };

  const statusTexts: Record<string, string> = {
    online: 'Online',
    idle: 'Idle',
    dnd: 'Do Not Disturb',
    offline: 'Offline',
  };

  return (
    <div className={styles.container}>
      {/* Discord Status */}
      <div className={styles.statusSection}>
        <div className={styles.statusHeader}>
          <span
            className={styles.statusDot}
            style={{
              backgroundColor: statusColors[status] || '#747f8d',
            }}
          ></span>
          <div className={styles.statusInfo}>
            <span className={styles.statusText}>
              {statusTexts[status] || 'Offline'}
            </span>
            {username && (
              <span className={styles.username}>@{username}</span>
            )}
          </div>
        </div>
      </div>

      {/* Spotify Activity */}
      {spotify && spotify.details && (
        <div className={styles.spotifySection}>
          <div className={styles.spotifyHeader}>
            <svg className={styles.spotifyIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.315-.74.42-1.14.175-3.12-1.92-7.09-2.353-11.68-1.285-.42.12-.84-.066-.96-.48-.12-.42.066-.84.48-.96 5.12-1.147 9.58-.645 13.055 1.487.42.258.915.052 1.174-.405.236-.315.084-.795-.176-1.054z" />
            </svg>
            <span>Listening on Spotify</span>
          </div>
          <div className={styles.spotifyContent}>
            {spotify.assets?.image_url && (
              <div className={styles.albumArt}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={spotify.assets.image_url}
                  alt="Album cover"
                  className={styles.albumImage}
                />
              </div>
            )}
            <div className={styles.songDetails}>
              <div className={styles.songTitle}>{spotify.details || 'Unknown Song'}</div>
              <div className={styles.artistName}>{spotify.state || 'Unknown Artist'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
