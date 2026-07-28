'use client';

import BookingWizard from '../ui/BookingWizard';
import styles from './BookingSection.module.css';

export default function BookingSection() {
  return (
    <section id="booking" className={`section-padding ${styles.bookingSection}`}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="badge badge-gold">Secure Placement</span>
          <h2>Schedule Your Custom Service</h2>
          <p>Complete our multi-step booking form. We will verify your requested date and assign a premium cleaning team.</p>
        </div>

        <div className={styles.wizardWrapper}>
          <BookingWizard />
        </div>
      </div>
    </section>
  );
}
