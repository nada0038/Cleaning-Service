'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle2, ChevronRight, ChevronLeft, CreditCard, MapPin } from 'lucide-react';
import styles from './BookingWizard.module.css';

interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  duration: string;
}

export default function BookingWizard() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    notes: '',
    paymentMethod: 'STRIPE',
  });

  const [bookingResult, setBookingResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Services from API
  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success) {
          setServices(data.services);
          if (data.services.length > 0) {
            setFormData(prev => ({ ...prev, serviceId: data.services[0].id }));
          }
        } else {
          setError('Failed to load services.');
        }
      } catch (err) {
        setError('Network error loading services.');
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  // Listen for custom service selection events from external service cards
  useEffect(() => {
    const handleSelectService = (e: Event) => {
      const customEvent = e as CustomEvent<{ serviceId: string }>;
      if (customEvent.detail && customEvent.detail.serviceId) {
        setFormData(prev => ({ ...prev, serviceId: customEvent.detail.serviceId }));
        setStep(2); // Jump directly to schedule screen
        
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('select-service', handleSelectService);
    return () => window.removeEventListener('select-service', handleSelectService);
  }, [services]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectedService = services.find(s => s.id === formData.serviceId);

  // Step Navigations
  const nextStep = () => {
    if (step === 1 && !formData.serviceId) return;
    if (step === 2 && (!formData.date || !formData.time)) return;
    if (step === 3 && (!formData.customerName || !formData.customerEmail || !formData.customerPhone)) return;
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        if (data.url) {
          // Redirect to Stripe Checkout page
          window.location.href = data.url;
        } else {
          setBookingResult(data.booking);
          setStep(5); // Success step
        }
      } else {
        setError(data.error || 'Something went wrong. Please check inputs.');
      }
    } catch (err) {
      setError('Connection failure. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      serviceId: services[0]?.id || '',
      date: '',
      time: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      address: '',
      notes: '',
      paymentMethod: 'STRIPE',
    });
    setBookingResult(null);
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.pulseSpinner}></div>
        <p>Preparing the Booking Wizard...</p>
      </div>
    );
  }

  // Get tomorrow's date to restrict past selections
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className={styles.wizardCard}>
      {/* Step Tracker Indicator */}
      {step < 5 && (
        <div className={styles.stepIndicator}>
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`${styles.stepDot} ${step >= num ? styles.activeDot : ''} ${
                step === num ? styles.currentDot : ''
              }`}
            >
              <span>{num}</span>
            </div>
          ))}
        </div>
      )}

      {error && <div className={styles.errorBanner}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Select Your Service</h3>
            <p className={styles.stepDesc}>Choose the premium cleaning package that fits your requirements.</p>
            <div className={styles.serviceSelector}>
              {services.map((service) => (
                <label
                  key={service.id}
                  className={`${styles.serviceOption} ${
                    formData.serviceId === service.id ? styles.selectedOption : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="serviceId"
                    value={service.id}
                    checked={formData.serviceId === service.id}
                    onChange={handleChange}
                    className={styles.hiddenRadio}
                  />
                  <div className={styles.serviceInfo}>
                    <span className={styles.serviceName}>{service.name}</span>
                    <span className={styles.serviceDescription}>{service.description}</span>
                  </div>
                  <div className={styles.servicePricing}>
                    <span className={styles.priceLabel}>Starting from</span>
                    <span className={styles.priceValue}>${service.basePrice}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Choose Schedule */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Schedule Appointment</h3>
            <p className={styles.stepDesc}>Pick a convenient date and time slot for our professional clean.</p>
            
            <div className={styles.scheduleGrid}>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>
                  <Calendar size={16} /> Date Selection
                </label>
                <input
                  type="date"
                  name="date"
                  min={getMinDate()}
                  value={formData.date}
                  onChange={handleChange}
                  className={styles.dateInput}
                  required
                />
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>
                  <Clock size={16} /> Preferred Time Slot
                </label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={styles.selectInput}
                  required
                >
                  <option value="">Select a time slot</option>
                  <option value="08:00">08:00 AM - Morning Slot</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="12:00">12:00 PM - Midday Slot</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="16:00">04:00 PM - Afternoon Slot</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Customer Details */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Contact Details</h3>
            <p className={styles.stepDesc}>Enter your contact information so we can confirm the booking details.</p>
            
            <div className={styles.contactForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <User size={16} /> Full Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  placeholder="e.g. Jonathan Doe"
                  value={formData.customerName}
                  onChange={handleChange}
                  className={styles.textInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Mail size={16} /> Email Address
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  placeholder="e.g. jonathan@gmail.com"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className={styles.textInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Phone size={16} /> Mobile Number
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className={styles.textInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <MapPin size={16} /> Service Site Address
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g. 100 Luxury Way, Apt 4B, Beverly Hills, CA 90210"
                  value={formData.address}
                  onChange={handleChange}
                  className={styles.textInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FileText size={16} /> Special Instructions (Optional)
                </label>
                <textarea
                  name="notes"
                  placeholder="Key lockbox combination, pet details, or priority cleaning focus areas..."
                  value={formData.notes}
                  onChange={handleChange}
                  className={styles.textareaInput}
                  rows={3}
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review and Submit */}
        {step === 4 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Confirm Your Details</h3>
            <p className={styles.stepDesc}>Please review all booking choices before finalizing the appointment.</p>
            
            <div className={styles.reviewCard}>
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Cleaning Service</span>
                <span className={styles.reviewValue}>{selectedService?.name}</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Date & Time</span>
                <span className={styles.reviewValue}>{formData.date} at {formData.time}</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Customer Info</span>
                <span className={styles.reviewValue}>{formData.customerName} ({formData.customerPhone})</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Service Address</span>
                <span className={styles.reviewValue}>{formData.address}</span>
              </div>
              {formData.notes && (
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Instructions</span>
                  <span className={styles.reviewValue}>{formData.notes}</span>
                </div>
              )}
              <div className={styles.divider}></div>

              {/* Payment Method Selector */}
              <div style={{ marginTop: '1.25rem' }}>
                <label className={styles.label} style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                  <CreditCard size={16} /> Choose Payment Option
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem', borderRadius: '10px', border: `1.5px solid ${formData.paymentMethod === 'STRIPE' ? 'var(--primary)' : 'var(--border)'}`, backgroundColor: formData.paymentMethod === 'STRIPE' ? 'var(--surface-hover)' : 'transparent', cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="STRIPE"
                      checked={formData.paymentMethod === 'STRIPE'}
                      onChange={handleChange}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-main)' }}>Pay Online (Stripe)</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cards, Apple / Google Pay</span>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1rem', borderRadius: '10px', border: `1.5px solid ${formData.paymentMethod === 'CASH' ? 'var(--primary)' : 'var(--border)'}`, backgroundColor: formData.paymentMethod === 'CASH' ? 'var(--surface-hover)' : 'transparent', cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CASH"
                      checked={formData.paymentMethod === 'CASH'}
                      onChange={handleChange}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-main)' }}>Pay In-Person</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cash or Card on service day</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className={styles.divider}></div>
              <div className={styles.priceSummary}>
                <span>Total Base Price</span>
                <span className={styles.finalCost}>${selectedService?.basePrice}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Success Page */}
        {step === 5 && bookingResult && (
          <div className={`${styles.stepContent} ${styles.successContainer}`}>
            <CheckCircle2 className={styles.successIcon} size={64} />
            <h3 className={styles.successTitle}>Booking Confirmed!</h3>
            <p className={styles.successDesc}>
              Thank you, {bookingResult.customerName}. Your booking request has been successfully submitted!
            </p>
            
            <div className={styles.detailsTicket}>
              <div><strong>Booking ID:</strong> {bookingResult.id.slice(0, 8).toUpperCase()}</div>
              <div><strong>Service:</strong> {bookingResult.service.name}</div>
              <div><strong>Date:</strong> {bookingResult.date}</div>
              <div><strong>Time:</strong> {bookingResult.time}</div>
              <div><strong>Status:</strong> <span className={styles.badgePending}>{bookingResult.status}</span></div>
            </div>
            
            <p className={styles.ticketFootnote}>
              An email confirmation has been dispatched. Our administrative office will verify your slots and approve within 2 hours.
            </p>

            <button type="button" onClick={resetForm} className="btn btn-primary">
              Book Another Service
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className={styles.navigation}>
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="btn btn-secondary">
                <ChevronLeft size={16} /> Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={
                  (step === 1 && !formData.serviceId) ||
                  (step === 2 && (!formData.date || !formData.time)) ||
                  (step === 3 && (!formData.customerName || !formData.customerEmail || !formData.customerPhone || !formData.address))
                }
                className="btn btn-primary"
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-accent"
              >
                {isSubmitting ? 'Finalizing...' : 'Book Cleaning Now'}
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
