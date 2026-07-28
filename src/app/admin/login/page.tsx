'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Sparkles, Lock, Mail } from 'lucide-react';
import styles from './LoginPage.module.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
        // Not logged in, stay here
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

  return (
    <div className={styles.loginContainer}>
      <div className={`glass-card ${styles.loginCard}`}>
        <div className={styles.header}>
          <Sparkles className={styles.logoIcon} />
          <h2>LuxeShine Portal</h2>
          <p>Sign in to moderate bookings and update dashboard settings.</p>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

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
            <label className="input-label">
              <Lock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Security Password
            </label>
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
      </div>
    </div>
  );
}
