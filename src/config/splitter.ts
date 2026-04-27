import { Record as ConfigRecord } from '../types';

export interface SplitResult {
  chunks: Array<{ name: string; config: ConfigRecord }>;
  totalKeys: number;
}

/**
 * Split a flat config into named chunks based on key prefixes.
 */
export function splitByPrefix(
  config: ConfigRecord,
  prefixes: string[]
): SplitResult {
  const assigned = new Set<string>();
  const chunks: Array<{ name: string; config: ConfigRecord }> = [];

  for (const prefix of prefixes) {
    const chunk: ConfigRecord = {};
    const upper = prefix.toUpperCase();
    for (const [key, value] of Object.entries(config)) {
      if (key.toUpperCase().startsWith(upper + '_') || key.toUpperCase() === upper) {
        chunk[key] = value;
        assigned.add(key);
      }
    }
    chunks.push({ name: prefix, config: chunk });
  }

  // Collect unmatched keys into a special "other" chunk
  const other: ConfigRecord = {};
  for (const [key, value] of Object.entries(config)) {
    if (!assigned.has(key)) {
      other[key] = value;
    }
  }
  if (Object.keys(other).length > 0) {
    chunks.push({ name: '__other__', config: other });
  }

  return { chunks, totalKeys: Object.keys(config).length };
}

/**
 * Split a config into chunks of at most `size` keys each.
 */
export function splitBySize(
  config: ConfigRecord,
  size: number
): SplitResult {
  if (size <= 0) throw new RangeError('size must be a positive integer');

  const entries = Object.entries(config);
  const chunks: Array<{ name: string; config: ConfigRecord }> = [];

  for (let i = 0; i < entries.length; i += size) {
    const slice = entries.slice(i, i + size);
    const chunk: ConfigRecord = {};
    for (const [k, v] of slice) chunk[k] = v;
    chunks.push({ name: `chunk_${Math.floor(i / size) + 1}`, config: chunk });
  }

  return { chunks, totalKeys: entries.length };
}

/**
 * Format a SplitResult for display.
 */
export function formatSplitResult(result: SplitResult): string {
  const lines: string[] = [`Total keys: ${result.totalKeys}`, ''];
  for (const { name, config } of result.chunks) {
    const count = Object.keys(config).length;
    lines.push(`[${name}] — ${count} key${count !== 1 ? 's' : ''}`);
    for (const key of Object.keys(config)) {
      lines.push(`  ${key}`);
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}
