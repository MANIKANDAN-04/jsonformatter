import React from 'react';

interface HeaderProps {
  activeTab: 'formatter' | 'compare';
  onTabChange: (tab: 'formatter' | 'compare') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, theme, onToggleTheme }) => {
  return (
    <header
      style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700,
              color: 'white',
            }}
          >
            {'{ }'}
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
            JSON Tools
          </span>
        </div>

        <nav style={{ display: 'flex', gap: 4, background: 'var(--bg-primary)', borderRadius: 10, padding: 4 }}>
          <button
            onClick={() => onTabChange('formatter')}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'formatter' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'formatter' ? 'white' : 'var(--text-secondary)',
            }}
          >
            <span style={{ marginRight: 6 }}>✨</span>
            Formatter
          </button>
          <button
            onClick={() => onTabChange('compare')}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'compare' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'compare' ? 'white' : 'var(--text-secondary)',
            }}
          >
            <span style={{ marginRight: 6 }}>🔍</span>
            Compare
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontSize: 11,
              color: 'var(--success)',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              padding: '4px 10px',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            🔒 Local Only
          </span>
          <button
            onClick={onToggleTheme}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg-primary)',
              cursor: 'pointer',
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
};
