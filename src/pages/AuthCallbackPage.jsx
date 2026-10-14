import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Zap, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const { refetchUser } = useAuth();
  const navigate = useNavigate();
  const called = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    // The backend has already established the session and set DEVPILOT_SESSION cookie.
    // We just need to fetch /api/auth/me to hydrate our auth state.
    refetchUser()
      .then((user) => {
        if (user) {
          navigate('/app/dashboard', { replace: true });
        } else {
          setError('Authentication failed. Please try signing in again.');
        }
      })
      .catch(() => {
        setError('Could not complete sign-in. Please try again.');
      });
  }, [refetchUser, navigate]);

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '24px',
      }}>
        <div style={{
          width: '40px', height: '40px',
          background: 'var(--danger-subtle)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AlertCircle size={18} color="var(--danger)" />
        </div>
        <div style={{ textAlign: 'center', maxWidth: '380px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Sign-in failed
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: '20px' }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px',
              background: 'var(--accent)', border: 'none',
              borderRadius: 'var(--radius-md)',
              color: '#fff', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
    }}>
      <div style={{
        width: '40px', height: '40px',
        background: 'var(--accent)',
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Zap size={18} color="#fff" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '20px', height: '20px',
          border: '2px solid var(--border-strong)',
          borderTop: '2px solid var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
          Completing sign-in…
        </span>
      </div>
    </div>
  );
}
