import React, { useState, useCallback, useRef, useMemo } from 'react';
import { JsonEditor, JsonEditorHandle } from './JsonEditor';
import { DiffViewer } from './DiffViewer';
import { deepDiff, DiffResult, getDiffSummary } from '../utils/jsonDiff';
import { validateJson, formatJson, SAMPLE_JSON } from '../utils/jsonFormatter';

const SAMPLE_JSON_RIGHT = JSON.stringify(
  {
    name: "Rahsul",
    age: 25,
    email: "rahul@example.com",
    isStudent: false,
    address: {
      street: "123 MG Road",
      city: "Chennai",
      state: "Tamil Nadu",
      zip: "60001"
    },
    skills: ["JavaScript", "Python", "SQL"]
  },
  null,
  2
);

function buildPathToLineRange(parsed: unknown): Map<string, [number, number]> {
  const map = new Map<string, [number, number]>();
  const line = { n: 1 };

  function walk(value: unknown, path: string) {
    if (value === null || typeof value !== 'object') return;

    if (Array.isArray(value)) {
      if (value.length === 0) return;
      line.n++;
      for (let i = 0; i < value.length; i++) {
        const elemPath = path ? `${path}[${i}]` : `[${i}]`;
        const startLine = line.n;
        walk(value[i], elemPath);
        map.set(elemPath, [startLine, line.n]);
        line.n++;
      }
      return;
    }

    const keys = Object.keys(value as Record<string, unknown>);
    if (keys.length === 0) return;
    line.n++;
    for (const key of keys) {
      const keyPath = path ? `${path}.${key}` : key;
      const startLine = line.n;
      const child = (value as Record<string, unknown>)[key];

      if (child !== null && typeof child === 'object') {
        const isEmpty = Array.isArray(child) ? child.length === 0 : Object.keys(child).length === 0;
        if (isEmpty) {
          map.set(keyPath, [startLine, startLine]);
          line.n++;
        } else {
          walk(child, keyPath);
          map.set(keyPath, [startLine, line.n]);
          line.n++;
        }
      } else {
        map.set(keyPath, [startLine, startLine]);
        line.n++;
      }
    }
  }

  walk(parsed, '');
  return map;
}

