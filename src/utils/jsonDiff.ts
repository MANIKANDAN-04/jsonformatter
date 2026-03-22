export interface DiffResult {
  path: string;
  type: 'changed' | 'added' | 'removed' | 'type-mismatch';
  leftValue?: unknown;
  rightValue?: unknown;
  leftType?: string;
  rightType?: string;
}

export function deepDiff(
  left: unknown,
  right: unknown,
  path: string = ''
): DiffResult[] {
  const diffs: DiffResult[] = [];

  if (left === right) return diffs;

  if (left === null || right === null || left === undefined || right === undefined) {
    if (left === undefined && right !== undefined) {
      diffs.push({ path: path || '(root)', type: 'added', rightValue: right });
    } else if (left !== undefined && right === undefined) {
      diffs.push({ path: path || '(root)', type: 'removed', leftValue: left });
    } else {
      diffs.push({ path: path || '(root)', type: 'changed', leftValue: left, rightValue: right });
    }
    return diffs;
  }

  const leftType = Array.isArray(left) ? 'array' : typeof left;
  const rightType = Array.isArray(right) ? 'array' : typeof right;

  if (leftType !== rightType) {
    diffs.push({
      path: path || '(root)',
      type: 'type-mismatch',
      leftValue: left,
      rightValue: right,
      leftType,
      rightType,
    });
    return diffs;
  }

  if (leftType === 'object' && !Array.isArray(left)) {
    const leftObj = left as Record<string, unknown>;
    const rightObj = right as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(leftObj), ...Object.keys(rightObj)]);

    for (const key of allKeys) {
      const childPath = path ? `${path}.${key}` : key;
      if (!(key in leftObj)) {
        diffs.push({ path: childPath, type: 'added', rightValue: rightObj[key] });
      } else if (!(key in rightObj)) {
        diffs.push({ path: childPath, type: 'removed', leftValue: leftObj[key] });
      } else {
        diffs.push(...deepDiff(leftObj[key], rightObj[key], childPath));
      }
    }
    return diffs;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const leftArr = left as unknown[];
    const rightArr = right as unknown[];
    const maxLen = Math.max(leftArr.length, rightArr.length);

    for (let i = 0; i < maxLen; i++) {
      const childPath = path ? `${path}[${i}]` : `[${i}]`;
      if (i >= leftArr.length) {
        diffs.push({ path: childPath, type: 'added', rightValue: rightArr[i] });
      } else if (i >= rightArr.length) {
        diffs.push({ path: childPath, type: 'removed', leftValue: leftArr[i] });
      } else {
        diffs.push(...deepDiff(leftArr[i], rightArr[i], childPath));
      }
    }
    return diffs;
  }

  if (left !== right) {
    diffs.push({ path: path || '(root)', type: 'changed', leftValue: left, rightValue: right });
  }

  return diffs;
}

export function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

export function getDiffSummary(diffs: DiffResult[]) {
  return {
    total: diffs.length,
    changed: diffs.filter(d => d.type === 'changed').length,
    added: diffs.filter(d => d.type === 'added').length,
    removed: diffs.filter(d => d.type === 'removed').length,
    typeMismatch: diffs.filter(d => d.type === 'type-mismatch').length,
  };
}
