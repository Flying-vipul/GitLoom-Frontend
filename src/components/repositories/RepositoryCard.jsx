import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Lock, Globe, ExternalLink, Code } from 'lucide-react';
import RepositoryStatusBadge from './RepositoryStatusBadge';
import RepositoryProgress from './RepositoryProgress';

export default function RepositoryCard({ repo }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const {
    id,
    name,
    owner,
    fullName,
    description,
    language,
    isPrivate,
    defaultBranch,
    htmlUrl,
    indexStatus,
    filesTotal,
    filesProcessed,
    chunkCount,
    errorMessage,
  } = repo;

  const isIndexing = indexStatus === 'INDEXING';
  const isFailed = indexStatus === 'FAILED';

  return (
    <article
      onClick={() => navigate(`/app/repositories/${id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--bg-hover)' : 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        cursor: 'pointer',
        transition: 'background var(--transition-fast), border-color var(--transition-fast)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderColor: hovered ? 'var(--border-base)' : 'var(--border-subtle)',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ minWidth: 0 }}>
          {/* Owner/repo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              {owner}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--border-strong)' }}>/</span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
          </div>

          {/* Description */}
          {description && (
            <p
              style={{
                fontSize: '12.5px',
                color: 'var(--text-tertiary)',
                lineHeight: 1.5,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Status badge */}
        <div style={{ flexShrink: 0 }}>
          <RepositoryStatusBadge status={indexStatus} />
        </div>
      </div>

      {/* Indexing progress (compact) */}
      {isIndexing && (
        <RepositoryProgress
          filesTotal={filesTotal}
          filesProcessed={filesProcessed}
          chunkCount={chunkCount}
          compact
        />
      )}

      {/* Error message */}
      {isFailed && errorMessage && (
        <p
          style={{
            fontSize: '11.5px',
            color: 'var(--danger)',
            background: 'var(--danger-subtle)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 10px',
            lineHeight: 1.4,
          }}
        >
          {errorMessage}
        </p>
      )}

      {/* Meta footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Visibility */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
          }}
        >
          {isPrivate ? <Lock size={11} /> : <Globe size={11} />}
          {isPrivate ? 'Private' : 'Public'}
        </span>

        {/* Language */}
        {language && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: 'var(--text-tertiary)',
            }}
          >
            <Code size={11} />
            {language}
          </span>
        )}

        {/* Branch */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <GitBranch size={11} />
          {defaultBranch ?? 'main'}
        </span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* GitHub link — stops card navigation propagation */}
        {htmlUrl && (
          <a
            href={htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Open ${fullName} on GitHub`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: 'var(--text-tertiary)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 4px',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <ExternalLink size={11} />
            GitHub
          </a>
        )}
      </div>
    </article>
  );
}
