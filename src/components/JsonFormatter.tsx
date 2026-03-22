import React, { useState, useCallback } from 'react';
import { JsonEditor } from './JsonEditor';
import { TreeView } from './TreeView';
import { formatJson, minifyJson, validateJson, getJsonStats, SAMPLE_JSON } from '../utils/jsonFormatter';

export const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showTree, setShowTree] = useState(false);
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  const validation = input.trim() ? validateJson(input) : null;
  const stats = input.trim() ? getJsonStats(input) : null;

  const handleFormat = useCallback(() => {
    const { result, error } = formatJson(input, indent);
    setInput(result);
    setError(error);
  }, [input, indent]);

  const handleMinify = useCallback(() => {
    const { result, error } = minifyJson(input);
    setInput(result);
    setError(error);
  }, [input]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [input]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([input], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [input]);

  const handleLoadSample = () => {
    setInput(SAMPLE_JSON);
    setError(null);
  };

  const handleClear = () => {
    setInput('');
    setError(null);
    setShowTree(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          padding: '8px 12px',
          background: 'var(--bg-secondary)',
          borderRadius: 10,
          border: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleFormat}>
            ✨ Format
          </button>
          <button className="btn btn-secondary" onClick={handleMinify}>
            📦 Minify
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Indent:</span>
            {[2, 4].map(n => (
              <button
                key={n}
                onClick={() => setIndent(n)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 12,
                  cursor: 'pointer',
                  background: indent === n ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: indent === n ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                {n}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

          <button
            className="btn btn-secondary"
            onClick={() => {
              if (validation?.valid) setShowTree(!showTree);
            }}
            style={{ opacity: validation?.valid ? 1 : 0.4 }}
          >
            🌳 {showTree ? 'Editor' : 'Tree'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-secondary" onClick={handleCopy} disabled={!input}>
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
          <button className="btn btn-secondary" onClick={handleDownload} disabled={!input}>
            💾 Download
          </button>
          <button className="btn btn-secondary" onClick={handleLoadSample}>
            📄 Sample
          </button>
          <button className="btn btn-danger" onClick={handleClear} disabled={!input}>
            🗑️ Clear
          </button>
        </div>
      </div>

      {input.trim() && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            background: validation?.valid
              ? 'rgba(34, 197, 94, 0.08)'
              : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${validation?.valid ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          }}
        >
          <span style={{ color: validation?.valid ? 'var(--success)' : 'var(--error)', fontWeight: 500 }}>
            {validation?.valid ? '✓ Valid JSON' : '✗ Invalid JSON'}
          </span>
          {stats && (
            <>
              <span style={{ color: 'var(--text-secondary)' }}>·</span>
              <span style={{ color: 'var(--text-secondary)' }}>{stats.keys} keys</span>
              <span style={{ color: 'var(--text-secondary)' }}>·</span>
              <span style={{ color: 'var(--text-secondary)' }}>Depth: {stats.depth}</span>
              <span style={{ color: 'var(--text-secondary)' }}>·</span>
              <span style={{ color: 'var(--text-secondary)' }}>{stats.size}</span>
            </>
          )}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        {showTree && validation?.valid ? (
          <div
            style={{
              flex: 1,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 16,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              fontSize: 13,
              lineHeight: 1.6,
              overflow: 'auto',
              minHeight: 400,
            }}
          >
            <TreeView data={validation.parsed} />
          </div>
        ) : (
          <JsonEditor
            value={input}
            onChange={(v) => {
              setInput(v);
              setError(null);
            }}
            error={error || (validation?.error && input.trim() ? validation.error : null)}
            placeholder="Paste or type your JSON here... or drag & drop a .json file"
          />
        )}
      </div>
    </div>
  );
};
