import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        textAlign: 'center',
        fontSize: 13,
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <span>
        Built with ❤️ using React + TypeScript
      </span>
      <span style={{ opacity: 0.3 }}>·</span>
      <span>🔒 All processing happens in your browser — no data is sent to any server</span>
      <span style={{ opacity: 0.3 }}>·</span>
      <span>
        <kbd
          style={{
            fontSize: 11,
            padding: '2px 6px',
            borderRadius: 4,
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
          }}
        >
          Ctrl+Enter
        </kbd>{' '}
        Format / Compare
      </span>
    </footer>
  );
};
