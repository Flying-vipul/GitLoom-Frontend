/**
 * DocumentsPage — Repository Indexing Overview
 *
 * The backend does NOT have a document upload API. Documents are indexed
 * from GitHub repositories via the indexing pipeline. This page reflects
 * that reality: it shows indexed repositories and their file/chunk metrics,
 * not an upload UI.
 */

import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  GitBranch, FileText, Layers, MessageSquare, CheckCircle,
  AlertTriangle, RefreshCw, Lock, Globe, ExternalLink, ArrowRight,
} from 'lucide-react';
import { getRepositories } from '../../api/repository.api';

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(iso));
  } catch {
    return null;
  }
}

// ── Stat pill ─────────────────────────────────────────────────────────────────

function StatPill({ icon: Icon, value, label, color = 'var(--text-tertiary)' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '5px',
      padding: '4px 10px',
      background: 'var(--bg-overlay)',
      border: '1px solid var(--border-base)',
      borderRadius: 'var(--radius-sm)',
    }}>
      <Icon size={12} color={color} />
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{label}</span>
    </div>
  );
}

// ── Indexed repository row ────────────────────────────────────────────────────

function IndexedRepoCard({ repo, onChat, onView }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      transition: 'border-color var(--transition-fast)',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-base)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>{repo.owner}</span>
            <span style={{ color: 'var(--border-strong)', fontSize: '11px' }}>/</span>
            <span style={{
              fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {repo.name}
            </span>
          </div>
          {repo.description && (
            <p style={{
              fontSize: '12.5px', color: 'var(--text-tertiary)', lineHeight: 1.5,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
            }}>
              {repo.description}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {repo.htmlUrl && (
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '26px', height: '26px',
                background: 'transparent', border: '1px solid var(--border-base)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-tertiary)', textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <StatPill icon={FileText} value={repo.filesTotal} label="files" color="var(--accent-text)" />
        <StatPill icon={Layers} value={repo.chunkCount} label="chunks" color="var(--accent-text)" />
        {repo.language && (
          <div style={{
            padding: '4px 10px',
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border-base)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>{repo.language}</span>
          </div>
        )}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '4px 10px',
          background: 'var(--bg-overlay)', border: '1px solid var(--border-base)',
          borderRadius: 'var(--radius-sm)',
        }}>
          {repo.isPrivate ? <Lock size={10} color="var(--text-tertiary)" /> : <Globe size={10} color="var(--text-tertiary)" />}
          <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
            {repo.isPrivate ? 'Private' : 'Public'}
          </span>
        </div>
        {repo.indexedAt && (
          <span style={{ fontSize: '11px', color: 'var(--text-disabled)', marginLeft: 'auto' }}>
            Indexed {formatDate(repo.indexedAt)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onChat(repo)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px',
            background: 'var(--accent)', border: 'none',
            borderRadius: 'var(--radius-md)',
            color: '#fff', fontSize: '12.5px', fontWeight: 500,
            cursor: 'pointer', transition: 'background var(--transition-fast)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
        >
          <MessageSquare size={13} />
          Ask AI
        </button>
        <button
          onClick={() => onView(repo.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px',
            background: 'transparent', border: '1px solid var(--border-base)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)', fontSize: '12.5px', fontWeight: 500,
            cursor: 'pointer', transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          Details <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Pending/Failed repositories ───────────────────────────────────────────────

function PendingRepoRow({ repo, onView }) {
  const isIndexing = repo.indexStatus === 'INDEXING';
  const isFailed = repo.indexStatus === 'FAILED';
  const isPending = repo.indexStatus === 'PENDING';

  const statusColor = isFailed ? 'var(--danger)' : isIndexing ? 'var(--warning)' : 'var(--text-tertiary)';
  const statusLabel = isFailed ? 'Failed' : isIndexing ? 'Indexing…' : 'Pending';

  return (
    <button
      onClick={() => onView(repo.id)}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px',
        background: 'transparent', border: 'none',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer', textAlign: 'left',
        transition: 'background var(--transition-fast)',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
        background: statusColor,
        animation: isIndexing ? 'pulse 2s ease-in-out infinite' : 'none',
      }} />
      <span style={{
        flex: 1, fontSize: '13px', fontWeight: 500,
        color: 'var(--text-secondary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {repo.fullName}
      </span>
      <span style={{ fontSize: '11.5px', color: statusColor, flexShrink: 0 }}>
        {isIndexing && repo.filesTotal > 0
          ? `${repo.filesProcessed}/${repo.filesTotal} files`
          : statusLabel}
      </span>
      <ArrowRight size={12} color="var(--text-tertiary)" />
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const navigate = useNavigate();

  const { data: repos = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['repositories', { refresh: false }],
    queryFn: () => getRepositories(false),
    staleTime: 1000 * 60 * 2,
  });

  const readyRepos = repos.filter(r => r.indexStatus === 'READY');
  const pendingRepos = repos.filter(r => r.indexStatus !== 'READY');

  const totalFiles = readyRepos.reduce((sum, r) => sum + (r.filesTotal || 0), 0);
  const totalChunks = readyRepos.reduce((sum, r) => sum + (r.chunkCount || 0), 0);

  const handleChat = (repo) => {
    // Navigate to chat; the ChatPage will prompt to create a session
    navigate('/app/chat');
  };

  const handleView = (id) => navigate(`/app/repositories/${id}`);

  return (
    <div style={{ padding: '32px 40px', maxWidth: '900px', animation: 'fadeIn 200ms ease forwards' }}>

      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700,
          color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '6px',
        }}>
          Knowledge Base
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
          DevPilot indexes your GitHub repositories, not uploaded files. Each repository's code is
          split into searchable chunks and stored in the vector database for AI-powered Q&amp;A.
        </p>
      </div>

      {/* Stats summary */}
      {!isLoading && readyRepos.length > 0 && (
        <div style={{
          display: 'flex', gap: '10px', flexWrap: 'wrap',
          padding: '16px 20px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '28px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {readyRepos.length}
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>Indexed repositories</span>
          </div>
          <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 8px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {totalFiles.toLocaleString()}
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>Source files</span>
          </div>
          <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 8px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {totalChunks.toLocaleString()}
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>Vector chunks</span>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '12px',
          padding: '16px 20px',
          background: 'var(--danger-subtle)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius-lg)', marginBottom: '24px',
        }}>
          <AlertTriangle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--danger)', marginBottom: '2px' }}>
              Failed to load repositories
            </p>
            <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)' }}>
              Could not fetch your repository data.
            </p>
          </div>
          <button
            onClick={refetch}
            style={{
              padding: '4px 12px', borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(239,68,68,0.3)', background: 'transparent',
              color: 'var(--danger)', fontSize: '12px', cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Ready repositories */}
      {!isLoading && (
        <>
          {readyRepos.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <CheckCircle size={14} color="var(--success)" />
                <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Ready to chat
                </h2>
                <span style={{
                  fontSize: '11px', color: 'var(--success)',
                  background: 'var(--success-subtle)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: '99px', padding: '1px 8px',
                }}>
                  {readyRepos.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {readyRepos.map(repo => (
                  <IndexedRepoCard
                    key={repo.id}
                    repo={repo}
                    onChat={handleChat}
                    onView={handleView}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pending/indexing/failed */}
          {pendingRepos.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <RefreshCw size={14} color="var(--text-tertiary)" />
                <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Not yet indexed
                </h2>
                <span style={{
                  fontSize: '11px', color: 'var(--text-tertiary)',
                  background: 'var(--bg-overlay)', border: '1px solid var(--border-base)',
                  borderRadius: '99px', padding: '1px 8px',
                }}>
                  {pendingRepos.length}
                </span>
              </div>
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}>
                {pendingRepos.map(repo => (
                  <PendingRepoRow key={repo.id} repo={repo} onView={handleView} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {repos.length === 0 && (
            <div style={{
              padding: '60px 24px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '16px', textAlign: 'center',
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
            }}>
              <div style={{
                width: '48px', height: '48px',
                background: 'var(--bg-overlay)', border: '1px solid var(--border-base)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <GitBranch size={22} color="var(--text-tertiary)" />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  No repositories synced yet
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: 1.6, maxWidth: '360px' }}>
                  Go to Repositories to sync your GitHub repos. Once indexed, they'll appear here ready for AI chat.
                </p>
              </div>
              <button
                onClick={() => navigate('/app/repositories')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px',
                  background: 'var(--accent)', border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff', fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer', transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                <GitBranch size={14} />
                Go to Repositories
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
