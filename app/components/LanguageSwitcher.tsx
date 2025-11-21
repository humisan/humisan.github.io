'use client';

import { useLanguage } from '../context/LanguageContext';
import styles from './LanguageSwitcher.module.css';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${language === 'ja' ? styles.active : ''}`}
        onClick={() => setLanguage('ja')}
        title="Japanese"
      >
        日本語
      </button>
      <button
        className={`${styles.button} ${language === 'en' ? styles.active : ''}`}
        onClick={() => setLanguage('en')}
        title="English"
      >
        English
      </button>
    </div>
  );
}
