'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import styles from './Contact.module.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setErrorMsg(data.error || 'Failed to submit form.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className={`section-padding ${styles.contactSection}`}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="badge badge-primary">Get In Touch</span>
          <h2>Contact Our Concierge Office</h2>
          <p>Have custom cleaning inquiries, corporate requests, or need specific support? Leave us a message.</p>
        </div>

        <div className={styles.grid}>
          {/* Left Column: Contact info cards + Maps */}
          <div className={styles.infoCol}>
            <div className={styles.infoDetails}>
              <div className={styles.infoItem}>
                <div className={styles.iconBox}>
                  <Phone size={18} />
                </div>
                <div>
                  <h4>Phone Support</h4>
                  <p>+1 (555) 902-8822</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconBox}>
                  <Mail size={18} />
                </div>
                <div>
                  <h4>Email Inquiry</h4>
                  <p>concierge@luxeshine.com</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconBox}>
                  <MapPin size={18} />
                </div>
                <div>
                  <h4>Luxe Office Location</h4>
                  <p>100 Luxury Way, Suite 400, Beverly Hills, CA 90210</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconBox}>
                  <Clock size={18} />
                </div>
                <div>
                  <h4>Operating Hours</h4>
                  <p>Monday - Saturday: 8:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>

            {/* WhatsApp Quick CTA Button */}
            <div className={styles.whatsappBox}>
              <p>Prefer instant messaging for quotes?</p>
              <a
                href="https://wa.me/15559028822?text=Hello%20LuxeShine!%20I'd%20like%20to%20inquire%20about%20a%20cleaning%20booking."
                target="_blank"
                rel="noreferrer"
                className={`btn ${styles.whatsappBtn}`}
              >
                <MessageSquare size={16} /> Chat on WhatsApp
              </a>
            </div>

            {/* Styled Google Maps iframe placeholder */}
            <div className={styles.mapContainer}>
              <iframe
                title="LuxeShine Office Map Locator"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3304.5383569503463!2d-118.40356192376993!3d34.06857481682121!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc074743e493%3A0x29432658eb5b3648!2sBeverly%20Hills%2C%20CA%2090210!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                width="100%"
                height="220"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className={styles.formCol}>
            <div className={`glass-card ${styles.formCard}`}>
              <h3 className={styles.formTitle}>Send Us a Message</h3>
              <p className={styles.formDesc}>We respond to all email messages within 2 hours during operational windows.</p>

              {successMsg && <div className={styles.successMessage}>{successMsg}</div>}
              {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className="input-group">
                  <label className="input-label">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Richard Gere"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. richard@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="e.g. Bespoke Office Deep Clean Quote"
                    value={formData.subject}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Message Details</label>
                  <textarea
                    name="message"
                    placeholder="How can we assist you today? Mention specific sizes, dates or detail requirements..."
                    value={formData.message}
                    onChange={handleChange}
                    className="input-field"
                    rows={5}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'} <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
