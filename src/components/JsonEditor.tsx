import React, { useCallback, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

export interface JsonEditorHandle {
  scrollToLine: (line: number) => void;
}

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string | null;
  readOnly?: boolean;
  highlightLines?: Map<number, 'added' | 'removed' | 'changed'>;
}

export const JsonEditor = forwardRef<JsonEditorHandle, JsonEditorProps>(({
  value,
  onChange,
  placeholder = 'Paste or type JSON here...',
  label,
  error,
  readOnly = false,
  highlightLines,
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollToLine: (line: number) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const lineHeight = 20.8;
      const scrollTop = Math.max(0, (line - 3) * lineHeight);
      textarea.scrollTop = scrollTop;
      if (lineNumRef.current) lineNumRef.current.scrollTop = scrollTop;
      if (highlightRef.current) highlightRef.current.scrollTop = scrollTop;
    },
  }));

  const handleScroll = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (lineNumRef.current) lineNumRef.current.scrollTop = textarea.scrollTop;
    if (highlightRef.current) highlightRef.current.scrollTop = textarea.scrollTop;
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.addEventListener('scroll', handleScroll);
    return () => textarea.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target?.result;
          if (typeof text === 'string') onChange(text);
        };
        reader.readAsText(file);
      }
    },
    [onChange]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newVal = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newVal);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  const lines = value ? value.split('\n') : [''];
  const lineCount = lines.length;

  const getLineHighlightColor = (lineNum: number) => {
    if (!highlightLines) return undefined;
    const type = highlightLines.get(lineNum);
    switch (type) {
      case 'added': return 'rgba(34, 197, 94, 0.12)';
      case 'removed': return 'rgba(239, 68, 68, 0.12)';
      case 'changed': return 'rgba(245, 158, 11, 0.12)';
      default: return undefined;
    }
  };

  const getLineNumColor = (lineNum: number) => {
    if (!highlightLines) return undefined;
    const type = highlightLines.get(lineNum);
    switch (type) {
      case 'added': return 'var(--success)';
      case 'removed': return 'var(--error)';
      case 'changed': return 'var(--warning)';
      default: return undefined;
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
      {label && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {lineCount} lines · {new Blob([value]).size} B
          </span>
        </div>
      )}
      <div
        style={{ position: 'relative', flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div
          ref={lineNumRef}
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            fontSize: 13,
            lineHeight: 1.6,
            padding: '12px 8px 12px 8px',
            textAlign: 'right',
            background: 'var(--bg-secondary)',
            borderRadius: '8px 0 0 8px',
            border: '1px solid var(--border)',
            borderRight: 'none',
            userSelect: 'none',
            minWidth: 40,
            overflow: 'hidden',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              style={{
                color: getLineNumColor(i + 1) || 'var(--text-secondary)',
                opacity: getLineNumColor(i + 1) ? 0.9 : 0.4,
                fontWeight: getLineNumColor(i + 1) ? 600 : 400,
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {highlightLines && highlightLines.size > 0 && (
            <div
              ref={highlightRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
                padding: 12,
                zIndex: 0,
              }}
            >
              {Array.from({ length: lineCount }, (_, i) => {
                const bg = getLineHighlightColor(i + 1);
                return (
                  <div
                    key={i}
                    style={{
                      height: 20.8,
                      background: bg || 'transparent',
                      marginLeft: -12,
                      marginRight: -12,
                      paddingLeft: 12,
                      borderLeft: bg ? `3px solid ${getLineNumColor(i + 1)}` : '3px solid transparent',
                    }}
                  />
                );
              })}
            </div>
          )}

          <textarea
            ref={textareaRef}
            className="json-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            readOnly={readOnly}
            spellCheck={false}
            style={{
              borderRadius: '0 8px 8px 0',
              width: '100%',
              minHeight: 0,
              height: '100%',
              fontSize: 13,
              padding: 12,
              position: 'relative',
              zIndex: 1,
              background: highlightLines && highlightLines.size > 0 ? 'transparent' : undefined,
            }}
          />
        </div>
      </div>
      {error && (
        <div
          className="animate-fade-in"
          style={{
            fontSize: 12,
            color: 'var(--error)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 6,
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
          }}
        >
          <span>⚠️</span> {error}
        </div>
      )}
    </div>
  );
});
