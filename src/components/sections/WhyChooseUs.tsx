'use client';

import { Shield, Star, Zap, ClipboardList, Sparkles, Smile } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import styles from './WhyChooseUs.module.css';

export default function WhyChooseUs() {
  const { lang } = useLanguage();

  const reasons = [
    { icon: Shield,       titleKey: 'why_reason1_title' as const, descKey: 'why_reason1_desc' as const },
    { icon: Star,         titleKey: 'why_reason2_title' as const, descKey: 'why_reason2_desc' as const },
    { icon: Zap,          titleKey: 'why_reason3_title' as const, descKey: 'why_reason3_desc' as const },
    { icon: ClipboardList,titleKey: 'why_reason4_title' as const, descKey: 'why_reason4_desc' as const },
    { icon: Sparkles,     titleKey: 'why_reason5_title' as const, descKey: 'why_reason5_desc' as const },
    { icon: Smile,        titleKey: 'why_reason6_title' as const, descKey: 'why_reason6_desc' as const },
  ];

  return (
    <section className={`section-padding ${styles.whySection}`}>
      <div className="container">
        <div className="section-header">
          <span className="badge">{t(lang, 'why_badge')}</span>
          <h2>{t(lang, 'why_heading')}</h2>
          <p>{t(lang, 'why_subheading')}</p>
        </div>
        <div className={styles.grid}>
          {reasons.map(({ icon: Icon, titleKey, descKey }, i) => (
            <div key={i} className={`glass-card ${styles.reasonCard}`}>
              <div className={styles.iconCircle}>
                <Icon size={22} className={styles.icon} />
              </div>
              <h3 className={styles.cardTitle}>{t(lang, titleKey)}</h3>
              <p className={styles.cardDesc}>{t(lang, descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
