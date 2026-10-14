/**
 * RepositorySkeleton
 *
 * Shimmer skeleton card for the repository list loading state.
 * Uses the existing `.skeleton` CSS class from index.css.
 */

function SkeletonLine({ width = '100%', height = '12px', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius: 'var(--radius-sm)',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

export function RepositoryCardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <SkeletonLine width="60px" height="10px" />
            <SkeletonLine width="6px" height="10px" />
            <SkeletonLine width="120px" height="14px" />
          </div>
          <SkeletonLine width="80%" height="10px" />
          <SkeletonLine width="55%" height="10px" />
        </div>
        <SkeletonLine width="64px" height="20px" style={{ borderRadius: '99px' }} />
      </div>

      {/* Meta footer */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <SkeletonLine width="48px" height="10px" />
        <SkeletonLine width="40px" height="10px" />
        <SkeletonLine width="56px" height="10px" />
      </div>
    </div>
  );
}

export function RepositoriesGridSkeleton({ count = 6 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '12px',
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <RepositoryCardSkeleton key={i} />
      ))}
    </div>
  );
}
