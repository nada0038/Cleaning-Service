'use client';

import { useState, useEffect } from 'react';
import { Home, Sparkles, Key, Briefcase, HelpCircle, Clock, ChevronRight } from 'lucide-react';
import SkeletonLoader from '../ui/SkeletonLoader';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import styles from './Services.module.css';

interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  duration: string;
  icon: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Home,
  Sparkles,
  Key,
  Briefcase,
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { lang } = useLanguage();

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success) {
          setServices(data.services);
        } else {
          setError(t(lang, 'services_error'));
        }
      } catch {
        setError(t(lang, 'services_error'));
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const handleSelectService = (id: string) => {
    window.dispatchEvent(new CustomEvent('select-service', { detail: { serviceId: id } }));
  };

  return (
    <section id="services" className={`section-padding ${styles.servicesSection}`}>
      <div className="container">
        <div className="section-header">
          <span className="badge">{t(lang, 'services_badge')}</span>
          <h2>{t(lang, 'services_heading')}</h2>
          <p>{t(lang, 'services_subheading')}</p>
        </div>

        {loading ? (
          <SkeletonLoader count={4} type="card" />
        ) : error ? (
          <div className={styles.errorCard}>
            <HelpCircle size={32} />
            <p>{error}</p>
          </div>
        ) : (
          <div className={styles.servicesGrid}>
            {services.map((service) => {
              const IconComponent = iconMap[service.icon] || HelpCircle;
              return (
                <div key={service.id} className={`glass-card ${styles.serviceCard}`}>
                  <div className={styles.iconContainer}>
                    <IconComponent size={26} className={styles.serviceIcon} />
                  </div>
                  <h3 className={styles.serviceName}>{service.name}</h3>
                  <p className={styles.serviceDesc}>{service.description}</p>
                  <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                      <Clock size={14} />
                      <span>{service.duration} {t(lang, 'services_avg')}</span>
                    </div>
                    <div className={styles.priceTag}>
                      <span className={styles.priceLabel}>{t(lang, 'services_from')}</span>
                      <span className={styles.priceVal}>${service.basePrice}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectService(service.id)}
                    className={`btn btn-primary ${styles.bookBtn}`}
                  >
                    {t(lang, 'services_select')} <ChevronRight size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
