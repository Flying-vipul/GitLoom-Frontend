import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { useTheme } from '../../context/ThemeProvider';

export default function Header({ isMobile, onSidebarToggle }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '12px',
      flexShrink: 0,
    }}>
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={onSidebarToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <Menu size={18} />
        </button>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-base)',
          background: 'transparent',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'background var(--transition-fast), color var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-hover)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* User avatar */}
      {user && (
        <button
          onClick={() => navigate('/app/profile')}
          aria-label="Open profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-lg)',
            transition: 'background var(--transition-fast)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '1px solid var(--border-base)',
              }}
            />
          ) : (
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              {user.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          {!isMobile && (
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {user.displayName}
            </span>
          )}
        </button>
      )}
    </header>
  );
}
