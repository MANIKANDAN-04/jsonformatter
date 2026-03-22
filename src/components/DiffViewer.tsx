import React from 'react';
import { DiffResult, formatValue } from '../utils/jsonDiff';

interface DiffViewerProps {
  diffs: DiffResult[];
  onClickDiff?: (path: string) => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diffs, onClickDiff }) => {
  const summary = {
    changed: diffs.filter(d => d.type === 'changed').length,
    added: diffs.filter(d => d.type === 'added').length,
    removed: diffs.filter(d => d.type === 'removed').length,
    typeMismatch: diffs.filter(d => d.type === 'type-mismatch').length,
  };

  if (diffs.length === 0) {
    return (
      <div
        className="animate-fade-in"
        style={{
          textAlign: 'center',
          padding: 24,
          background: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: 10,
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--success)' }}>
          Identical!
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
          No differences found.
        </div>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'changed': return 'var(--warning)';
      case 'added': return 'var(--success)';
      case 'removed': return 'var(--error)';
      case 'type-mismatch': return '#a855f7';
      default: return 'var(--text-secondary)';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'changed': return '✏️';
      case 'added': return '➕';
      case 'removed': return '➖';
      case 'type-mismatch': return '🔄';
      default: return '•';
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'changed': return 'rgba(245, 158, 11, 0.08)';
      case 'added': return 'rgba(34, 197, 94, 0.08)';
      case 'removed': return 'rgba(239, 68, 68, 0.08)';
      case 'type-mismatch': return 'rgba(168, 85, 247, 0.08)';
      default: return 'transparent';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {diffs.length} diff{diffs.length > 1 ? 's' : ''}
        </span>
        {summary.changed > 0 && (
          <span style={{ fontSize: 11, color: 'var(--warning)' }}>
            ✏️{summary.changed}
          </span>
        )}
        {summary.added > 0 && (
          <span style={{ fontSize: 11, color: 'var(--success)' }}>
            ➕{summary.added}
          </span>
        )}
        {summary.removed > 0 && (
          <span style={{ fontSize: 11, color: 'var(--error)' }}>
            ➖{summary.removed}
          </span>
        )}
        {summary.typeMismatch > 0 && (
          <span style={{ fontSize: 11, color: '#a855f7' }}>
            🔄{summary.typeMismatch}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {diffs.map((diff, i) => (
          <div
            key={i}
            onClick={() => onClickDiff?.(diff.path)}
            style={{
              padding: '8px 10px',
              background: getTypeBg(diff.type),
              border: `1px solid ${getTypeColor(diff.type)}33`,
              borderLeft: `3px solid ${getTypeColor(diff.type)}`,
              borderRadius: 6,
              cursor: onClickDiff ? 'pointer' : 'default',
              transition: 'transform 0.1s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 12 }}>{getTypeIcon(diff.type)}</span>
              <code
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--accent)',
                  fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                  wordBreak: 'break-all',
                }}
              >
                {diff.path}
              </code>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: getTypeColor(diff.type),
                  background: `${getTypeColor(diff.type)}20`,
                  padding: '1px 6px',
                  borderRadius: 3,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {diff.type === 'type-mismatch' ? 'type' : diff.type}
              </span>
            </div>

            <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', 'Consolas', monospace" }}>
              {(diff.type === 'changed' || diff.type === 'type-mismatch' || diff.type === 'removed') && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    padding: '3px 8px',
                    borderRadius: 4,
                    color: 'var(--text-primary)',
                    wordBreak: 'break-all',
                    whiteSpace: 'pre-wrap',
                    marginBottom: 3,
                    fontSize: 11,
                  }}
                >
                  <span style={{ color: 'var(--error)', fontSize: 10 }}>L </span>
                  {formatValue(diff.leftValue)}
                </div>
              )}
              {(diff.type === 'changed' || diff.type === 'type-mismatch' || diff.type === 'added') && (
                <div
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    padding: '3px 8px',
                    borderRadius: 4,
                    color: 'var(--text-primary)',
                    wordBreak: 'break-all',
                    whiteSpace: 'pre-wrap',
                    fontSize: 11,
                  }}
                >
                  <span style={{ color: 'var(--success)', fontSize: 10 }}>R </span>
                  {formatValue(diff.rightValue)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
