'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Sparkles, Lock, Mail, CheckCircle2, ArrowLeft, User } from 'lucide-react';
import styles from './LoginPage.module.css';

export default function AdminLogin() {
  const [mode, setMode] = useState<'login' | 'forgot' | 'email-recovery'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchName, setSearchName] = useState('');
  const [recoveredEmails, setRecoveredEmails] = useState<string[]>([]);
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

  const handleForgotEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setRecoveredEmails([]);

    try {
      const res = await fetch('/api/auth/forgot-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: searchName }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message);
        setRecoveredEmails(data.emails || []);
        if (data.primaryEmail) {
          setEmail(data.primaryEmail);
        }
      } else {
        setError(data.error || 'No matching admin email found.');
      }
    } catch (err) {
      setError('Network error searching for admin account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={`glass-card ${styles.loginCard}`}>
        <div className={styles.header}>
          <Sparkles className={styles.logoIcon} />
          <h2>
            {mode === 'login' && 'LuxeShine Portal'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'email-recovery' && 'Recover Admin Email'}
          </h2>
          <p>
            {mode === 'login' && 'Sign in to moderate bookings and update dashboard settings.'}
            {mode === 'forgot' && 'Enter your admin email to generate a secure password reset link.'}
            {mode === 'email-recovery' && 'Enter your name or submit to search for registered admin login emails.'}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>{successMessage}</span>
              </div>

              {recoveredEmails.length > 0 && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Registered Admin Email(s):</span>
                  {recoveredEmails.map((em, idx) => (
                    <div key={idx} style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'monospace' }}>
                      {em}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className="btn btn-primary"
                    style={{ marginTop: '0.75rem', width: '100%', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  >
                    Use This Email to Sign In
                  </button>
                </div>
              )}

              {generatedResetUrl && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <span style={{ fontSize: '0.75rem', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Direct Reset Link:</span>
                  <a href={generatedResetUrl} style={{ fontSize: '0.75rem', textDecoration: 'underline', wordBreak: 'break-all', color: 'inherit' }}>
                    {generatedResetUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className={styles.form}>
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label">
                  <Mail size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Email Address
                </label>
                <button
                  type="button"
                  onClick={() => { setMode('email-recovery'); setError(''); setSuccessMessage(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Forgot Email?
                </button>
              </div>
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
        )}

        {mode === 'forgot' && (
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

        {mode === 'email-recovery' && (
          <form onSubmit={handleForgotEmail} className={styles.form}>
            <div className="input-group">
              <label className="input-label">
                <User size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Admin Display Name (Optional)
              </label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="input-field"
                placeholder="e.g. LuxeShine Admin or leave blank"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? 'Searching Database...' : 'Recover Admin Email Address'}
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
