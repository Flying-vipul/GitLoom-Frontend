import { useNavigate } from 'react-router-dom';
import { LogOut, ExternalLink, Shield } from 'lucide-react';
import GithubIcon from '../../components/ui/GithubIcon';
import { useAuth } from '../../auth/AuthProvider';

function InfoRow({ label, value, mono = false }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{label}</span>
      <span style={{
        fontSize: '13px',
        color: 'var(--text-primary)',
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        fontWeight: 500,
      }}>{value || '—'}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '680px', animation: 'fadeIn 200ms ease forwards' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '22px', fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
        marginBottom: '28px',
      }}>
        Profile
      </h1>

      {/* Avatar card */}
      <div style={{
        padding: '24px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}>
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            style={{
              width: '72px', height: '72px',
              borderRadius: '50%',
              border: '2px solid var(--border-base)',
              flexShrink: 0,
            }}
          />
        ) : (
          <div style={{
            width: '72px', height: '72px',
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '28px', fontWeight: 700,
            flexShrink: 0,
          }}>
            {user?.displayName?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px', fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            marginBottom: '4px',
          }}>
            {user?.displayName}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            @{user?.githubUsername}
          </p>
          <a
            href={`https://github.com/${user?.githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              marginTop: '8px',
              fontSize: '12px',
              color: 'var(--accent-text)',
              textDecoration: 'none',
            }}
          >
            <GithubIcon size={12} />
            View GitHub profile
            <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Details */}
      <div style={{
        padding: '4px 20px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '16px',
      }}>
        <InfoRow label="Display name" value={user?.displayName} />
        <InfoRow label="GitHub username" value={`@${user?.githubUsername}`} mono />
        <InfoRow label="GitHub ID" value={user?.githubId?.toString()} mono />
        <div style={{ padding: '12px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Authentication</span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '3px 10px',
              background: 'var(--success-subtle)',
              borderRadius: '99px',
            }}>
              <Shield size={10} color="var(--success)" />
              <span style={{ fontSize: '11.5px', color: 'var(--success)', fontWeight: 500 }}>GitHub OAuth2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div style={{
        padding: '20px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
      }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Session
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
            You are authenticated via GitHub. Signing out will clear your session.
          </p>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '7px 14px',
              background: 'transparent',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)',
              fontSize: '13px', fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger-subtle)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
