import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, AlertCircle } from 'lucide-react';
import GithubIcon from '../components/ui/GithubIcon';
import { redirectToGithubLogin } from '../api/auth.api';
import { useAuth } from '../auth/AuthProvider';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('error');

  useEffect(() => {
    if (!loading && user) navigate('/app/dashboard', { replace: true });
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Logo mark */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px',
          background: 'var(--accent)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <Zap size={18} color="#fff" />
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '18px', fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>DevPilot</span>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '360px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-base)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px', fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          marginBottom: '6px',
        }}>
          Welcome back
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-tertiary)', marginBottom: '28px', lineHeight: 1.5 }}>
          Sign in with your GitHub account to access your knowledge base.
        </p>

        {/* OAuth error */}
        {oauthError && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px',
            padding: '12px',
            background: 'var(--danger-subtle)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
          }}>
            <AlertCircle size={14} color="var(--danger)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '13px', color: 'var(--danger)', lineHeight: 1.4 }}>
              {oauthError === 'oauth_failed'
                ? 'GitHub authentication failed. Please try again.'
                : 'Something went wrong. Please try again.'}
            </span>
          </div>
        )}

        {/* GitHub button */}
        <button
          onClick={redirectToGithubLogin}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '9px',
            padding: '10px 16px',
            background: 'var(--text-primary)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: 'var(--bg-base)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity var(--transition-fast), transform var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.88';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <GithubIcon size={16} />
          Continue with GitHub
        </button>

        <p style={{
          marginTop: '20px',
          fontSize: '12px',
          color: 'var(--text-disabled)',
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          By continuing, you agree to DevPilot's terms.
          We only request read access to your GitHub profile.
        </p>
      </div>

      <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
        Don't have an account?{' '}
        <button
          onClick={redirectToGithubLogin}
          style={{
            background: 'none', border: 'none',
            color: 'var(--accent-text)',
            cursor: 'pointer', fontSize: '12px',
            textDecoration: 'underline',
          }}
        >
          Create one via GitHub
        </button>
      </p>
    </div>
  );
}
