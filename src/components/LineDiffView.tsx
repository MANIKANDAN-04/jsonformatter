import React, { useState } from 'react';

interface LineDiffViewProps {
  leftText: string;
  rightText: string;
  contextLines?: number;
}

interface DiffLine {
  leftNum: number | null;
  rightNum: number | null;
  leftContent: string;
  rightContent: string;
  type: 'unchanged' | 'changed' | 'added' | 'removed';
}

interface DiffHunk {
  lines: DiffLine[];
  leftStart: number;
  rightStart: number;
}

function computeLineDiff(leftLines: string[], rightLines: string[]): DiffLine[] {
  const m = leftLines.length;
  const n = rightLines.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const result: DiffLine[] = [];
  let i = m, j = n;

  const stack: DiffLine[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      stack.push({
        leftNum: i,
        rightNum: j,
        leftContent: leftLines[i - 1],
        rightContent: rightLines[j - 1],
        type: 'unchanged',
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({
        leftNum: null,
        rightNum: j,
        leftContent: '',
        rightContent: rightLines[j - 1],
        type: 'added',
      });
      j--;
    } else {
      stack.push({
        leftNum: i,
        rightNum: null,
        leftContent: leftLines[i - 1],
        rightContent: '',
        type: 'removed',
      });
      i--;
    }
  }

  for (let k = stack.length - 1; k >= 0; k--) {
    result.push(stack[k]);
  }

  const paired: DiffLine[] = [];
  let idx = 0;
  while (idx < result.length) {
    if (
      idx + 1 < result.length &&
      result[idx].type === 'removed' &&
      result[idx + 1].type === 'added'
    ) {
      paired.push({
        leftNum: result[idx].leftNum,
        rightNum: result[idx + 1].rightNum,
        leftContent: result[idx].leftContent,
        rightContent: result[idx + 1].rightContent,
        type: 'changed',
      });
      idx += 2;
    } else {
      paired.push(result[idx]);
      idx++;
    }
  }

  return paired;
}

function buildHunks(lines: DiffLine[], contextLines: number): DiffHunk[] {
  const changedIndices: number[] = [];
  lines.forEach((line, i) => {
    if (line.type !== 'unchanged') changedIndices.push(i);
  });

  if (changedIndices.length === 0) return [];

  const ranges: [number, number][] = [];
  for (const ci of changedIndices) {
    const start = Math.max(0, ci - contextLines);
    const end = Math.min(lines.length - 1, ci + contextLines);
    if (ranges.length > 0 && start <= ranges[ranges.length - 1][1] + 1) {
      ranges[ranges.length - 1][1] = end;
    } else {
      ranges.push([start, end]);
    }
  }

  return ranges.map(([start, end]) => {
    const hunkLines = lines.slice(start, end + 1);
    const firstLeft = hunkLines.find(l => l.leftNum !== null)?.leftNum ?? 1;
    const firstRight = hunkLines.find(l => l.rightNum !== null)?.rightNum ?? 1;
    return {
      lines: hunkLines,
      leftStart: firstLeft,
      rightStart: firstRight,
    };
  });
}

function highlightCharDiff(left: string, right: string): { leftParts: { text: string; highlighted: boolean }[]; rightParts: { text: string; highlighted: boolean }[] } {
  let prefixLen = 0;
  while (prefixLen < left.length && prefixLen < right.length && left[prefixLen] === right[prefixLen]) {
    prefixLen++;
  }
  let suffixLen = 0;
  while (
    suffixLen < left.length - prefixLen &&
    suffixLen < right.length - prefixLen &&
    left[left.length - 1 - suffixLen] === right[right.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  const leftMiddle = left.substring(prefixLen, left.length - suffixLen);
  const rightMiddle = right.substring(prefixLen, right.length - suffixLen);
  const prefix = left.substring(0, prefixLen);
  const suffix = left.substring(left.length - suffixLen);

  const leftParts: { text: string; highlighted: boolean }[] = [];
  const rightParts: { text: string; highlighted: boolean }[] = [];

  if (prefix) {
    leftParts.push({ text: prefix, highlighted: false });
    rightParts.push({ text: prefix, highlighted: false });
  }
  if (leftMiddle || !rightMiddle) {
    leftParts.push({ text: leftMiddle || ' ', highlighted: !!leftMiddle });
  }
  if (rightMiddle || !leftMiddle) {
    rightParts.push({ text: rightMiddle || ' ', highlighted: !!rightMiddle });
  }
  if (suffix) {
    leftParts.push({ text: suffix, highlighted: false });
    rightParts.push({ text: suffix, highlighted: false });
  }

  return { leftParts, rightParts };
}

const lineStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  fontSize: 13,
  lineHeight: '22px',
  whiteSpace: 'pre',
  display: 'flex',
};

const numStyle: React.CSSProperties = {
  width: 44,
  minWidth: 44,
  textAlign: 'right',
  padding: '0 8px',
  color: 'var(--text-secondary)',
  opacity: 0.5,
  userSelect: 'none',
  flexShrink: 0,
};

const contentStyle: React.CSSProperties = {
  padding: '0 12px',
  flex: 1,
  overflow: 'hidden',
};

const signStyle: React.CSSProperties = {
  width: 20,
  minWidth: 20,
  textAlign: 'center',
  userSelect: 'none',
  flexShrink: 0,
  fontWeight: 700,
};

export const LineDiffView: React.FC<LineDiffViewProps> = ({ leftText, rightText, contextLines = 3 }) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  const leftLines = leftText.split('\n');
  const rightLines = rightText.split('\n');
  const diffLines = computeLineDiff(leftLines, rightLines);
  const hunks = buildHunks(diffLines, contextLines);

  const totalChanged = diffLines.filter(l => l.type !== 'unchanged').length;
  const additions = diffLines.filter(l => l.type === 'added' || l.type === 'changed').length;
  const deletions = diffLines.filter(l => l.type === 'removed' || l.type === 'changed').length;

  if (totalChanged === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 40,
          background: 'rgba(34, 197, 94, 0.06)',
          border: '1px solid rgba(34, 197, 94, 0.15)',
          borderRadius: 10,
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--success)' }}>
          Both JSON objects are identical
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '6px 12px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          flexShrink: 0,
          fontSize: 13,
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {hunks.length} hunk{hunks.length > 1 ? 's' : ''}
        </span>
        <span style={{ color: 'var(--success)', fontWeight: 600 }}>+{additions}</span>
        <span style={{ color: 'var(--error)', fontWeight: 600 }}>-{deletions}</span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2, background: 'var(--bg-primary)', borderRadius: 6, padding: 2 }}>
          <button
            onClick={() => setViewMode('split')}
            style={{
              padding: '3px 10px',
              borderRadius: 4,
              border: 'none',
              fontSize: 12,
              cursor: 'pointer',
              background: viewMode === 'split' ? 'var(--accent)' : 'transparent',
              color: viewMode === 'split' ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            Split
          </button>
          <button
            onClick={() => setViewMode('unified')}
            style={{
              padding: '3px 10px',
              borderRadius: 4,
              border: 'none',
              fontSize: 12,
              cursor: 'pointer',
              background: viewMode === 'unified' ? 'var(--accent)' : 'transparent',
              color: viewMode === 'unified' ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            Unified
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
        }}
      >
        {hunks.map((hunk, hi) => (
          <div key={hi}>
            <div
              style={{
                padding: '4px 12px',
                background: 'rgba(59, 130, 246, 0.08)',
                borderBottom: '1px solid var(--border)',
                ...(hi > 0 ? { borderTop: '1px solid var(--border)' } : {}),
                fontSize: 12,
                color: 'var(--accent)',
                fontFamily: "'JetBrains Mono', 'Consolas', monospace",
              }}
            >
              @@ -{hunk.leftStart},{hunk.lines.filter(l => l.leftNum !== null).length} +{hunk.rightStart},{hunk.lines.filter(l => l.rightNum !== null).length} @@
            </div>

            {viewMode === 'split' ? (
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
                  {hunk.lines.map((line, li) => {
                    const isChanged = line.type === 'changed' || line.type === 'removed';
                    const charDiff = line.type === 'changed' ? highlightCharDiff(line.leftContent, line.rightContent) : null;

                    if (line.type === 'added') {
                      return (
                        <div key={li} style={{ ...lineStyle, height: 22, background: 'transparent' }}>
                          <div style={numStyle}></div>
                          <div style={signStyle}></div>
                          <div style={contentStyle}></div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={li}
                        style={{
                          ...lineStyle,
                          background: isChanged ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                        }}
                      >
                        <div style={numStyle}>{line.leftNum}</div>
                        <div
                          style={{
                            ...signStyle,
                            color: isChanged ? 'var(--error)' : 'transparent',
                          }}
                        >
                          {isChanged ? '−' : ' '}
                        </div>
                        <div style={contentStyle}>
                          {charDiff ? (
                            charDiff.leftParts.map((p, pi) => (
                              <span
                                key={pi}
                                style={p.highlighted ? { background: 'rgba(239, 68, 68, 0.3)', borderRadius: 2 } : undefined}
                              >
                                {p.text}
                              </span>
                            ))
                          ) : (
                            line.leftContent
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  {hunk.lines.map((line, li) => {
                    const isChanged = line.type === 'changed' || line.type === 'added';
                    const charDiff = line.type === 'changed' ? highlightCharDiff(line.leftContent, line.rightContent) : null;

                    if (line.type === 'removed') {
                      return (
                        <div key={li} style={{ ...lineStyle, height: 22, background: 'transparent' }}>
                          <div style={numStyle}></div>
                          <div style={signStyle}></div>
                          <div style={contentStyle}></div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={li}
                        style={{
                          ...lineStyle,
                          background: isChanged ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                        }}
                      >
                        <div style={numStyle}>{line.rightNum}</div>
                        <div
                          style={{
                            ...signStyle,
                            color: isChanged ? 'var(--success)' : 'transparent',
                          }}
                        >
                          {isChanged ? '+' : ' '}
                        </div>
                        <div style={contentStyle}>
                          {charDiff ? (
                            charDiff.rightParts.map((p, pi) => (
                              <span
                                key={pi}
                                style={p.highlighted ? { background: 'rgba(34, 197, 94, 0.3)', borderRadius: 2 } : undefined}
                              >
                                {p.text}
                              </span>
                            ))
                          ) : (
                            line.type === 'added' ? line.rightContent : line.rightContent
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                {hunk.lines.map((line, li) => {
                  if (line.type === 'unchanged') {
                    return (
                      <div key={li} style={lineStyle}>
                        <div style={numStyle}>{line.leftNum}</div>
                        <div style={numStyle}>{line.rightNum}</div>
                        <div style={{ ...signStyle, color: 'transparent' }}> </div>
                        <div style={contentStyle}>{line.leftContent}</div>
                      </div>
                    );
                  }

                  if (line.type === 'changed') {
                    const charDiff = highlightCharDiff(line.leftContent, line.rightContent);
                    return (
                      <React.Fragment key={li}>
                        <div style={{ ...lineStyle, background: 'rgba(239, 68, 68, 0.1)' }}>
                          <div style={numStyle}>{line.leftNum}</div>
                          <div style={numStyle}></div>
                          <div style={{ ...signStyle, color: 'var(--error)' }}>−</div>
                          <div style={contentStyle}>
                            {charDiff.leftParts.map((p, pi) => (
                              <span
                                key={pi}
                                style={p.highlighted ? { background: 'rgba(239, 68, 68, 0.3)', borderRadius: 2 } : undefined}
                              >
                                {p.text}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={{ ...lineStyle, background: 'rgba(34, 197, 94, 0.1)' }}>
                          <div style={numStyle}></div>
                          <div style={numStyle}>{line.rightNum}</div>
                          <div style={{ ...signStyle, color: 'var(--success)' }}>+</div>
                          <div style={contentStyle}>
                            {charDiff.rightParts.map((p, pi) => (
                              <span
                                key={pi}
                                style={p.highlighted ? { background: 'rgba(34, 197, 94, 0.3)', borderRadius: 2 } : undefined}
                              >
                                {p.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  }

                  if (line.type === 'removed') {
                    return (
                      <div key={li} style={{ ...lineStyle, background: 'rgba(239, 68, 68, 0.1)' }}>
                        <div style={numStyle}>{line.leftNum}</div>
                        <div style={numStyle}></div>
                        <div style={{ ...signStyle, color: 'var(--error)' }}>−</div>
                        <div style={contentStyle}>{line.leftContent}</div>
                      </div>
                    );
                  }

                  return (
                    <div key={li} style={{ ...lineStyle, background: 'rgba(34, 197, 94, 0.1)' }}>
                      <div style={numStyle}></div>
                      <div style={numStyle}>{line.rightNum}</div>
                      <div style={{ ...signStyle, color: 'var(--success)' }}>+</div>
                      <div style={contentStyle}>{line.rightContent}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
