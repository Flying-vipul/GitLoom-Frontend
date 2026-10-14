/**
 * RepositoryFilters
 *
 * Client-side filter pills + sort dropdown for the repositories list.
 * Filters are derived from actual IndexStatus enum values returned by the backend:
 *   PENDING | INDEXING | READY | FAILED
 */

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'public', label: 'Public' },
  { key: 'private', label: 'Private' },
  { key: 'READY', label: 'Ready' },
  { key: 'INDEXING', label: 'Indexing' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'FAILED', label: 'Failed' },
];

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A → Z)' },
  { value: 'name-desc', label: 'Name (Z → A)' },
  { value: 'status', label: 'Status' },
];

export default function RepositoryFilters({ activeFilter, onFilterChange, sortBy, onSortChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
      }}
    >
      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1 }}>
        {FILTERS.map(({ key, label }) => {
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              onClick={() => onFilterChange(key)}
              style={{
                padding: '4px 12px',
                borderRadius: '99px',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-base)'}`,
                background: isActive ? 'var(--accent-subtle)' : 'transparent',
                color: isActive ? 'var(--accent-text)' : 'var(--text-tertiary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Sort dropdown */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        style={{
          padding: '5px 10px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-base)',
          background: 'var(--bg-surface)',
          color: 'var(--text-secondary)',
          fontSize: '12px',
          cursor: 'pointer',
          outline: 'none',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {SORT_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value} style={{ background: 'var(--bg-surface)' }}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
