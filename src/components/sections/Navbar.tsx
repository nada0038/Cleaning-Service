'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Sparkles, Globe } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, setLang } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 900) setIsOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { key: 'nav_services', href: '#services' },
    { key: 'nav_about', href: '#about' },
    { key: 'nav_gallery', href: '#gallery' },
    { key: 'nav_pricing', href: '#pricing' },
    { key: 'nav_reviews', href: '#testimonials' },
    { key: 'nav_faq', href: '#faq' },
    { key: 'nav_contact', href: '#contact' },
  ] as const;

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.navContainer}`}>
        {/* Brand Logo */}
        <a href="#hero" className={styles.logo}>
          <Sparkles className={styles.logoIcon} size={20} />
          <span>LuxeShine</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {navLinks.map((link) => (
            <a key={link.key} href={link.href} className={styles.navLink}>
              {t(lang, link.key)}
            </a>
          ))}
        </nav>

        {/* Actions (Theme Toggle, Language Toggle, CTA, Hamburger) */}
        <div className={styles.actions}>
          <ThemeToggle />

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
            className={styles.langBtn}
            aria-label={lang === 'en' ? 'Switch to French' : 'Passer en anglais'}
            title={lang === 'en' ? 'Switch to French' : 'Switch to English'}
          >
            <Globe size={15} />
            <span>{lang === 'en' ? 'FR' : 'EN'}</span>
          </button>

          <a href="#booking" className={`btn btn-primary ${styles.ctaBtn}`}>
            {t(lang, 'nav_cta')}
          </a>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={styles.menuBtn}
            aria-label="Toggle Navigation Menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className={styles.mobileMenu} role="dialog" aria-label="Mobile navigation">
          <nav className={styles.mobileLinks}>
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={styles.mobileLink}
              >
                {t(lang, link.key)}
              </a>
            ))}

            {/* Language toggle inside mobile menu */}
            <button
              onClick={() => { setLang(lang === 'en' ? 'fr' : 'en'); setIsOpen(false); }}
              className={styles.mobileLangBtn}
            >
              <Globe size={16} />
              {lang === 'en' ? 'Passer en Français' : 'Switch to English'}
            </button>

            <a
              href="#booking"
              onClick={() => setIsOpen(false)}
              className="btn btn-primary"
              style={{ marginTop: '0.5rem', width: '100%', textAlign: 'center' }}
            >
              {t(lang, 'nav_cta')}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
