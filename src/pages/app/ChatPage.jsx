import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Send, Plus, Sparkles, Copy, Check, Loader2, FileText,
  ChevronRight, MessageSquare, AlertTriangle, X, ExternalLink,
  Hash, Code2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  createChatSession,
  listChatSessions,
  getChatMessages,
  streamChatReply,
} from '../../api/chat.api';
import { getRepositories } from '../../api/repository.api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateLocalId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function formatRelativeTime(iso) {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

// ── Code block with copy button ───────────────────────────────────────────────

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') ?? '';
  const code = String(children).replace(/\n$/, '');

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      position: 'relative',
      margin: '0.75em 0',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-base)',
      overflow: 'hidden',
      background: 'var(--code-bg)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-base)',
        background: 'var(--bg-overlay)',
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          {language || 'code'}
        </span>
        <button
          onClick={copy}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 8px',
            background: 'transparent',
            border: '1px solid var(--border-base)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-tertiary)',
            fontSize: '11px', cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '12px', overflowX: 'auto', lineHeight: 1.6 }}>
        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)' }}>
          {code}
        </code>
      </pre>
    </div>
  );
}

// ── Citation card ─────────────────────────────────────────────────────────────

function CitationCard({ citation, repoHtmlUrl, defaultBranch }) {
  // CitationDto fields: filePath, starting (start line), endLine, language
  const { filePath, starting, endLine, language } = citation;

  // Build GitHub URL if we have repo info
  const githubUrl = repoHtmlUrl && filePath
    ? `${repoHtmlUrl}/blob/${defaultBranch || 'main'}/${filePath}${starting ? `#L${starting}${endLine ? `-L${endLine}` : ''}` : ''}`
    : null;

  const fileName = filePath?.split('/').pop() ?? filePath;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '10px 12px',
      background: 'var(--bg-surface-raised)',
      border: '1px solid var(--border-base)',
      borderRadius: 'var(--radius-md)',
      transition: 'border-color var(--transition-fast)',
    }}>
      <div style={{
        width: '28px', height: '28px',
        background: 'var(--bg-overlay)',
        border: '1px solid var(--border-base)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: '1px',
      }}>
        <FileText size={13} color="var(--text-tertiary)" />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          <span style={{
            fontSize: '12.5px', fontWeight: 500, color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontFamily: 'var(--font-mono)',
          }}>
            {fileName}
          </span>
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open on GitHub"
              style={{ color: 'var(--text-tertiary)', flexShrink: 0, display: 'flex' }}
            >
              <ExternalLink size={11} />
            </a>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {filePath && (
            <span style={{
              fontSize: '11px', color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: '200px',
            }}>
              {filePath}
            </span>
          )}
          {starting != null && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '3px',
              fontSize: '11px', color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
              flexShrink: 0,
            }}>
              <Hash size={9} />
              L{starting}{endLine && endLine !== starting ? `–${endLine}` : ''}
            </span>
          )}
          {language && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '3px',
              fontSize: '10px', color: 'var(--text-tertiary)',
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border-base)',
              borderRadius: 'var(--radius-sm)',
              padding: '1px 6px',
              flexShrink: 0,
            }}>
              <Code2 size={9} />
              {language}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      title="Copy response"
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '4px 8px',
        background: 'transparent',
        border: '1px solid var(--border-base)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-tertiary)',
        fontSize: '11px', cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

const MARKDOWN_COMPONENTS = {
  code({ node, inline, className, children, ...props }) {
    if (inline) {
      return (
        <code style={{
          background: 'var(--code-bg)',
          border: '1px solid var(--border-base)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.1em 0.35em',
          fontSize: '0.875em',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
        }} {...props}>{children}</code>
      );
    }
    return <CodeBlock className={className}>{children}</CodeBlock>;
  },
  pre({ children }) {
    return <>{children}</>;
  },
};