export const JsonCompare: React.FC = () => {
  const leftEditorRef = useRef<JsonEditorHandle>(null);
  const rightEditorRef = useRef<JsonEditorHandle>(null);

  const [leftInput, setLeftInput] = useState('');
  const [rightInput, setRightInput] = useState('');
  const [diffs, setDiffs] = useState<DiffResult[] | null>(null);
  const [leftError, setLeftError] = useState<string | null>(null);
  const [rightError, setRightError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [leftLineMap, setLeftLineMap] = useState<Map<string, [number, number]>>(new Map());
  const [rightLineMap, setRightLineMap] = useState<Map<string, [number, number]>>(new Map());

  const { leftHighlights, rightHighlights } = useMemo(() => {
    const lh = new Map<number, 'added' | 'removed' | 'changed'>();
    const rh = new Map<number, 'added' | 'removed' | 'changed'>();
    if (!diffs) return { leftHighlights: lh, rightHighlights: rh };

    for (const diff of diffs) {
      const leftRange = leftLineMap.get(diff.path);
      const rightRange = rightLineMap.get(diff.path);

      if (diff.type === 'removed' && leftRange) {
        for (let l = leftRange[0]; l <= leftRange[1]; l++) lh.set(l, 'removed');
      } else if (diff.type === 'added' && rightRange) {
        for (let l = rightRange[0]; l <= rightRange[1]; l++) rh.set(l, 'added');
      } else if ((diff.type === 'changed' || diff.type === 'type-mismatch')) {
        if (leftRange) {
          for (let l = leftRange[0]; l <= leftRange[1]; l++) lh.set(l, 'changed');
        }
        if (rightRange) {
          for (let l = rightRange[0]; l <= rightRange[1]; l++) rh.set(l, 'changed');
        }
      }
    }
    return { leftHighlights: lh, rightHighlights: rh };
  }, [diffs, leftLineMap, rightLineMap]);

  const clearDiffs = useCallback(() => {
    setDiffs(null);
    setLeftLineMap(new Map());
    setRightLineMap(new Map());
  }, []);

  const handleCompare = useCallback(() => {
    const leftValidation = validateJson(leftInput);
    const rightValidation = validateJson(rightInput);

    setLeftError(leftValidation.valid ? null : leftValidation.error || 'Invalid JSON');
    setRightError(rightValidation.valid ? null : rightValidation.error || 'Invalid JSON');

    if (!leftValidation.valid || !rightValidation.valid) {
      clearDiffs();
      return;
    }

    const fmtLeft = JSON.stringify(leftValidation.parsed, null, 2);
    const fmtRight = JSON.stringify(rightValidation.parsed, null, 2);
    setLeftInput(fmtLeft);
    setRightInput(fmtRight);

    setLeftLineMap(buildPathToLineRange(leftValidation.parsed));
    setRightLineMap(buildPathToLineRange(rightValidation.parsed));

    const result = deepDiff(leftValidation.parsed, rightValidation.parsed);
    setDiffs(result);
  }, [leftInput, rightInput, clearDiffs]);

  const handleClickDiff = useCallback((path: string) => {
    const diff = diffs?.find(d => d.path === path);
    if (!diff) return;

    const leftRange = leftLineMap.get(path);
    const rightRange = rightLineMap.get(path);

    if (leftRange && (diff.type === 'removed' || diff.type === 'changed' || diff.type === 'type-mismatch')) {
      leftEditorRef.current?.scrollToLine(leftRange[0]);
    }
    if (rightRange && (diff.type === 'added' || diff.type === 'changed' || diff.type === 'type-mismatch')) {
      rightEditorRef.current?.scrollToLine(rightRange[0]);
    }
  }, [diffs, leftLineMap, rightLineMap]);

  const handleSwap = () => {
    setLeftInput(rightInput);
    setRightInput(leftInput);
    clearDiffs();
    setLeftError(null);
    setRightError(null);
  };

  const handleFormatBoth = () => {
    const left = formatJson(leftInput, 2);
    const right = formatJson(rightInput, 2);
    setLeftInput(left.result);
    setRightInput(right.result);
    setLeftError(left.error);
    setRightError(right.error);
  };

  const handleLoadSample = () => {
    setLeftInput(SAMPLE_JSON);
    setRightInput(SAMPLE_JSON_RIGHT);
    clearDiffs();
    setLeftError(null);
    setRightError(null);
  };

  const handleClear = () => {
    setLeftInput('');
    setRightInput('');
    clearDiffs();
    setLeftError(null);
    setRightError(null);
  };

  const handleCopyDiff = useCallback(async () => {
    if (!diffs) return;
    const summary = getDiffSummary(diffs);
    const report = [
      `JSON Diff Report`,
      `================`,
      `Total: ${summary.total} differences`,
      `Changed: ${summary.changed} | Added: ${summary.added} | Removed: ${summary.removed} | Type Mismatch: ${summary.typeMismatch}`,
      ``,
      ...diffs.map(d => {
        let line = `[${d.type.toUpperCase()}] ${d.path}`;
        if (d.type === 'changed' || d.type === 'type-mismatch') {
          line += `\n  Left:  ${JSON.stringify(d.leftValue)}`;
          line += `\n  Right: ${JSON.stringify(d.rightValue)}`;
        } else if (d.type === 'added') {
          line += `\n  Value: ${JSON.stringify(d.rightValue)}`;
        } else if (d.type === 'removed') {
          line += `\n  Value: ${JSON.stringify(d.leftValue)}`;
        }
        return line;
      }),
    ].join('\n');
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [diffs]);

  const handleDownloadDiff = useCallback(() => {
    if (!diffs) return;
    const blob = new Blob([JSON.stringify(diffs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diff-report.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [diffs]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button className="btn btn-primary" onClick={handleCompare}>
            🔍 Compare
          </button>
          <button className="btn btn-secondary" onClick={handleFormatBoth}>
            ✨ Format Both
          </button>
          <button className="btn btn-secondary" onClick={handleSwap}>
            ⇄ Swap
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {diffs && diffs.length > 0 && (
            <>
              <button className="btn btn-secondary" onClick={handleCopyDiff}>
                {copied ? '✅ Copied!' : '📋 Copy Diff'}
              </button>
              <button className="btn btn-secondary" onClick={handleDownloadDiff}>
                💾 Download
              </button>
            </>
          )}
          <button className="btn btn-secondary" onClick={handleLoadSample}>
            📄 Sample
          </button>
          <button className="btn btn-danger" onClick={handleClear}>
            🗑️ Clear
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <JsonEditor
          ref={leftEditorRef}
          value={leftInput}
          onChange={(v) => {
            setLeftInput(v);
            setLeftError(null);
            clearDiffs();
          }}
          label="Left (Original)"
          error={leftError}
          placeholder="Paste your original JSON here..."
          highlightLines={leftHighlights}
        />

        <JsonEditor
          ref={rightEditorRef}
          value={rightInput}
          onChange={(v) => {
            setRightInput(v);
            setRightError(null);
            clearDiffs();
          }}
          label="Right (Modified)"
          error={rightError}
          placeholder="Paste your modified JSON here..."
          highlightLines={rightHighlights}
        />

        {diffs && (
          <div
            style={{
              width: 340,
              flexShrink: 0,
              overflow: 'auto',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              padding: 10,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Differences
            </div>
            <DiffViewer diffs={diffs} onClickDiff={handleClickDiff} />
          </div>
        )}
      </div>
    </div>
  );
};
