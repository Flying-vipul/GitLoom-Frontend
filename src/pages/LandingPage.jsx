import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, BookOpen, MessageSquare, Code2 } from 'lucide-react';
import GithubIcon from '../components/ui/GithubIcon';
import { redirectToGithubLogin } from '../api/auth.api';
import { useAuth } from '../auth/AuthProvider';
import { useEffect } from 'react';

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'AI-Powered Chat',
    desc: 'Ask questions in natural language. Get precise answers sourced from your codebase.',
  },
  {
    icon: BookOpen,
    title: 'Knowledge Base',
    desc: 'Upload docs, READMEs, and specs. DevPilot indexes and retrieves exactly what you need.',
  },
  {
    icon: Code2,
    title: 'Source Citations',
    desc: 'Every answer links back to the exact document and section it came from.',
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users directly to the app
  useEffect(() => {
    if (!loading && user) navigate('/app/dashboard', { replace: true });
  }, [user, loading, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Nav */}
      <nav style={{
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-base)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px', height: '26px',
            background: 'var(--accent)', borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={13} color="#fff" />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: '16px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>DevPilot</span>
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={redirectToGithubLogin}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '6px 14px',
            background: 'transparent',
            border: '1px solid var(--border-base)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            fontSize: '13px', fontWeight: 500,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-strong)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-base)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <GithubIcon size={14} />
          Sign in
        </button>
      </nav>

      {/* Hero */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
        maxWidth: '720px',
        margin: '0 auto',
        width: '100%',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          background: 'var(--accent-subtle)',
          border: '1px solid rgba(109,40,217,0.2)',
          borderRadius: '99px',
          marginBottom: '32px',
        }}>
          <div style={{
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: 'var(--accent-text)',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: '12px', fontWeight: 500,
            color: 'var(--accent-text)',
            letterSpacing: '0.02em',
          }}>AI-Powered RAG for Developers</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 6vw, 60px)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: '20px',
        }}>
          Your codebase,{' '}
          <span style={{ color: 'var(--accent-text)' }}>instantly</span>{' '}
          intelligent.
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
          marginBottom: '40px',
          maxWidth: '520px',
        }}>
          Upload your documentation, specs, and code. Ask anything.
          DevPilot finds the answer and shows you exactly where it came from.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={redirectToGithubLogin}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              fontSize: '14px', fontWeight: 600,
              cursor: 'pointer',
              transition: 'background var(--transition-fast), transform var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-hover)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <GithubIcon size={15} />
            Get started with GitHub
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid var(--border-base)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: '14px', fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-base)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            Sign in
          </button>
        </div>

        {/* Feature grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1px',
          marginTop: '80px',
          width: '100%',
          background: 'var(--border-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
        }}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{
              padding: '28px 24px',
              background: 'var(--bg-surface)',
              textAlign: 'left',
            }}>
              <div style={{
                width: '34px', height: '34px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border-base)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '14px',
              }}>
                <Icon size={16} color="var(--text-secondary)" />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '14px', fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}>{title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: 1.55 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
      }}>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
          Built with Spring AI + pgvector
        </span>
      </footer>
    </div>
  );
}
