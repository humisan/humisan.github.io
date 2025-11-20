'use client';

import { useEffect, useState } from 'react';
import styles from './AccessCounter.module.css';

export default function AccessCounter() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // localStorage からカウントを取得
    const storedCount = localStorage.getItem('accessCount');
    const currentCount = storedCount ? parseInt(storedCount, 10) + 1 : 1;

    // localStorage に新しいカウント値を保存
    localStorage.setItem('accessCount', currentCount.toString());

    // 状態を更新
    setCount(currentCount);
  }, []);

  return (
    <div className={styles.counterContainer}>
      <div className={styles.counterLabel}>Visits</div>
      <div className={styles.counterValue}>{count.toLocaleString()}</div>
    </div>
  );
}
