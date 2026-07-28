'use client';

import { useState } from 'react';
import styles from './InteractiveGallery.module.css';

interface InteractiveGalleryProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function InteractiveGallery({
  beforeImage = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
  afterImage = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
  beforeLabel = 'Before Cleaning',
  afterLabel = 'After LuxeShine',
}: InteractiveGalleryProps) {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.imageWrapper}>
        {/* After Image (Background) */}
        <img
          src={afterImage}
          alt="After LuxeShine Professional Cleaning"
          className={styles.image}
          loading="lazy"
        />
        <span className={`${styles.label} ${styles.labelAfter}`}>{afterLabel}</span>

        {/* Before Image (Foreground, clipped) */}
        <div
          className={styles.beforeWrapper}
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <img
            src={beforeImage}
            alt="Before Cleaning"
            className={styles.image}
            loading="lazy"
          />
          <span className={`${styles.label} ${styles.labelBefore}`}>{beforeLabel}</span>
        </div>

        {/* Slider Handle Divider */}
        <div
          className={styles.sliderLine}
          style={{ left: `${sliderPosition}%` }}
        >
          <div className={styles.sliderButton}>
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              width={16}
              height={16}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              width={16}
              height={16}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Invisible Range Input for Drag Control */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={handleSliderChange}
          className={styles.sliderInput}
          aria-label="Drag to compare before and after cleaning photos"
        />
      </div>
    </div>
  );
}
