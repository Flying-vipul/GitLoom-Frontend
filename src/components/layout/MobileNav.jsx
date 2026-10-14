import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, BookOpen, User, GitBranch } from 'lucide-react';

const ITEMS = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/app/repositories', icon: GitBranch, label: 'Repos' },
  { to: '/app/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/app/documents', icon: BookOpen, label: 'Docs' },
  { to: '/app/profile', icon: User, label: 'Profile' },
];

export default function MobileNav() {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-md)',
            color: isActive ? 'var(--accent-text)' : 'var(--text-tertiary)',
            textDecoration: 'none',
            transition: 'color var(--transition-fast)',
          })}
        >
          <Icon size={20} />
          <span style={{ fontSize: '10px', fontWeight: 500 }}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
