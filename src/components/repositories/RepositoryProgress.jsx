/**
 * RepositoryProgress
 *
 * Shows a progress bar + file/chunk stats when a repository is INDEXING.
 * Handles filesTotal === 0 and null values defensively.
 */

export default function RepositoryProgress({ filesTotal, filesProcessed, chunkCount, compact = false }) {
  const total = filesTotal ?? 0;
  const processed = filesProcessed ?? 0;
  const chunks = chunkCount ?? 0;

  const pct = total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        {/* Bar */}
        <div
          style={{
            flex: 1,
            height: '4px',
            background: 'var(--bg-overlay)',
            borderRadius: '99px',
            overflow: 'hidden',
            minWidth: '60px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: 'var(--warning)',
              borderRadius: '99px',
              transition: 'width 600ms ease',
            }}
          />
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', flexShrink: 0 }}>
          {total > 0 ? `${processed}/${total}` : '—'}
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Progress bar */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            Files indexed
          </span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>
            {pct}%
          </span>
        </div>
        <div
          style={{
            height: '6px',
            background: 'var(--bg-overlay)',
            borderRadius: '99px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--warning), #fb923c)',
              borderRadius: '99px',
              transition: 'width 600ms ease',
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Files</p>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {processed} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>/ {total}</span>
          </p>
        </div>
        {chunks > 0 && (
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Chunks</p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {chunks.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
