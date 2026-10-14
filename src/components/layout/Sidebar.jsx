import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  GitBranch,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';

const NAV_ITEMS = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/repositories', icon: GitBranch, label: 'Repositories' },
  { to: '/app/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/app/documents', icon: BookOpen, label: 'Knowledge Base' },
];

const BOTTOM_ITEMS = [
  { to: '/app/profile', icon: User, label: 'Profile' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const width = collapsed ? '52px' : '220px';

  return (
    <aside style={{
      width,
      minWidth: width,
      height: '100vh',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 200ms ease',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Logo */}
      <div style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        padding: collapsed ? '0 14px' : '0 16px',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '10px',
        flexShrink: 0,
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          background: 'var(--accent)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Zap size={13} color="#fff" />
        </div>
        {!collapsed && (
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '15px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}>
            DevPilot
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: collapsed ? '8px 14px' : '7px 10px',
              borderRadius: 'var(--radius-md)',
              color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
              background: isActive ? 'var(--bg-hover)' : 'transparent',
              fontWeight: isActive ? 500 : 400,
              fontSize: '13.5px',
              transition: 'background var(--transition-fast), color var(--transition-fast)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textDecoration: 'none',
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }
            }}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div style={{
        padding: '8px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}>
        {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: collapsed ? '8px 14px' : '7px 10px',
              borderRadius: 'var(--radius-md)',
              color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
              background: isActive ? 'var(--bg-hover)' : 'transparent',
              fontWeight: isActive ? 500 : 400,
              fontSize: '13.5px',
              transition: 'background var(--transition-fast), color var(--transition-fast)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textDecoration: 'none',
            })}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }
            }}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign out' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: collapsed ? '8px 14px' : '7px 10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-tertiary)',
            background: 'transparent',
            border: 'none',
            fontSize: '13.5px',
            cursor: 'pointer',
            transition: 'background var(--transition-fast), color var(--transition-fast)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            width: '100%',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--danger-subtle)';
            e.currentTarget.style.color = 'var(--danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Sign out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: collapsed ? '8px 14px' : '7px 10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-tertiary)',
            background: 'transparent',
            border: 'none',
            fontSize: '13.5px',
            cursor: 'pointer',
            transition: 'background var(--transition-fast), color var(--transition-fast)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            width: '100%',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
          {collapsed ? <ChevronRight size={16} style={{ flexShrink: 0 }} /> : <ChevronLeft size={16} style={{ flexShrink: 0 }} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
