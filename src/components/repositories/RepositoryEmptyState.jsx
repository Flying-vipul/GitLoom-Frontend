import { GitBranch, RefreshCw } from 'lucide-react';

/**
 * RepositoryEmptyState
 *
 * Shown when no repositories exist or no repositories match the current filters.
 */
export default function RepositoryEmptyState({ filtered = false, onSync, isSyncing = false }) {
  if (filtered) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          gap: '12px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border-base)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GitBranch size={20} color="var(--text-tertiary)" />
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            No repositories match
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
            Try adjusting your search or filter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        gap: '16px',
        textAlign: 'center',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '56px',
          height: '56px',
          background: 'var(--accent-subtle)',
          border: '1px solid rgba(109,40,217,0.2)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GitBranch size={24} color="var(--accent-text)" />
      </div>

      {/* Copy */}
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '6px',
          }}
        >
          No repositories yet
        </h3>
        <p style={{ fontSize: '13.5px', color: 'var(--text-tertiary)', lineHeight: 1.6, maxWidth: '340px' }}>
          Sync your GitHub account to load your repositories and start indexing them for AI search.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onSync}
        disabled={isSyncing}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '9px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--accent)',
          color: '#fff',
          fontSize: '13.5px',
          fontWeight: 500,
          border: 'none',
          cursor: isSyncing ? 'not-allowed' : 'pointer',
          opacity: isSyncing ? 0.7 : 1,
          transition: 'opacity var(--transition-fast), background var(--transition-fast)',
        }}
        onMouseEnter={(e) => { if (!isSyncing) e.currentTarget.style.background = 'var(--accent-hover)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
      >
        <RefreshCw
          size={14}
          style={{ animation: isSyncing ? 'spin 0.8s linear infinite' : 'none' }}
        />
        {isSyncing ? 'Syncing…' : 'Sync with GitHub'}
      </button>
    </div>
  );
}
