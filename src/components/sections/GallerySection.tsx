'use client';

import { useState } from 'react';
import InteractiveGallery from '../ui/InteractiveGallery';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import styles from './GallerySection.module.css';

export default function GallerySection() {
  const [activeTab, setActiveTab] = useState<'kitchen' | 'bathroom' | 'lounge'>('kitchen');
  const { lang } = useLanguage();

  const slides = {
    kitchen: {
      before: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1000&auto=format&fit=crop&q=80',
      after:  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&auto=format&fit=crop&q=80',
      beforeLabel: t(lang, 'gallery_label_before'),
      afterLabel:  t(lang, 'gallery_label_after'),
    },
    bathroom: {
      before: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=1000&auto=format&fit=crop&q=80',
      after:  'https://images.unsplash.com/photo-1620626011161-997c51922a57?w=1000&auto=format&fit=crop&q=80',
      beforeLabel: t(lang, 'gallery_label_before'),
      afterLabel:  t(lang, 'gallery_label_after'),
    },
    lounge: {
      before: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80',
      after:  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000&auto=format&fit=crop&q=80',
      beforeLabel: t(lang, 'gallery_label_before'),
      afterLabel:  t(lang, 'gallery_label_after'),
    },
  };

  const tabs = [
    { key: 'kitchen' as const,  label: t(lang, 'gallery_tab_kitchen')  },
    { key: 'bathroom' as const, label: t(lang, 'gallery_tab_bathroom') },
    { key: 'lounge' as const,   label: t(lang, 'gallery_tab_lounge')   },
  ];

  return (
    <section id="gallery" className={`section-padding ${styles.gallerySection}`}>
      <div className="container">
        <div className="section-header">
          <span className="badge">{t(lang, 'gallery_badge')}</span>
          <h2>{t(lang, 'gallery_heading')}</h2>
          <p>{t(lang, 'gallery_subheading')}</p>
        </div>

        {/* Tab Selector */}
        <div className={styles.tabContainer}>
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`${styles.tabBtn} ${activeTab === key ? styles.activeTabBtn : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Slider */}
        <div className={styles.sliderPresenter}>
          <InteractiveGallery
            beforeImage={slides[activeTab].before}
            afterImage={slides[activeTab].after}
            beforeLabel={slides[activeTab].beforeLabel}
            afterLabel={slides[activeTab].afterLabel}
            key={activeTab}
          />
        </div>
      </div>
    </section>
  );
}
