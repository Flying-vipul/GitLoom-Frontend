import { useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';

function SettingRow({ label, description, children }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '24px',
      padding: '16px 0',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '3px' }}>
          {label}
        </p>
        {description && (
          <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
            {description}
          </p>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

const THEME_OPTIONS = [
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ padding: '32px 40px', maxWidth: '680px', animation: 'fadeIn 200ms ease forwards' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '22px', fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
        marginBottom: '28px',
      }}>
        Settings
      </h1>

      {/* Appearance */}
      <div style={{
        padding: '4px 20px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '16px',
      }}>
        <p style={{
          fontSize: '11px', fontWeight: 600,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase', letterSpacing: '0.07em',
          padding: '16px 0 8px',
        }}>
          Appearance
        </p>
        <SettingRow
          label="Theme"
          description="Choose your preferred color scheme."
        >
          <div style={{ display: 'flex', gap: '4px' }}>
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 10px',
                  background: theme === value ? 'var(--bg-active)' : 'transparent',
                  border: `1px solid ${theme === value ? 'var(--border-strong)' : 'var(--border-base)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: theme === value ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontSize: '12.5px', fontWeight: theme === value ? 500 : 400,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label="Font"
          description="UI uses Inter, code uses JetBrains Mono."
        >
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>Inter</span>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>/</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>JetBrains Mono</span>
          </div>
        </SettingRow>
      </div>

      {/* Backend info */}
      <div style={{
        padding: '4px 20px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '16px',
      }}>
        <p style={{
          fontSize: '11px', fontWeight: 600,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase', letterSpacing: '0.07em',
          padding: '16px 0 8px',
        }}>
          System
        </p>
        <SettingRow label="Backend" description="Spring Boot 4 + Spring AI + pgvector">
          <div style={{
            padding: '3px 10px',
            background: 'var(--success-subtle)',
            borderRadius: '99px',
            fontSize: '11.5px', fontWeight: 500,
            color: 'var(--success)',
          }}>
            Connected
          </div>
        </SettingRow>
        <SettingRow label="Authentication" description="GitHub OAuth2 with session-based auth">
          <div style={{
            padding: '3px 10px',
            background: 'var(--success-subtle)',
            borderRadius: '99px',
            fontSize: '11.5px', fontWeight: 500,
            color: 'var(--success)',
          }}>
            Active
          </div>
        </SettingRow>
        <SettingRow label="AI Model" description="Groq API via Spring AI OpenAI-compatible client">
          <div style={{
            padding: '3px 10px',
            background: 'var(--warning-subtle)',
            borderRadius: '99px',
            fontSize: '11.5px', fontWeight: 500,
            color: 'var(--warning)',
          }}>
            Pending
          </div>
        </SettingRow>
        <div style={{ padding: '12px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>API Base URL</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
