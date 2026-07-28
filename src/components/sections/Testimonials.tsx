'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Quote, Heart } from 'lucide-react';
import SkeletonLoader from '../ui/SkeletonLoader';
import styles from './Testimonials.module.css';

interface Testimonial {
  id: string;
  author: string;
  company: string;
  rating: number;
  text: string;
  image: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Submit Review Form State
  const [formData, setFormData] = useState({
    author: '',
    company: '',
    rating: 5,
    text: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const loadTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      if (data.success) {
        setTestimonials(data.testimonials);
      } else {
        setError('Failed to fetch reviews.');
      }
    } catch (err) {
      setError('Network error loading reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'rating' ? Number(value) : value }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitMessage(data.message);
        setFormData({ author: '', company: '', rating: 5, text: '' });
      } else {
        setSubmitError(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      setSubmitError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="testimonials" className={`section-padding ${styles.testimonialsSection}`}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="badge badge-primary">Client Praises</span>
          <h2>Client Testimonials</h2>
          <p>Read honest reviews from our commercial partners and private estate homeowners.</p>
        </div>

        <div className={styles.layoutGrid}>
          {/* Left Column: Testimonials Display */}
          <div className={styles.displayCol}>
            {loading ? (
              <SkeletonLoader count={2} type="row" />
            ) : error ? (
              <p className={styles.errorText}>{error}</p>
            ) : testimonials.length === 0 ? (
              <p className={styles.noReviews}>No reviews approved yet.</p>
            ) : (
              <div className={styles.reviewsGrid}>
                {testimonials.map((item) => (
                  <div key={item.id} className={`glass-card ${styles.reviewCard}`}>
                    <Quote className={styles.quoteIcon} />
                    
                    <div className={styles.starsRow}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < item.rating ? styles.filledStar : styles.emptyStar}
                        />
                      ))}
                    </div>

                    <p className={styles.reviewText}>"{item.text}"</p>

                    <div className={styles.authorRow}>
                      <img
                        src={item.image}
                        alt={item.author}
                        className={styles.authorAvatar}
                        loading="lazy"
                      />
                      <div className={styles.authorMeta}>
                        <strong className={styles.authorName}>{item.author}</strong>
                        {item.company && (
                          <span className={styles.authorCompany}>{item.company}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Submit A Testimonial Form */}
          <div className={styles.formCol}>
            <div className={`glass-card ${styles.writeCard}`}>
              <div className={styles.formHeader}>
                <MessageSquare className={styles.formIcon} />
                <h3>Share Your Experience</h3>
              </div>
              <p className={styles.formSubtitle}>We appreciate all client feedback. Share your review below.</p>

              {submitMessage && <div className={styles.successAlert}>{submitMessage}</div>}
              {submitError && <div className={styles.errorAlert}>{submitError}</div>}

              <form onSubmit={handleSubmitReview} className={styles.form}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    name="author"
                    placeholder="e.g. Sandra Bullock"
                    value={formData.author}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Company / Title (Optional)</label>
                  <input
                    type="text"
                    name="company"
                    placeholder="e.g. Estate Client"
                    value={formData.company}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Star Rating</label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="5">5 Stars - Exceptional Clean</option>
                    <option value="4">4 Stars - Very Good</option>
                    <option value="3">3 Stars - Average</option>
                    <option value="2">2 Stars - Below Average</option>
                    <option value="1">1 Star - Unsatisfactory</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Your Review Message</label>
                  <textarea
                    name="text"
                    placeholder="How was the attention to detail, punctuality, and professionalism?"
                    value={formData.text}
                    onChange={handleChange}
                    className="input-field"
                    rows={4}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {isSubmitting ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
