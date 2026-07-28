'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Default to dark for luxury feel

  useEffect(() => {
    // Check local storage or prefers-color-scheme
    const savedTheme = localStorage.getItem('luxe-theme') as 'light' | 'dark' | null;
    const defaultTheme = savedTheme || 'dark';
    
    setTheme(defaultTheme);
    document.documentElement.setAttribute('data-theme', defaultTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('luxe-theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggleBtn}
      aria-label="Toggle visual theme mode"
    >
      <div className={`${styles.iconContainer} ${theme === 'dark' ? styles.isDark : ''}`}>
        <Sun className={styles.sunIcon} size={18} />
        <Moon className={styles.moonIcon} size={18} />
      </div>
    </button>
  );
}