function MessageBubble({ message, sessionRepo }) {
  const isUser = message.role === 'USER' || message.role === 'user';
  const citations = message.citations ?? [];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      gap: '6px',
      animation: 'fadeIn 180ms ease forwards',
      maxWidth: '100%',
    }}>
      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
        {isUser ? 'You' : 'DevPilot'}
      </span>

      <div style={{ maxWidth: isUser ? '75%' : '100%', width: isUser ? 'auto' : '100%' }}>
        {isUser ? (
          <div style={{
            padding: '10px 14px',
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-base)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '14px', color: 'var(--text-primary)',
            lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {message.content}
          </div>
        ) : (
          <div>
            <div className={`prose ${message.isStreaming && message.content ? 'streaming-cursor' : ''}`}>
              {message.isStreaming && !message.content ? (
                <div style={{ display: 'flex', gap: '5px', padding: '4px 0', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: 'var(--accent-text)',
                      animation: `pulse 1.4s ease-in-out ${i * 0.22}s infinite`,
                    }} />
                  ))}
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '4px' }}>
                    Thinking…
                  </span>
                </div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={MARKDOWN_COMPONENTS}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>

            {/* Citations */}
            {citations.length > 0 && !message.isStreaming && (
              <div style={{ marginTop: '16px' }}>
                <p style={{
                  fontSize: '10.5px', fontWeight: 600, color: 'var(--text-tertiary)',
                  letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px',
                }}>
                  Sources ({citations.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {citations.map((c, i) => (
                    <CitationCard
                      key={i}
                      citation={c}
                      repoHtmlUrl={sessionRepo?.htmlUrl}
                      defaultBranch={sessionRepo?.defaultBranch}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Copy action */}
            {!message.isStreaming && message.content && (
              <div style={{ marginTop: '10px' }}>
                <CopyButton text={message.content} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Chat input ────────────────────────────────────────────────────────────────

function ChatInput({ onSend, disabled, placeholder = 'Ask anything about your repository…' }) {
  const [value, setValue] = useState('');
  const ref = useRef(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (ref.current) ref.current.style.height = 'auto';
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = e => {
    setValue(e.target.value);
    const el = ref.current;
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 180) + 'px'; }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
      <div
        style={{
          display: 'flex', alignItems: 'flex-end', gap: '10px',
          background: 'var(--bg-base)', border: '1px solid var(--border-base)',
          borderRadius: 'var(--radius-lg)', padding: '10px 12px',
          transition: 'border-color var(--transition-fast)',
        }}
        onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
        onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border-base)'}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            resize: 'none', color: 'var(--text-primary)', fontSize: '14px',
            lineHeight: 1.6, fontFamily: 'var(--font-sans)',
            minHeight: '24px', maxHeight: '180px', overflow: 'auto',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          title="Send (Enter)"
          style={{
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: canSend ? 'var(--accent)' : 'var(--bg-overlay)',
            border: 'none', borderRadius: 'var(--radius-md)',
            color: canSend ? '#fff' : 'var(--text-disabled)',
            cursor: canSend ? 'pointer' : 'not-allowed', flexShrink: 0,
            transition: 'background var(--transition-fast)',
          }}
        >
          {disabled
            ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
            : <Send size={14} />}
        </button>
      </div>
      <p style={{ fontSize: '11px', color: 'var(--text-disabled)', marginTop: '8px', textAlign: 'center' }}>
        Enter to send · Shift+Enter for newline
      </p>
    </div>
  );
}

// ── Session selector modal ────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Summarize the main features of this repository',
  'How does the authentication system work?',
  'What are the main API endpoints?',
  'Explain the database schema and models',
  'What dependencies does this project use?',
];

function EmptyChatState({ onSuggestion, sessionRepo }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', gap: '28px',
      animation: 'fadeIn 250ms ease forwards',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px', height: '48px',
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-base)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Sparkles size={20} color="var(--accent-text)" />
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600,
          color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px',
        }}>
          {sessionRepo ? `Ask about ${sessionRepo.name}` : 'What would you like to know?'}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
          {sessionRepo
            ? `I've indexed your ${sessionRepo.language || ''} repository. Ask me anything about the codebase.`
            : 'Ask a question about your repository. DevPilot will search the codebase and cite its sources.'}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '480px' }}>
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            style={{
              padding: '10px 14px',
              background: 'var(--bg-surface)', border: '1px solid var(--border-base)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)',
              fontSize: '13px', cursor: 'pointer', textAlign: 'left',
              transition: 'all var(--transition-fast)', lineHeight: 1.4,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.borderColor = 'var(--border-strong)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-surface)';
              e.currentTarget.style.borderColor = 'var(--border-base)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── New Session Panel (pick repo) ─────────────────────────────────────────────

function NewSessionPanel({ onCreated, onClose }) {
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const { data: repos = [], isLoading } = useQuery({
    queryKey: ['repositories', { refresh: false }],
    queryFn: () => getRepositories(false),
    staleTime: 1000 * 60 * 5,
  });

  const readyRepos = repos.filter(r => r.indexStatus === 'READY');

  const handleCreate = async () => {
    if (!selectedRepo) return;
    setCreating(true);
    setError(null);
    try {
      const session = await createChatSession({
        repositoryId: selectedRepo.id,
        title: `Chat — ${selectedRepo.name}`,
      });
      onCreated(session, selectedRepo);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to create session. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 150ms ease forwards',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-base)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        width: '100%', maxWidth: '440px',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            New Chat Session
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
          Select a repository to chat with. Only indexed repositories are available.
        </p>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '52px', borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        ) : readyRepos.length === 0 ? (
          <div style={{
            padding: '20px', textAlign: 'center',
            background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
              No indexed repositories yet.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>
              Go to Repositories and trigger indexing first.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
            {readyRepos.map(repo => (
              <button
                key={repo.id}
                onClick={() => setSelectedRepo(repo)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px',
                  background: selectedRepo?.id === repo.id ? 'var(--accent-subtle)' : 'var(--bg-base)',
                  border: `1px solid ${selectedRepo?.id === repo.id ? 'rgba(109,40,217,0.3)' : 'var(--border-base)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  if (selectedRepo?.id !== repo.id) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                  }
                }}
                onMouseLeave={e => {
                  if (selectedRepo?.id !== repo.id) {
                    e.currentTarget.style.background = 'var(--bg-base)';
                    e.currentTarget.style.borderColor = 'var(--border-base)';
                  }
                }}
              >
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: 'var(--success)', flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {repo.fullName}
                  </p>
                  {repo.language && (
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{repo.language}</p>
                  )}
                </div>
                {selectedRepo?.id === repo.id && (
                  <Check size={14} color="var(--accent-text)" />
                )}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div style={{ marginTop: '12px', padding: '10px 12px', background: 'var(--danger-subtle)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontSize: '12.5px', color: 'var(--danger)' }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={!selectedRepo || creating || readyRepos.length === 0}
          style={{
            width: '100%', marginTop: '16px',
            padding: '10px 16px',
            background: !selectedRepo || creating ? 'var(--bg-overlay)' : 'var(--accent)',
            border: '1px solid', borderColor: !selectedRepo || creating ? 'var(--border-base)' : 'transparent',
            borderRadius: 'var(--radius-md)',
            color: !selectedRepo || creating ? 'var(--text-disabled)' : '#fff',
            fontSize: '13px', fontWeight: 500,
            cursor: !selectedRepo || creating ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all var(--transition-fast)',
          }}
        >
          {creating && <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />}
          {creating ? 'Creating…' : 'Start Chat'}
        </button>
      </div>
    </div>
  );
}

// ── Session list sidebar ──────────────────────────────────────────────────────

function SessionSidebar({ sessions, activeSessionId, onSelect, onNew, isLoading }) {
  return (
    <div style={{
      width: '220px', minWidth: '220px',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-surface)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 12px 8px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Sessions
        </span>
        <button
          onClick={onNew}
          title="New chat session"
          style={{
            width: '24px', height: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: '1px solid var(--border-base)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text-tertiary)',
            cursor: 'pointer', transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
        >
          <Plus size={13} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '48px', borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: '20px 12px', textAlign: 'center' }}>
            <MessageSquare size={24} color="var(--text-disabled)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No sessions yet</p>
            <p style={{ fontSize: '11px', color: 'var(--text-disabled)', marginTop: '4px' }}>
              Click + to start a new chat
            </p>
          </div>
        ) : (
          sessions.map(session => {
            const isActive = session.id === activeSessionId;
            return (
              <button
                key={session.id}
                onClick={() => onSelect(session)}
                style={{
                  width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  gap: '2px', padding: '8px 10px',
                  background: isActive ? 'var(--bg-hover)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--border-base)' : 'transparent'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{
                  fontSize: '12.5px', fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  width: '100%',
                }}>
                  {session.title}
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--text-disabled)' }}>
                  {formatRelativeTime(session.createdAt)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Chat error banner ─────────────────────────────────────────────────────────

function ChatErrorBanner({ message, onDismiss }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 16px',
      background: 'var(--danger-subtle)',
      borderTop: '1px solid rgba(239,68,68,0.2)',
    }}>
      <AlertTriangle size={14} color="var(--danger)" style={{ flexShrink: 0 }} />
      <p style={{ flex: 1, fontSize: '13px', color: 'var(--danger)' }}>{message}</p>
      <button
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ── Chat Page ─────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeSession, setActiveSession] = useState(null);  // { id, repositoryId, title, ... }
  const [sessionRepo, setSessionRepo] = useState(null);       // RepositoryResponse for active session
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [showNewSession, setShowNewSession] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);

  const scrollRef = useRef(null);
  const abortStreamRef = useRef(null);

  // Sessions are scoped per-repository — fetch only when we have an active repo
  const {
    data: sessions = [],
    isLoading: sessionsLoading,
  } = useQuery({
    queryKey: ['chat-sessions', activeSession?.repositoryId ?? sessionRepo?.id],
    queryFn: () => listChatSessions(activeSession?.repositoryId ?? sessionRepo?.id),
    enabled: !!(activeSession?.repositoryId ?? sessionRepo?.id),
    staleTime: 1000 * 30,
  });

  // ── Fetch repo list for resolving session repo ─────────────────────────────
  const { data: repos = [] } = useQuery({
    queryKey: ['repositories', { refresh: false }],
    queryFn: () => getRepositories(false),
    staleTime: 1000 * 60 * 5,
  });

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ── When active session changes — load messages ────────────────────────────
  useEffect(() => {
    if (!activeSession) return;

    setMessages([]);
    setMessagesLoaded(false);
    setStreamError(null);

    // Resolve the associated repo
    const repo = repos.find(r => r.id === activeSession.repositoryId);
    setSessionRepo(repo ?? null);

    getChatMessages(activeSession.id)
      .then(msgs => {
        setMessages(msgs.map(m => ({
          ...m,
          isStreaming: false,
        })));
        setMessagesLoaded(true);
      })
      .catch(() => {
        setMessagesLoaded(true); // allow typing even if history fails
      });
  }, [activeSession, repos]);

  // ── Cleanup stream on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => { abortStreamRef.current?.abort(); };
  }, []);

  // ── Handle session selection ────────────────────────────────────────────────
  const handleSelectSession = (session) => {
    abortStreamRef.current?.abort();
    setActiveSession(session);
  };

  // ── Handle new session created ──────────────────────────────────────────────
  const handleSessionCreated = (session, repo) => {
    queryClient.invalidateQueries({ queryKey: ['chat-sessions', session.repositoryId] });
    setShowNewSession(false);
    setActiveSession(session);
    setSessionRepo(repo);
    setMessages([]);
    setMessagesLoaded(true);
  };

  // ── Handle send message (with SSE streaming) ────────────────────────────────
  const handleSend = useCallback((text) => {
    if (!activeSession || streaming) return;

    setStreamError(null);

    // Optimistic user message placeholder (will be replaced by server echo)
    const localId = generateLocalId();
    const optimisticUser = {
      id: localId,
      role: 'USER',
      content: text,
      isStreaming: false,
      citations: [],
      createdAt: new Date().toISOString(),
    };

    // Streaming AI placeholder
    const streamId = generateLocalId() + '_stream';
    const streamPlaceholder = {
      id: streamId,
      role: 'ASSISTANT',
      content: '',
      isStreaming: true,
      citations: [],
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticUser, streamPlaceholder]);
    setStreaming(true);

    let accumulatedTokens = '';
    let serverUserMsgId = null;

    const { abort } = streamChatReply(activeSession.id, text, {
      onUserMessage: (msg) => {
        // Replace optimistic user message with server-persisted one
        serverUserMsgId = msg.id;
        setMessages(prev => prev.map(m =>
          m.id === localId ? { ...msg, isStreaming: false } : m
        ));
      },
      onToken: (token) => {
        accumulatedTokens += token;
        const accumulated = accumulatedTokens;
        setMessages(prev => prev.map(m =>
          m.id === streamId ? { ...m, content: accumulated, isStreaming: true } : m
        ));
      },
      onAssistantMessage: (msg) => {
        // Replace streaming placeholder with final server message
        setMessages(prev => prev.map(m =>
          m.id === streamId ? { ...msg, isStreaming: false } : m
        ));
        accumulatedTokens = '';
      },
      onDone: () => {
        setStreaming(false);
        // Ensure streaming placeholder is finalized even without assistant_message
        setMessages(prev => prev.map(m =>
          m.id === streamId ? { ...m, isStreaming: false } : m
        ));
      },
      onError: (errMsg) => {
        setStreaming(false);
        setStreamError(errMsg || 'An error occurred while generating the response.');
        // Remove the streaming placeholder
        setMessages(prev => prev.filter(m => m.id !== streamId));
      },
    });

    abortStreamRef.current = { abort };
  }, [activeSession, streaming]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg-base)', overflow: 'hidden' }}>

      {/* Session sidebar */}
      <SessionSidebar
        sessions={sessions}
        activeSessionId={activeSession?.id}
        onSelect={handleSelectSession}
        onNew={() => setShowNewSession(true)}
        isLoading={sessionsLoading}
      />

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Chat header */}
        <div style={{
          height: '52px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={15} color="var(--accent-text)" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {activeSession ? activeSession.title : 'AI Chat'}
            </span>
            {sessionRepo && (
              <span style={{
                fontSize: '11px', color: 'var(--text-tertiary)',
                background: 'var(--bg-overlay)', border: '1px solid var(--border-base)',
                borderRadius: 'var(--radius-sm)', padding: '2px 8px',
                fontFamily: 'var(--font-mono)',
              }}>
                {sessionRepo.fullName}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {sessionRepo?.htmlUrl && (
              <a
                href={sessionRepo.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open repository on GitHub"
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '4px 10px',
                  background: 'transparent', border: '1px solid var(--border-base)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-tertiary)', fontSize: '11.5px',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <ExternalLink size={11} />
                GitHub
              </a>
            )}
            <button
              onClick={() => setShowNewSession(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px',
                background: 'transparent', border: '1px solid var(--border-base)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)', fontSize: '12.5px', fontWeight: 500,
                cursor: 'pointer', transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Plus size={13} />
              New chat
            </button>
          </div>
        </div>

        {/* Messages area */}
        {!activeSession ? (
          // No session selected
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '16px', padding: '40px 24px',
            animation: 'fadeIn 250ms ease forwards',
          }}>
            <MessageSquare size={40} color="var(--text-disabled)" />
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                No session selected
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '20px' }}>
                Select a session from the sidebar or start a new one.
              </p>
              <button
                onClick={() => setShowNewSession(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px',
                  background: 'var(--accent)', border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff', fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer', transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                <Plus size={14} />
                New Chat Session
              </button>
            </div>
          </div>
        ) : !messagesLoaded ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={20} color="var(--text-tertiary)" style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div
            ref={scrollRef}
            style={{
              flex: 1, overflowY: 'auto',
              padding: messages.length === 0 ? '0' : '24px 20px',
              display: 'flex', flexDirection: 'column', gap: '24px',
              maxWidth: '760px', width: '100%',
              margin: '0 auto', alignSelf: 'stretch',
            }}
          >
            {messages.length === 0
              ? <EmptyChatState onSuggestion={handleSend} sessionRepo={sessionRepo} />
              : messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    sessionRepo={sessionRepo}
                  />
                ))
            }
          </div>
        )}

        {/* Error banner */}
        {streamError && (
          <ChatErrorBanner
            message={streamError}
            onDismiss={() => setStreamError(null)}
          />
        )}

        {/* Input */}
        {activeSession && (
          <div style={{ maxWidth: '760px', width: '100%', margin: '0 auto', alignSelf: 'stretch' }}>
            <ChatInput
              onSend={handleSend}
              disabled={streaming || !messagesLoaded}
              placeholder={sessionRepo
                ? `Ask anything about ${sessionRepo.name}…`
                : 'Ask anything about your repository…'}
            />
          </div>
        )}
      </div>

      {/* New session modal */}
      {showNewSession && (
        <NewSessionPanel
          onCreated={handleSessionCreated}
          onClose={() => setShowNewSession(false)}
        />
      )}
    </div>
  );
}
