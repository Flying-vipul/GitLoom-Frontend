/**
 * RepositoryStatusBadge
 *
 * Renders a colored pill badge that reflects the backend IndexStatus enum:
 *   PENDING | INDEXING | READY | FAILED
 */

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'var(--text-tertiary)',
    bg: 'var(--bg-overlay)',
    border: 'var(--border-base)',
    pulse: false,
  },
  INDEXING: {
    label: 'Indexing',
    color: 'var(--warning)',
    bg: 'var(--warning-subtle)',
    border: 'rgba(245,158,11,0.25)',
    pulse: true,
  },
  READY: {
    label: 'Ready',
    color: 'var(--success)',
    bg: 'var(--success-subtle)',
    border: 'rgba(34,197,94,0.25)',
    pulse: false,
  },
  FAILED: {
    label: 'Failed',
    color: 'var(--danger)',
    bg: 'var(--danger-subtle)',
    border: 'rgba(239,68,68,0.25)',
    pulse: false,
  },
};

export default function RepositoryStatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status ?? 'Unknown',
    color: 'var(--text-tertiary)',
    bg: 'var(--bg-overlay)',
    border: 'var(--border-base)',
    pulse: false,
  };

  const fontSize = size === 'lg' ? '12px' : '11px';
  const padding = size === 'lg' ? '3px 10px' : '2px 7px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize,
        fontWeight: 500,
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '99px',
        padding,
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
      }}
    >
      {/* Dot indicator */}
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: config.color,
          flexShrink: 0,
          animation: config.pulse ? 'pulse 2s ease-in-out infinite' : 'none',
        }}
      />
      {config.label}
    </span>
  );
}
