'use client';

import styles from './SkeletonLoader.module.css';

interface SkeletonProps {
  type?: 'card' | 'row' | 'dashboard';
  count?: number;
}

export default function SkeletonLoader({ type = 'card', count = 3 }: SkeletonProps) {
  const items = Array.from({ length: count });

  if (type === 'row') {
    return (
      <div className={styles.rowContainer}>
        {items.map((_, i) => (
          <div key={i} className={styles.skeletonRow}>
            <div className={`${styles.skeletonItem} ${styles.circle}`}></div>
            <div className={styles.rowLines}>
              <div className={`${styles.skeletonItem} ${styles.line} ${styles.w60}`}></div>
              <div className={`${styles.skeletonItem} ${styles.line} ${styles.w40}`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'dashboard') {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.gridHeader}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`${styles.skeletonItem} ${styles.line} ${styles.w80}`}></div>
          ))}
        </div>
        {items.map((_, i) => (
          <div key={i} className={styles.dashboardRow}>
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className={`${styles.skeletonItem} ${styles.line} ${j === 0 ? styles.w60 : styles.w80}`}></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.gridContainer}>
      {items.map((_, i) => (
        <div key={i} className={`${styles.skeletonCard} var(--glass-bg)`}>
          <div className={`${styles.skeletonItem} ${styles.rect}`}></div>
          <div className={`${styles.skeletonItem} ${styles.line} ${styles.w80}`}></div>
          <div className={`${styles.skeletonItem} ${styles.line} ${styles.w100}`}></div>
          <div className={`${styles.skeletonItem} ${styles.line} ${styles.w40}`}></div>
        </div>
      ))}
    </div>
  );
}
