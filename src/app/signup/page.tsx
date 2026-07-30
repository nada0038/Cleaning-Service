'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Sparkles, Lock, Mail, User, CheckCircle2, ArrowRight } from 'lucide-react';
import styles from '../admin/login/LoginPage.module.css';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success) {
          if (data.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        }
      } catch (e) {
        // Not logged in
      }
    }
    checkSession();
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(data.error || 'Failed to create account.');
      }
    } catch (err) {
      setError('Connection failure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={`glass-card ${styles.loginCard}`}>
        <div className={styles.header}>
          <Sparkles className={styles.logoIcon} />
          <h2>Create Account</h2>
          <p>Join LuxeShine to easily manage bookings and enjoy luxury cleaning services.</p>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ color: '#10b981', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <CheckCircle2 size={48} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Account Created Successfully!</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Welcome to LuxeShine. Redirecting to home page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className={styles.form}>
            <div className="input-group">
              <label className="input-label">
                <User size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="e.g. Eleanor Vance"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <Mail size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="eleanor@example.com"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <Lock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Minimum 6 characters"
                minLength={6}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <Lock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Re-enter password"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <a href="/admin/login" style={{ color: 'var(--accent)', textDecoration: 'underline', fontWeight: 600 }}>
                Sign In
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
