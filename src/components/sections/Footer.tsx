'use client';

import { Sparkles, Facebook, Instagram, Linkedin, Heart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { lang } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        {/* Brand */}
        <div className={styles.brandCol}>
          <a href="#hero" className={styles.logo}>
            <Sparkles className={styles.logoIcon} size={18} />
            <span>LuxeShine</span>
          </a>
          <p className={styles.tagline}>{t(lang, 'footer_tagline')}</p>
          <div className={styles.socials}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="LuxeShine on Facebook" className={styles.socialIcon}><Facebook size={15} /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="LuxeShine on Instagram" className={styles.socialIcon}><Instagram size={15} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LuxeShine on LinkedIn" className={styles.socialIcon}><Linkedin size={15} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.linksCol}>
          <h4>{t(lang, 'footer_nav_title')}</h4>
          <ul className={styles.linksList}>
            <li><a href="#services">{t(lang, 'footer_nav_services')}</a></li>
            <li><a href="#about">{t(lang, 'footer_nav_about')}</a></li>
            <li><a href="#gallery">{t(lang, 'footer_nav_gallery')}</a></li>
            <li><a href="#pricing">{t(lang, 'footer_nav_pricing')}</a></li>
            <li><a href="#testimonials">{t(lang, 'footer_nav_reviews')}</a></li>
            <li><a href="#faq">{t(lang, 'footer_nav_faq')}</a></li>
          </ul>
        </div>

        {/* Client Portal */}
        <div className={styles.linksCol}>
          <h4>{t(lang, 'footer_portal_title')}</h4>
          <ul className={styles.linksList}>
            <li><a href="#booking">{t(lang, 'footer_portal_book')}</a></li>
            <li><a href="/signup">Create User Account</a></li>
            <li><a href="/admin/login">{t(lang, 'footer_portal_admin')}</a></li>
            <li><a href="#contact">{t(lang, 'footer_portal_contact')}</a></li>
            <li><a href="#privacy">{t(lang, 'footer_portal_privacy')}</a></li>
            <li><a href="#terms">{t(lang, 'footer_portal_terms')}</a></li>
          </ul>
        </div>

        {/* HQ */}
        <div className={styles.linksCol}>
          <h4>{t(lang, 'footer_hq_title')}</h4>
          <p className={styles.addressText}>100 Luxury Way, Suite 400<br />Beverly Hills, CA 90210</p>
          <p className={styles.supportEmail}>concierge@luxeshine.com</p>
          <p className={styles.supportPhone}>+1 (555) 902-8822</p>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={`container ${styles.bottomContainer}`}>
          <span>&copy; {currentYear} {t(lang, 'footer_copyright')}</span>
          <span className={styles.credits}>
            {t(lang, 'footer_credits')} <Heart size={11} className={styles.heartIcon} /> {t(lang, 'footer_credits_end')}
          </span>
        </div>
      </div>
    </footer>
  );
}
