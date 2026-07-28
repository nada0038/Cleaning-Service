'use client';

import { ShieldCheck, Heart, Award } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import styles from './About.module.css';

export default function About() {
  const { lang } = useLanguage();

  const metrics = [
    { value: '5,000+', labelKey: 'about_metric1_label' as const },
    { value: '99.8%',  labelKey: 'about_metric2_label' as const },
    { value: '45+',    labelKey: 'about_metric3_label' as const },
    { value: '5.0 ★', labelKey: 'about_metric4_label' as const },
  ];

  return (
    <section id="about" className={`section-padding ${styles.aboutSection}`}>
      <div className="container">
        <div className={styles.grid}>
          {/* Left: Story & Metrics */}
          <div className={styles.storyCol}>
            <span className="badge">{t(lang, 'about_badge')}</span>
            <h2 className={styles.heading}>{t(lang, 'about_heading')}</h2>
            <p className={styles.introParagraph}>{t(lang, 'about_body1')}</p>
            <p className={styles.bodyParagraph}>{t(lang, 'about_body2')}</p>
            <div className={styles.metricsGrid}>
              {metrics.map((metric, i) => (
                <div key={i} className={styles.metricCard}>
                  <span className={styles.metricValue}>{metric.value}</span>
                  <span className={styles.metricLabel}>{t(lang, metric.labelKey)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Value Cards */}
          <div className={styles.valuesCol}>
            <div className={`glass-card ${styles.valueCard}`}>
              <div className={styles.valueHeader}>
                <div className={styles.valueIconContainer}>
                  <ShieldCheck className={styles.valueIcon} />
                </div>
                <h3>{t(lang, 'about_value1_title')}</h3>
              </div>
              <p>{t(lang, 'about_value1_body')}</p>
            </div>

            <div className={`glass-card ${styles.valueCard}`}>
              <div className={styles.valueHeader}>
                <div className={styles.valueIconContainer}>
                  <Award className={styles.valueIcon} />
                </div>
                <h3>{t(lang, 'about_value2_title')}</h3>
              </div>
              <p>{t(lang, 'about_value2_body')}</p>
            </div>

            <div className={`glass-card ${styles.valueCard}`}>
              <div className={styles.valueHeader}>
                <div className={styles.valueIconContainer}>
                  <Heart className={styles.valueIcon} />
                </div>
                <h3>{t(lang, 'about_value3_title')}</h3>
              </div>
              <p>{t(lang, 'about_value3_body')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
