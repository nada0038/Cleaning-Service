'use client';

import { Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import styles from './Pricing.module.css';

export default function Pricing() {
  const { lang } = useLanguage();

  const packages = [
    {
      id: 'regular',
      nameKey: 'pricing_plan1_name' as const,
      descKey: 'pricing_plan1_desc' as const,
      price: '90',
      featureKeys: ['pricing_plan1_f1','pricing_plan1_f2','pricing_plan1_f3','pricing_plan1_f4','pricing_plan1_f5'] as const,
      serviceDbId: 'ae6a8b68-e66e-4433-801f-2084961b56b5',
    },
    {
      id: 'deep',
      nameKey: 'pricing_plan2_name' as const,
      descKey: 'pricing_plan2_desc' as const,
      price: '160',
      featureKeys: ['pricing_plan2_f1','pricing_plan2_f2','pricing_plan2_f3','pricing_plan2_f4','pricing_plan2_f5'] as const,
      serviceDbId: '20121dc1-f35f-4ca4-9665-bf16f9ac198f',
      highlighted: true,
    },
    {
      id: 'bond',
      nameKey: 'pricing_plan3_name' as const,
      descKey: 'pricing_plan3_desc' as const,
      price: '290',
      featureKeys: ['pricing_plan3_f1','pricing_plan3_f2','pricing_plan3_f3','pricing_plan3_f4','pricing_plan3_f5'] as const,
      serviceDbId: '1e6c8129-a4bc-4e34-80a1-8217f215d2ac',
    },
  ];

  const handleBook = (id: string) => {
    window.dispatchEvent(new CustomEvent('select-service', { detail: { serviceId: id } }));
  };

  return (
    <section id="pricing" className={`section-padding ${styles.pricingSection}`}>
      <div className="container">
        <div className="section-header">
          <span className="badge">{t(lang, 'pricing_badge')}</span>
          <h2>{t(lang, 'pricing_heading')}</h2>
          <p>{t(lang, 'pricing_subheading')}</p>
        </div>

        <div className={styles.grid}>
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`${styles.card} ${pkg.highlighted ? styles.highlightedCard : ''}`}
            >
              <div className={styles.cardHeader}>
                <h3 className={styles.title}>{t(lang, pkg.nameKey)}</h3>
                <p className={styles.desc}>{t(lang, pkg.descKey)}</p>
              </div>

              <div className={styles.priceContainer}>
                <span className={styles.currency}>$</span>
                <span className={styles.price}>{pkg.price}</span>
                <span className={styles.period}>{t(lang, 'pricing_per_clean')}</span>
              </div>

              <ul className={styles.features}>
                {pkg.featureKeys.map((key) => (
                  <li key={key} className={styles.featureItem}>
                    <Check size={13} className={styles.checkIcon} />
                    <span>{t(lang, key)}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBook(pkg.serviceDbId)}
                className={`btn ${pkg.highlighted ? 'btn-primary' : 'btn-secondary'} ${styles.btn}`}
              >
                {t(lang, 'pricing_choose')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
