'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Sparkles, Lock, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import styles from './LoginPage.module.css';

export default function AdminLogin() {
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [generatedResetUrl, setGeneratedResetUrl] = useState('');
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success) {
          router.push('/admin');
        }
      } catch (e) {
        // Not logged in
      }
    }
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid admin credentials');
      }
    } catch (err) {
      setError('Connection failure. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setGeneratedResetUrl('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message || 'Reset link generated.');
        if (data.resetUrl) {
          setGeneratedResetUrl(data.resetUrl);
        }
      } else {
        setError(data.error || 'Failed to process password reset.');
      }
    } catch (err) {
      setError('Network error processing request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={`glass-card ${styles.loginCard}`}>
        <div className={styles.header}>
          <Sparkles className={styles.logoIcon} />
          <h2>{mode === 'login' ? 'LuxeShine Portal' : 'Reset Password'}</h2>
          <p>
            {mode === 'login'
              ? 'Sign in to moderate bookings and update dashboard settings.'
              : 'Enter your admin email to generate a secure password reset link.'}
          </p>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '1rem', fontSize: '0.85rem', lineHeight: '1.4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>Request Processed</span>
            </div>
            <p style={{ marginTop: '0.25rem', color: 'inherit' }}>{successMessage}</p>
            {generatedResetUrl && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ fontSize: '0.75rem', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Direct Reset Link:</span>
                <a href={generatedResetUrl} style={{ fontSize: '0.75rem', textDecoration: 'underline', wordBreak: 'break-all', color: 'inherit' }}>
                  {generatedResetUrl}
                </a>
              </div>
            )}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className={styles.form}>
            <div className="input-group">
              <label className="input-label">
                <Mail size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@luxeshine.com"
                required
              />
            </div>

            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label">
                  <Lock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Security Password
                </label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); setSuccessMessage(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? 'Authenticating...' : 'Secure Authorization'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className={styles.form}>
            <div className="input-group">
              <label className="input-label">
                <Mail size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Registered Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@luxeshine.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? 'Generating Link...' : 'Send Password Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', width: '100%' }}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
