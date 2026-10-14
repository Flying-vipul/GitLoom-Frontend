import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquare,
  GitBranch,
  ArrowRight,
  CheckCircle,
  RefreshCw,
  XCircle,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { getRepositories } from '../../api/repository.api';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Metric card used in the stats row
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        flex: '1 1 140px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: 'var(--radius-md)',
          background: `${color}1a`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} color={color} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1,
            marginBottom: '4px',
          }}
        >
          {value}
        </p>
        <p style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>{label}</p>
      </div>
    </div>
  );
}

// Mini repository row for the "Recent" section
function RecentRepoRow({ repo, onClick }) {
  const statusColors = {
    READY: 'var(--success)',
    INDEXING: 'var(--warning)',
    PENDING: 'var(--text-tertiary)',
    FAILED: 'var(--danger)',
  };

  return (
    <button
      onClick={() => onClick(repo.id)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background var(--transition-fast)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Status dot */}
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: statusColors[repo.indexStatus] ?? 'var(--text-tertiary)',
          flexShrink: 0,
        }}
      />

      {/* Repo name */}
      <span
        style={{
          flex: 1,
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {repo.fullName}
      </span>

      {/* Language */}
      {repo.language && (
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', flexShrink: 0 }}>
          {repo.language}
        </span>
      )}

      <ArrowRight size={13} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
    </button>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch repos from cache (no GitHub refresh on dashboard)
  const { data: repositories = [], isLoading: reposLoading } = useQuery({
    queryKey: ['repositories', { refresh: false }],
    queryFn: () => getRepositories(false),
    staleTime: 1000 * 60 * 5,
  });

  // Compute metrics from real data
  const totalRepos = repositories.length;
  const readyRepos = repositories.filter((r) => r.indexStatus === 'READY').length;
  const indexingRepos = repositories.filter(
    (r) => r.indexStatus === 'INDEXING' || r.indexStatus === 'PENDING'
  ).length;
  const failedRepos = repositories.filter((r) => r.indexStatus === 'FAILED').length;

  // Recent: first 4, sorted alphabetically
  const recentRepos = [...repositories]
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 4);

  return (
    <div
      style={{
        padding: '32px 40px',
        maxWidth: '900px',
        animation: 'fadeIn 200ms ease forwards',
      }}
    >
      {/* ── Welcome ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
          {getGreeting()}
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '26px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '6px',
          }}
        >
          {user?.displayName || 'Developer'}
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Here's an overview of your GitLoom workspace.
        </p>
      </div>

      {/* ── Repository metrics ─────────────────────────────────── */}
      <div style={{ marginBottom: '32px' }}>
        <h2
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          Repositories
        </h2>

        {reposLoading ? (
          // Skeleton row
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ flex: '1 1 140px', height: '70px', borderRadius: 'var(--radius-lg)' }}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <StatCard
              icon={Layers}
              label="Total repositories"
              value={totalRepos}
              color="var(--accent-text)"
            />
            <StatCard
              icon={CheckCircle}
              label="Indexed"
              value={readyRepos}
              color="var(--success)"
            />
            <StatCard
              icon={RefreshCw}
              label="Indexing / Pending"
              value={indexingRepos}
              color="var(--warning)"
            />
            <StatCard
              icon={XCircle}
              label="Failed"
              value={failedRepos}
              color="var(--danger)"
            />
          </div>
        )}
      </div>

      {/* ── Quick actions ──────────────────────────────────────── */}
      <div style={{ marginBottom: '32px' }}>
        <h2
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          Quick Actions
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1px',
            background: 'var(--border-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          {[
            {
              icon: GitBranch,
              title: 'Manage repositories',
              desc: 'Sync, browse, and check indexing status of your GitHub repos.',
              to: '/app/repositories',
            },
            {
              icon: MessageSquare,
              title: 'Start a conversation',
              desc: 'Ask anything about your indexed code and documents.',
              to: '/app/chat',
            },
          ].map(({ icon: Icon, title, desc, to }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              style={{
                background: 'var(--bg-surface)',
                border: 'none',
                padding: '24px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--bg-overlay)',
                  border: '1px solid var(--border-base)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={15} color="var(--text-secondary)" />
              </div>
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <span
                    style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}
                  >
                    {title}
                  </span>
                  <ArrowRight size={13} color="var(--text-tertiary)" />
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                  {desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Recent Repositories ────────────────────────────────── */}
      {!reposLoading && recentRepos.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <h2
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-tertiary)',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
              }}
            >
              Repositories
            </h2>
            <button
              onClick={() => navigate('/app/repositories')}
              style={{
                fontSize: '12px',
                color: 'var(--accent-text)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.textDecoration = 'underline')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.textDecoration = 'none')
              }
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              padding: '6px',
            }}
          >
            {recentRepos.map((repo) => (
              <RecentRepoRow
                key={repo.id}
                repo={repo}
                onClick={(id) => navigate(`/app/repositories/${id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── User info ──────────────────────────────────────────── */}
      <div
        style={{
          padding: '16px 20px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--border-base)',
            }}
          />
        ) : (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            {user?.displayName?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p
            style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)' }}
          >
            {user?.displayName}
          </p>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            @{user?.githubUsername}
          </p>
        </div>
      </div>
    </div>
  );
}
