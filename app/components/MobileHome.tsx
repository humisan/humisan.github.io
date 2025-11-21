'use client';

import { useLanguage } from '../context/LanguageContext';
import styles from './MobileHome.module.css';
import DiscordStatus from './DiscordStatus';
import SpotifyStatus from './SpotifyStatus';
import GitHubStats from './GitHubStats';

export default function MobileHome() {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      {/* Profile Section */}
      <div className={styles.profileSection}>
        {/* Profile Image */}
        <div className={styles.profileImage}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="Profile"
            className={styles.profileImg}
          />
        </div>

        {/* Profile Info */}
        <div className={styles.profileInfo}>
          <h1 className={styles.name}>humisan</h1>
          <p className={styles.title}>{t('profile.title')}</p>
          <p className={styles.description}>{t('profile.description')}</p>
        </div>

        {/* Social Links */}
        <div className={styles.socialLinks}>
          <a href="https://github.com/humisan" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor" className={styles.socialIcon}>
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a href="https://twitter.com/humisan7626" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Twitter">
            <svg viewBox="0 0 24 24" fill="currentColor" className={styles.socialIcon}>
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7s1.1 5-5 7-11-11-11-11c0-.276.027-.55.08-.82a7.05 7.05 0 004.025-6.73z" />
            </svg>
          </a>
          <a href="https://youtube.com/@humisan" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="YouTube">
            <svg viewBox="0 0 24 24" fill="currentColor" className={styles.socialIcon}>
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>

        {/* Spotify Status */}
        <SpotifyStatus />

        {/* GitHub Statistics */}
        <GitHubStats />

        {/* Discord Status */}
        <DiscordStatus />
      </div>
    </div>
  );
}
