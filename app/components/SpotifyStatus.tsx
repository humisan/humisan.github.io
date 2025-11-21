'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './SpotifyStatus.module.css';

interface SpotifyTrack {
  title: string;
  artist: string;
  albumArt: string;
  albumName: string;
  isPlaying: boolean;
  spotifyUrl: string;
  duration: number;
  progress: number;
  fetchedAt?: string;
}

export default function SpotifyStatus() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpotifyData = async () => {
      try {
        const response = await fetch('/spotify-data.json');
        if (!response.ok) {
          setLoading(false);
          return;
        }
        const data: SpotifyTrack = await response.json();
        setTrack(data);
      } catch (error) {
        console.error('Error loading Spotify data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSpotifyData();
  }, []);

  if (loading || !track) {
    return null;
  }

  const progressPercent = (track.progress / track.duration) * 100;
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer">
      <div className={styles.spotifySection}>
        <div className={styles.albumArtContainer}>
          {track.albumArt && (
            <Image
              src={track.albumArt}
              alt={track.albumName}
              width={80}
              height={80}
              className={styles.albumArt}
            />
          )}
          {track.isPlaying && <div className={styles.playingIndicator} />}
        </div>

        <div className={styles.trackInfo}>
          <div className={styles.status}>
            {track.isPlaying ? '🎵 Now Playing' : '⏸️ Last Played'}
          </div>
          <h3 className={styles.songTitle}>{track.title}</h3>
          <p className={styles.artistName}>{track.artist}</p>
          <p className={styles.albumName}>{track.albumName}</p>

          <div className={styles.progressBar}>
            <div
              className={styles.progress}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className={styles.timeInfo}>
            <span>{formatTime(track.progress)}</span>
            <span>{formatTime(track.duration)}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
