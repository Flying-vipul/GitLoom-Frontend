import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, ExternalLink, GitBranch, Lock, Globe, Code,
  Calendar, AlertTriangle, RefreshCw, MessageSquare, Play,
  Loader2, CheckCircle, Clock, Database,
} from 'lucide-react';
import { getRepository, getRepositoryStatus, startIndexing, cancelIndexing } from '../../api/repository.api';
import RepositoryStatusBadge from '../../components/repositories/RepositoryStatusBadge';
import RepositoryProgress from '../../components/repositories/RepositoryProgress';

// Statuses that are terminal — stop polling when reached
const TERMINAL_STATUSES = new Set(['READY', 'FAILED']);

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {[100, 60, 80, 45].map((w, i) => (
        <div key={i} className="skeleton" style={{ width: `${w}%`, height: i === 0 ? '28px' : '14px', borderRadius: 'var(--radius-sm)' }} />
      ))}
      <div className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }} />
    </div>
  );
}

// ── Meta row ──────────────────────────────────────────────────────────────────

function MetaRow({ label, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '16px',
      paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)',
    }}>
      <span style={{
        fontSize: '12px', color: 'var(--text-tertiary)',
        minWidth: '120px', paddingTop: '1px', flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
        {children}
      </span>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, value, label }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '4px',
      padding: '14px 18px',
      background: 'var(--bg-base)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      flex: '1 1 100px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <Icon size={13} color="var(--text-tertiary)" />
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{label}</span>
      </div>
      <span style={{
        fontSize: '22px', fontWeight: 700,
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-mono)',
        lineHeight: 1,
      }}>
        {typeof value === 'number' ? value.toLocaleString() : (value ?? '—')}
      </span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RepositoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isStartingIndex, setIsStartingIndex] = useState(false);

  // Repository details
  const {
    data: repo,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['repository', id],
    queryFn: () => getRepository(id),
    retry: 1,
  });

  // Indexing status — poll while PENDING or INDEXING
  const { data: statusData } = useQuery({
    queryKey: ['repository-status', id],
    queryFn: () => getRepositoryStatus(id),
    enabled: !!repo,
    refetchInterval: (query) => {
      const status = query.state.data?.indexStatus ?? repo?.indexStatus;
      if (!status || TERMINAL_STATUSES.has(status)) return false;
      return 3000;
    },
    refetchIntervalInBackground: false,
  });

  // Merge: status poll overrides repo data when available
  const effectiveStatus = statusData?.indexStatus ?? repo?.indexStatus;
  const effectiveFilesTotal = statusData?.filesTotal ?? repo?.filesTotal ?? 0;
  const effectiveFilesProcessed = statusData?.filesProcessed ?? repo?.filesProcessed ?? 0;
  const effectiveChunkCount = statusData?.chunkCount ?? repo?.chunkCount ?? 0;
  const effectiveIndexedAt = statusData?.indexedAt ?? repo?.indexedAt;
  const effectiveError = statusData?.errorMessage ?? repo?.errorMessage;

  const isIndexing = effectiveStatus === 'INDEXING';
  const isPending = effectiveStatus === 'PENDING';
  const isFailed = effectiveStatus === 'FAILED';
  const isReady = effectiveStatus === 'READY';
  const isActive = isIndexing || isPending;

  const handleStartIndex = async () => {
    setIsStartingIndex(true);
    try {
      await startIndexing(id);
      toast.success('Indexing started successfully');
      // Invalidate to re-fetch fresh status
      queryClient.invalidateQueries({ queryKey: ['repository', id] });
      queryClient.invalidateQueries({ queryKey: ['repository-status', id] });
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.response?.status === 404
        ? 'Repository not found.'
        : err?.response?.status === 409
        ? 'Repository is already being indexed.'
        : 'Failed to start indexing. Please try again.';
      toast.error(msg);
    } finally {
      setIsStartingIndex(false);
    }
  };

  const handleCancelIndex = async () => {
    try {
      await cancelIndexing(id);
      toast.success('Cancellation requested');
      queryClient.invalidateQueries({ queryKey: ['repository', id] });
      queryClient.invalidateQueries({ queryKey: ['repository-status', id] });
    } catch (err) {
      toast.error('Failed to cancel indexing.');
    }
  };

  const handleStartChat = () => navigate('/app/chat');

  return (
    <div style={{ padding: '32px 40px', maxWidth: '820px', animation: 'fadeIn 200ms ease forwards' }}>

      {/* Back */}
      <button
        onClick={() => navigate('/app/repositories')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: 'var(--text-tertiary)', background: 'none', border: 'none',
          cursor: 'pointer', fontSize: '13px',
          padding: '0 0 20px 0',
          transition: 'color var(--transition-fast)',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
      >
        <ArrowLeft size={14} />
        Repositories
      </button>

      {/* Loading */}
      {isLoading && <DetailSkeleton />}

      {/* Error */}
      {isError && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '12px',
          padding: '20px',
          background: 'var(--danger-subtle)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <AlertTriangle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--danger)', marginBottom: '4px' }}>
              {error?.response?.status === 404 ? 'Repository not found'
                : error?.response?.status === 403 ? 'Access denied'
                : 'Failed to load repository'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
              {error?.response?.status === 404 ? "This repository doesn't exist or you don't have access."
                : error?.response?.status === 401 ? 'Your session has expired. Please log in again.'
                : 'An unexpected error occurred.'}
            </p>
          </div>
          <button
            onClick={refetch}
            style={{
              padding: '5px 12px', borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(239,68,68,0.3)', background: 'transparent',
              color: 'var(--danger)', fontSize: '12px', cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Repository detail */}
      {repo && !isLoading && (
        <>
          {/* ── Header ─────────────────────────────────────────────── */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: '16px',
            marginBottom: '24px', flexWrap: 'wrap',
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>{repo.owner}</span>
                <span style={{ color: 'var(--border-strong)' }}>/</span>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px', fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {repo.name}
                </h1>
              </div>
              {repo.description && (
                <p style={{ fontSize: '13.5px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                  {repo.description}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
              {/* Chat action (only if READY) */}
              {isReady && (
                <button
                  onClick={handleStartChat}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px',
                    background: 'var(--accent)', border: 'none',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff', fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
                >
                  <MessageSquare size={13} />
                  Start Chat
                </button>
              )}

              {/* Index action (PENDING or FAILED) */}
              {(isPending || isFailed) && (
                <button
                  onClick={handleStartIndex}
                  disabled={isStartingIndex}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px',
                    background: isFailed ? 'var(--danger-subtle)' : 'var(--bg-surface)',
                    border: `1px solid ${isFailed ? 'rgba(239,68,68,0.3)' : 'var(--border-base)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: isFailed ? 'var(--danger)' : 'var(--text-secondary)',
                    fontSize: '13px', fontWeight: 500,
                    cursor: isStartingIndex ? 'not-allowed' : 'pointer',
                    transition: 'all var(--transition-fast)',
                    opacity: isStartingIndex ? 0.6 : 1,
                  }}
                >
                  {isStartingIndex
                    ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
                    : <Play size={13} />}
                  {isStartingIndex ? 'Starting…' : isFailed ? 'Retry Indexing' : 'Start Indexing'}
                </button>
              )}

              {/* Cancel action (INDEXING) */}
              {isIndexing && (
                <button
                  onClick={handleCancelIndex}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px',
                    background: 'var(--bg-surface)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--danger)',
                    fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                >
                  <AlertTriangle size={13} />
                  Cancel Indexing
                </button>
              )}

              {/* GitHub link */}
              {repo.htmlUrl && (
                <a
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '7px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-base)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-secondary)', fontSize: '12.5px', fontWeight: 500,
                    transition: 'all var(--transition-fast)', textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <ExternalLink size={12} />
                  GitHub
                </a>
              )}
            </div>
          </div>

          {/* ── Index Status Panel ──────────────────────────────────── */}
          <section style={{
            background: 'var(--bg-surface)',
            border: `1px solid ${isFailed ? 'rgba(239,68,68,0.25)' : isReady ? 'rgba(34,197,94,0.2)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Index Status
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isActive && (
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RefreshCw size={11} style={{ animation: 'spin 2s linear infinite' }} />
                    Refreshing
                  </span>
                )}
                <RepositoryStatusBadge status={effectiveStatus} size="lg" />
              </div>
            </div>

            {/* INDEXING progress */}
            {isActive && (
              <RepositoryProgress
                filesTotal={effectiveFilesTotal}
                filesProcessed={effectiveFilesProcessed}
                chunkCount={effectiveChunkCount}
              />
            )}

            {/* READY stats */}
            {isReady && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <StatCard icon={Code} value={effectiveFilesTotal} label="Files indexed" />
                <StatCard icon={Database} value={effectiveChunkCount} label="Vector chunks" />
                {effectiveIndexedAt && (
                  <StatCard icon={Calendar} value={formatDate(effectiveIndexedAt)} label="Last indexed" />
                )}
              </div>
            )}

            {/* FAILED */}
            {isFailed && (
              <div style={{
                padding: '12px 14px',
                background: 'var(--danger-subtle)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', gap: '10px', alignItems: 'flex-start',
              }}>
                <AlertTriangle size={14} color="var(--danger)" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '13px', color: 'var(--danger)', lineHeight: 1.5 }}>
                  {effectiveError ?? 'Indexing failed during the background process. Please check your backend logs.'}
                </p>
              </div>
            )}

            {/* PENDING placeholder */}
            {isPending && effectiveFilesTotal === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-tertiary)' }}>
                <Clock size={14} />
                <p style={{ fontSize: '13px' }}>
                  This repository is queued for indexing. Click "Start Indexing" to begin.
                </p>
              </div>
            )}
          </section>

          {/* ── Repository metadata ────────────────────────────────── */}
          <section style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex', flexDirection: 'column', gap: '14px',
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Details
            </h2>

            <MetaRow label="Full name">{repo.fullName}</MetaRow>

            <MetaRow label="Visibility">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                {repo.isPrivate ? <><Lock size={12} /> Private</> : <><Globe size={12} /> Public</>}
              </span>
            </MetaRow>

            {repo.language && (
              <MetaRow label="Language">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Code size={12} /> {repo.language}
                </span>
              </MetaRow>
            )}

            <MetaRow label="Default branch">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <GitBranch size={12} /> {repo.defaultBranch ?? 'main'}
              </span>
            </MetaRow>

            {repo.htmlUrl && (
              <MetaRow label="GitHub URL">
                <a
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--accent-text)', textDecoration: 'underline',
                    textUnderlineOffset: '2px', fontSize: '12.5px',
                    fontFamily: 'var(--font-mono)',
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  {repo.htmlUrl}
                  <ExternalLink size={11} />
                </a>
              </MetaRow>
            )}

            {effectiveIndexedAt && (
              <MetaRow label="Last indexed">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle size={12} color="var(--success)" />
                  {formatDate(effectiveIndexedAt)}
                </span>
              </MetaRow>
            )}
          </section>
        </>
      )}
    </div>
  );
}
