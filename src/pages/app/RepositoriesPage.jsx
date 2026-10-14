import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RefreshCw, Search, AlertTriangle } from 'lucide-react';
import { getRepositories } from '../../api/repository.api';
import RepositoryCard from '../../components/repositories/RepositoryCard';
import { RepositoriesGridSkeleton } from '../../components/repositories/RepositorySkeleton';
import RepositoryEmptyState from '../../components/repositories/RepositoryEmptyState';
import RepositoryFilters from '../../components/repositories/RepositoryFilters';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------
export const repoKeys = {
  list: (refresh) => ['repositories', { refresh }],
};

// ---------------------------------------------------------------------------
// Client-side filtering & sorting helpers
// ---------------------------------------------------------------------------
function applyFilter(repos, filter) {
  if (filter === 'all') return repos;
  if (filter === 'public') return repos.filter((r) => !r.isPrivate);
  if (filter === 'private') return repos.filter((r) => r.isPrivate);
  // IndexStatus values: PENDING | INDEXING | READY | FAILED
  return repos.filter((r) => r.indexStatus === filter);
}

function applySearch(repos, query) {
  if (!query.trim()) return repos;
  const q = query.toLowerCase();
  return repos.filter(
    (r) =>
      r.name?.toLowerCase().includes(q) ||
      r.fullName?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q)
  );
}

const STATUS_ORDER = { INDEXING: 0, PENDING: 1, READY: 2, FAILED: 3 };

function applySort(repos, sortBy) {
  const sorted = [...repos];
  if (sortBy === 'name-asc') return sorted.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === 'name-desc') return sorted.sort((a, b) => b.name.localeCompare(a.name));
  if (sortBy === 'status') {
    return sorted.sort(
      (a, b) =>
        (STATUS_ORDER[a.indexStatus] ?? 99) - (STATUS_ORDER[b.indexStatus] ?? 99)
    );
  }
  return sorted;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function RepositoriesPage() {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');

  // Load repos from local DB cache (refresh=false) on mount
  const {
    data: repositories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: repoKeys.list(false),
    queryFn: () => getRepositories(false),
    staleTime: 1000 * 60 * 2, // 2 min cache
  });

  // Sync with GitHub — triggers refresh=true
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const fresh = await getRepositories(true);
      // Seed both cache keys with the fresh data
      queryClient.setQueryData(repoKeys.list(false), fresh);
      queryClient.setQueryData(repoKeys.list(true), fresh);
      toast.success(`Synced ${fresh.length} repositories from GitHub`);
    } catch (err) {
      const msg =
        err?.response?.status === 401
          ? 'Session expired — please log in again.'
          : err?.response?.status >= 500
          ? 'Server error while syncing. Please try again.'
          : 'Failed to sync repositories.';
      toast.error(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  // Derived: filter + search + sort
  const displayed = useMemo(() => {
    let result = applyFilter(repositories, activeFilter);
    result = applySearch(result, search);
    result = applySort(result, sortBy);
    return result;
  }, [repositories, activeFilter, search, sortBy]);

  const hasRepos = repositories.length > 0;
  const hasResults = displayed.length > 0;
  const isFiltered = activeFilter !== 'all' || search.trim() !== '';

  return (
    <div
      style={{
        padding: '32px 40px',
        maxWidth: '1100px',
        animation: 'fadeIn 200ms ease forwards',
      }}
    >
      {/* ── Page header ───────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}
          >
            Repositories
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
            Connect and manage the GitHub repositories you want GitLoom to understand.
          </p>
        </div>

        {/* Sync button */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            background: isSyncing ? 'var(--bg-overlay)' : 'var(--accent)',
            color: isSyncing ? 'var(--text-tertiary)' : '#fff',
            fontSize: '13px',
            fontWeight: 500,
            border: '1px solid',
            borderColor: isSyncing ? 'var(--border-base)' : 'transparent',
            cursor: isSyncing ? 'not-allowed' : 'pointer',
            transition: 'background var(--transition-fast)',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { if (!isSyncing) e.currentTarget.style.background = 'var(--accent-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = isSyncing ? 'var(--bg-overlay)' : 'var(--accent)'; }}
        >
          <RefreshCw
            size={14}
            style={{ animation: isSyncing ? 'spin 0.8s linear infinite' : 'none' }}
          />
          {isSyncing ? 'Syncing…' : 'Sync with GitHub'}
        </button>
      </div>

      {/* ── Error state ────────────────────────────────────────── */}
      {isError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '16px 20px',
            background: 'var(--danger-subtle)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '24px',
          }}
        >
          <AlertTriangle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--danger)', marginBottom: '2px' }}>
              Failed to load repositories
            </p>
            <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)' }}>
              {error?.response?.status === 401
                ? 'Your session has expired. Please log in again.'
                : error?.message ?? 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
          <button
            onClick={refetch}
            style={{
              marginLeft: 'auto',
              padding: '4px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'transparent',
              color: 'var(--danger)',
              fontSize: '12px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Search + Filters (only if we have repos) ──────────── */}
      {!isLoading && hasRepos && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="search"
              placeholder="Search repositories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '8px 12px 8px 34px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-base)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                transition: 'border-color var(--transition-fast)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-base)')}
            />
          </div>

          <RepositoryFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
      )}

      {/* ── Content area ──────────────────────────────────────── */}
      {isLoading ? (
        <RepositoriesGridSkeleton count={6} />
      ) : !hasRepos ? (
        <RepositoryEmptyState onSync={handleSync} isSyncing={isSyncing} />
      ) : !hasResults ? (
        <RepositoryEmptyState filtered onSync={handleSync} isSyncing={isSyncing} />
      ) : (
        <>
          {/* Result count */}
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-tertiary)',
              marginBottom: '12px',
            }}
          >
            {displayed.length} {displayed.length === 1 ? 'repository' : 'repositories'}
            {isFiltered && repositories.length !== displayed.length
              ? ` of ${repositories.length}`
              : ''}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '12px',
            }}
          >
            {displayed.map((repo) => (
              <RepositoryCard key={repo.id} repo={repo} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
