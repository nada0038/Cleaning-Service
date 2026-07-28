'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import styles from './FAQ.module.css';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className={`${styles.faqItem} ${isOpen ? styles.itemOpen : ''}`}>
      <button onClick={onToggle} className={styles.questionBtn} aria-expanded={isOpen}>
        <span>{question}</span>
        <ChevronDown size={18} className={`${styles.chevron} ${isOpen ? styles.rotateChevron : ''}`} />
      </button>
      <div className={styles.answerWrapper} style={{ height: isOpen ? 'auto' : 0 }}>
        <div className={styles.answerContent}>
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { lang } = useLanguage();

  const faqs = [
    { qKey: 'faq_q1' as const, aKey: 'faq_a1' as const },
    { qKey: 'faq_q2' as const, aKey: 'faq_a2' as const },
    { qKey: 'faq_q3' as const, aKey: 'faq_a3' as const },
    { qKey: 'faq_q4' as const, aKey: 'faq_a4' as const },
    { qKey: 'faq_q5' as const, aKey: 'faq_a5' as const },
  ];

  return (
    <section id="faq" className={`section-padding ${styles.faqSection}`}>
      <div className="container">
        <div className="section-header">
          <span className="badge">{t(lang, 'faq_badge')}</span>
          <h2>{t(lang, 'faq_heading')}</h2>
          <p>{t(lang, 'faq_subheading')}</p>
        </div>
        <div className={styles.faqList}>
          {faqs.map(({ qKey, aKey }, index) => (
            <FAQItem
              key={index}
              question={t(lang, qKey)}
              answer={t(lang, aKey)}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(prev => prev === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
