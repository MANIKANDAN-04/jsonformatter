import React, { useState } from 'react';

interface TreeViewProps {
  data: unknown;
  name?: string;
  isRoot?: boolean;
}

export const TreeView: React.FC<TreeViewProps> = ({ data, name, isRoot = true }) => {
  const [collapsed, setCollapsed] = useState(false);

  if (data === null) {
    return (
      <span>
        {name && <span className="tree-key">"{name}": </span>}
        <span className="tree-null">null</span>
      </span>
    );
  }

  if (typeof data === 'string') {
    return (
      <span>
        {name && <span className="tree-key">"{name}": </span>}
        <span className="tree-string">"{data}"</span>
      </span>
    );
  }

  if (typeof data === 'number') {
    return (
      <span>
        {name && <span className="tree-key">"{name}": </span>}
        <span className="tree-number">{data}</span>
      </span>
    );
  }

  if (typeof data === 'boolean') {
    return (
      <span>
        {name && <span className="tree-key">"{name}": </span>}
        <span className="tree-boolean">{String(data)}</span>
      </span>
    );
  }

  if (Array.isArray(data)) {
    return (
      <div style={{ marginLeft: isRoot ? 0 : undefined }}>
        <span
          onClick={() => setCollapsed(!collapsed)}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <span style={{ color: 'var(--text-secondary)', fontSize: 12, marginRight: 4 }}>
            {collapsed ? '▶' : '▼'}
          </span>
          {name && <span className="tree-key">"{name}": </span>}
          <span style={{ color: 'var(--text-secondary)' }}>
            [{collapsed ? `...${data.length} items` : ''}
          </span>
        </span>
        {!collapsed && (
          <div className="tree-node">
            {data.map((item, i) => (
              <div key={i} style={{ padding: '2px 0' }}>
                <TreeView data={item} name={String(i)} isRoot={false} />
                {i < data.length - 1 && <span style={{ color: 'var(--text-secondary)' }}>,</span>}
              </div>
            ))}
          </div>
        )}
        {!collapsed && <span style={{ color: 'var(--text-secondary)' }}>]</span>}
        {collapsed && <span style={{ color: 'var(--text-secondary)' }}>]</span>}
      </div>
    );
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>);
    return (
      <div style={{ marginLeft: isRoot ? 0 : undefined }}>
        <span
          onClick={() => setCollapsed(!collapsed)}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <span style={{ color: 'var(--text-secondary)', fontSize: 12, marginRight: 4 }}>
            {collapsed ? '▶' : '▼'}
          </span>
          {name && <span className="tree-key">"{name}": </span>}
          <span style={{ color: 'var(--text-secondary)' }}>
            {'{'}
            {collapsed ? `...${entries.length} keys` : ''}
          </span>
        </span>
        {!collapsed && (
          <div className="tree-node">
            {entries.map(([key, value], i) => (
              <div key={key} style={{ padding: '2px 0' }}>
                <TreeView data={value} name={key} isRoot={false} />
                {i < entries.length - 1 && <span style={{ color: 'var(--text-secondary)' }}>,</span>}
              </div>
            ))}
          </div>
        )}
        {!collapsed && <span style={{ color: 'var(--text-secondary)' }}>{'}'}</span>}
        {collapsed && <span style={{ color: 'var(--text-secondary)' }}>{'}'}</span>}
      </div>
    );
  }

  return <span>{String(data)}</span>;
};
