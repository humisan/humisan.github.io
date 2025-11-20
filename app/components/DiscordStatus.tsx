'use client';

import { useEffect, useState } from 'react';
import styles from './DiscordStatus.module.css';

interface SpotifyActivity {
  name: string;
  details: string;
  state: string;
  assets: {
    image_url: string;
  };
}

interface LanyardData {
  success: boolean;
  data: {
    discord_status: string;
    activities: Array<{
      name: string;
      type: number;
      details?: string;
      state?: string;
      assets?: {
        image_url: string;
      };
    }>;
    discord_user?: {
      username: string;
      display_name: string;
      avatar: string;
    };
  };
}

const DISCORD_USER_ID = '556283324914728970';

export default function DiscordStatus() {
  const [data, setData] = useState<LanyardData | null>(null);
  const [spotify, setSpotify] = useState<SpotifyActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初期データ取得
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`
        );
        const result = await response.json();
        setData(result);

        // Spotify アクティビティを抽出
        const spotifyActivity = result.data.activities.find(
          (activity: any) => activity.name === 'Spotify'
        );
        setSpotify(spotifyActivity || null);
      } catch (error) {
        console.error('Error fetching Lanyard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // WebSocket でリアルタイム更新
    const ws = new WebSocket(
      `wss://api.lanyard.rest?user_id=${DISCORD_USER_ID}`
    );

    ws.onmessage = (event) => {
      const { d } = JSON.parse(event.data);
      if (d) {
        setData(prev => prev ? { ...prev, data: d } : null);

        const spotifyActivity = d.activities.find(
          (activity: any) => activity.name === 'Spotify'
        );
        setSpotify(spotifyActivity || null);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.statusContainer}>
        <div className={styles.loadingDot}></div>
        <p>Loading...</p>
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
              backgroundColor: statusColors[data?.data.discord_status || 'offline'],
            }}
          ></span>
          <span className={styles.statusText}>
            {statusTexts[data?.data.discord_status || 'offline']}
          </span>
        </div>
      </div>

      {/* Spotify Activity */}
      {spotify && (
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
                <img
                  src={spotify.assets.image_url}
                  alt="Album cover"
                  className={styles.albumImage}
                />
              </div>
            )}
            <div className={styles.songDetails}>
              <div className={styles.songTitle}>{spotify.details}</div>
              <div className={styles.artistName}>{spotify.state}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
