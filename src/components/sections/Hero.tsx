'use client';

import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import styles from './Hero.module.css';

export default function Hero() {
  const { lang } = useLanguage();

  return (
    <section id="hero" className={styles.heroSection}>
      <div className={`container ${styles.heroContainer}`}>
        <div className={styles.heroContent}>
          <div className={styles.tagline}>
            <span className="badge">{t(lang, 'hero_badge')}</span>
          </div>

          <h1 className={styles.title}>
            {t(lang, 'hero_title_1')}<br />
            <span className={styles.serifText}>{t(lang, 'hero_title_2')}</span>
          </h1>

          <p className={styles.subtitle}>{t(lang, 'hero_subtitle')}</p>

          <div className={styles.actionGroup}>
            <a href="#booking" className="btn btn-primary">
              {t(lang, 'hero_cta_primary')}
            </a>
            <a href="#services" className="btn btn-secondary">
              {t(lang, 'hero_cta_secondary')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
