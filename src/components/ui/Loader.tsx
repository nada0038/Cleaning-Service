'use client';

import styles from './Loader.module.css';

export default function Loader({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div className={`${styles.loaderContainer} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={styles.spinner}>
        <div className={styles.doubleBounce1}></div>
        <div className={styles.doubleBounce2}></div>
      </div>
      <p className={styles.loadingText}>LuxeShine...</p>
    </div>
  );
}
