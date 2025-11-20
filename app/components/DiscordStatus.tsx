'use client';

import styles from './DiscordStatus.module.css';

const DISCORD_USER_ID = '556283324914728970';
const WIDGET_URL = `https://discord.c99.nl/widget/theme-2/${DISCORD_USER_ID}.png`;

export default function DiscordStatus() {
  return (
    <div className={styles.container}>
      <div className={styles.widgetSection}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={WIDGET_URL}
          alt="Discord Status Widget"
          className={styles.widgetImage}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    </div>
  );
}
