export function formatJson(input: string, indent: number = 2): { result: string; error: string | null } {
  try {
    const parsed = JSON.parse(input);
    return { result: JSON.stringify(parsed, null, indent), error: null };
  } catch (e) {
    return { result: input, error: getParseErrorMessage(e, input) };
  }
}

export function minifyJson(input: string): { result: string; error: string | null } {
  try {
    const parsed = JSON.parse(input);
    return { result: JSON.stringify(parsed), error: null };
  } catch (e) {
    return { result: input, error: getParseErrorMessage(e, input) };
  }
}

export function validateJson(input: string): { valid: boolean; error: string | null; parsed?: unknown } {
  if (!input.trim()) return { valid: false, error: null };
  try {
    const parsed = JSON.parse(input);
    return { valid: true, error: null, parsed };
  } catch (e) {
    return { valid: false, error: getParseErrorMessage(e, input) };
  }
}

function getParseErrorMessage(e: unknown, input: string): string {
  if (e instanceof SyntaxError) {
    const match = e.message.match(/position (\d+)/i);
    if (match) {
      const pos = parseInt(match[1]);
      const lines = input.substring(0, pos).split('\n');
      const line = lines.length;
      const col = lines[lines.length - 1].length + 1;
      return `${e.message} (Line ${line}, Column ${col})`;
    }
    return e.message;
  }
  return 'Invalid JSON';
}

export function getJsonStats(input: string): { keys: number; depth: number; size: string } | null {
  try {
    const parsed = JSON.parse(input);
    return {
      keys: countKeys(parsed),
      depth: getDepth(parsed),
      size: formatSize(new Blob([input]).size),
    };
  } catch {
    return null;
  }
}

function countKeys(obj: unknown): number {
  if (obj === null || typeof obj !== 'object') return 0;
  if (Array.isArray(obj)) {
    return obj.reduce((acc: number, item) => acc + countKeys(item), 0);
  }
  let count = Object.keys(obj).length;
  for (const value of Object.values(obj)) {
    count += countKeys(value);
  }
  return count;
}

function getDepth(obj: unknown, current: number = 0): number {
  if (obj === null || typeof obj !== 'object') return current;
  if (Array.isArray(obj)) {
    if (obj.length === 0) return current + 1;
    return Math.max(...obj.map(item => getDepth(item, current + 1)));
  }
  const values = Object.values(obj);
  if (values.length === 0) return current + 1;
  return Math.max(...values.map(v => getDepth(v, current + 1)));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const SAMPLE_JSON = JSON.stringify(
  {
    name: "Rahul",
    age: 25,
    email: "rahul@example.com",
    isStudent: false,
    address: {
      street: "123 MG Road",
      city: "Chennai",
      state: "Tamil Nadu",
      zip: "600001"
    },
    skills: ["JavaScript", "Python", "SQL"]
  },
  null,
  2
);
