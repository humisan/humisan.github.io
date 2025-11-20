'use client';

import { useEffect, useState } from 'react';
import styles from './DiscordStatus.module.css';

interface Activity {
  name: string;
  type: number;
  details?: string;
  state?: string;
  assets?: {
    image_url: string;
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  timestamps?: {
    start?: number;
    end?: number;
  };
  application_id?: string;
  session_id?: string;
  sync_id?: string;
  platform?: string;
  flags?: number;
  emoji?: {
    name: string;
    id?: string;
    animated?: boolean;
  };
  party?: {
    id?: string;
    size?: [number, number];
  };
}

interface DiscordUser {
  username: string;
  avatar: string;
  avatar_decoration?: string;
  discriminator: string;
  id: string;
  public_flags?: number;
  bot?: boolean;
  system?: boolean;
}

interface LanyardData {
  discord_status: string;
  discord_user: DiscordUser;
  activities: Activity[];
  kv?: Record<string, string>;
  premium_type?: number;
  premium_guild_since?: string;
}

const DISCORD_USER_ID = '556283324914728970';

export default function DiscordStatus() {
  const [data, setData] = useState<LanyardData | null>(null);
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
          setData(result.data);
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
            setData(d);
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

  if (!data) {
    return null;
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

  const activityTypeNames: Record<number, string> = {
    0: 'Playing',
    1: 'Streaming',
    2: 'Listening to',
    3: 'Watching',
    4: 'Custom',
    5: 'Competing in',
  };

  return (
    <div className={styles.container}>
      {/* Discord Status Banner */}
      <div className={styles.bannerSection}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://lanyard.cnrad.dev/api/users/${DISCORD_USER_ID}?hideTimestamp=true`}
          alt="Discord Status Banner"
          className={styles.statusBanner}
          onError={(e) => {
            // バナーが読み込めない場合は代替コンテンツを表示
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Discord Status */}
      <div className={styles.statusSection}>
        <div className={styles.statusHeader}>
          <span
            className={styles.statusDot}
            style={{
              backgroundColor: statusColors[data.discord_status] || '#747f8d',
            }}
          ></span>
          <div className={styles.statusInfo}>
            <span className={styles.statusText}>
              {statusTexts[data.discord_status] || 'Offline'}
            </span>
            {data.discord_user && (
              <span className={styles.username}>@{data.discord_user.username}</span>
            )}
          </div>
        </div>
      </div>

      {/* All Activities */}
      {data.activities && data.activities.length > 0 && (
        <div className={styles.activitiesSection}>
          {data.activities.map((activity, index) => (
            <div key={index} className={styles.activityCard}>
              <div className={styles.activityHeader}>
                {activity.assets?.large_image && (
                  <div className={styles.activityIcon}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activity.assets.large_image}
                      alt={activity.name}
                      className={styles.activityImage}
                    />
                  </div>
                )}
                <div className={styles.activityInfo}>
                  <div className={styles.activityType}>
                    {activityTypeNames[activity.type] || 'Activity'} {activity.name}
                  </div>
                </div>
              </div>

              {/* Activity Details */}
              {activity.details && (
                <div className={styles.activityDetail}>
                  <span className={styles.detailLabel}>詳細:</span>
                  <span className={styles.detailValue}>{activity.details}</span>
                </div>
              )}

              {/* Activity State */}
              {activity.state && (
                <div className={styles.activityDetail}>
                  <span className={styles.detailLabel}>状態:</span>
                  <span className={styles.detailValue}>{activity.state}</span>
                </div>
              )}

              {/* Party Size */}
              {activity.party?.size && (
                <div className={styles.activityDetail}>
                  <span className={styles.detailLabel}>パーティー:</span>
                  <span className={styles.detailValue}>
                    {activity.party.size[0]} / {activity.party.size[1]}
                  </span>
                </div>
              )}

              {/* Timestamps */}
              {activity.timestamps?.start && (
                <div className={styles.activityDetail}>
                  <span className={styles.detailLabel}>開始時間:</span>
                  <span className={styles.detailValue}>
                    {new Date(activity.timestamps.start).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Custom Status / KV Data */}
      {data.kv && Object.keys(data.kv).length > 0 && (
        <div className={styles.kvSection}>
          <div className={styles.kvTitle}>カスタム情報</div>
          {Object.entries(data.kv).map(([key, value]) => (
            <div key={key} className={styles.kvItem}>
              <span className={styles.kvKey}>{key}:</span>
              <span className={styles.kvValue}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
