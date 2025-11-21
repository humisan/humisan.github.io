'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import styles from './GitHubStats.module.css';

interface Repository {
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  forks: number;
}

interface Language {
  name: string;
  percentage: number;
}

interface GitHubStats {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  publicRepos: number;
  followers: number;
  following: number;
  location?: string;
  profileUrl: string;
  topLanguages: Language[];
  topRepositories: Repository[];
}

export default function GitHubStatsComponent() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGitHubData = async () => {
      try {
        const response = await fetch('/github-data.json');
        if (!response.ok) {
          setLoading(false);
          return;
        }
        const data: GitHubStats = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error loading GitHub data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGitHubData();
  }, []);

  if (loading || !stats) {
    return null;
  }

  return (
    <div className={styles.gitHubSection}>
      <a href={stats.profileUrl} target="_blank" rel="noopener noreferrer" className={styles.header}>
        <h3 className={styles.title}>{t('github.title')}</h3>
      </a>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{stats.publicRepos}</div>
          <div className={styles.statLabel}>{t('github.repositories')}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{stats.followers}</div>
          <div className={styles.statLabel}>{t('github.followers')}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{stats.following}</div>
          <div className={styles.statLabel}>{t('github.following')}</div>
        </div>
      </div>

      {/* Top Languages */}
      {stats.topLanguages && stats.topLanguages.length > 0 && (
        <div className={styles.languagesSection}>
          <h4 className={styles.sectionTitle}>{t('github.top_languages')}</h4>
          <div className={styles.languagesList}>
            {stats.topLanguages.map(lang => (
              <div key={lang.name} className={styles.languageItem}>
                <div className={styles.languageName}>{lang.name}</div>
                <div className={styles.languageBar}>
                  <div
                    className={styles.languageFill}
                    style={{ width: `${lang.percentage}%` }}
                  />
                </div>
                <div className={styles.languagePercent}>{lang.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Repositories */}
      {stats.topRepositories && stats.topRepositories.length > 0 && (
        <div className={styles.repositoriesSection}>
          <h4 className={styles.sectionTitle}>{t('github.top_repositories')}</h4>
          <div className={styles.repositoriesList}>
            {stats.topRepositories.map(repo => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.repoCard}
              >
                <div className={styles.repoName}>{repo.name}</div>
                {repo.description && (
                  <p className={styles.repoDescription}>{repo.description}</p>
                )}
                <div className={styles.repoMeta}>
                  {repo.language && (
                    <span className={styles.language}>{repo.language}</span>
                  )}
                  {repo.stars > 0 && (
                    <span className={styles.stars}>⭐ {repo.stars}</span>
                  )}
                  {repo.forks > 0 && (
                    <span className={styles.forks}>🔀 {repo.forks}</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
