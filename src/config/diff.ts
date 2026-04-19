import { StackConfig } from './loader';

export type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffEntry {
  key: string;
  status: DiffStatus;
  sourceValue?: string | number | boolean | null;
  targetValue?: string | number | boolean | null;
}

export function diffConfigs(
  source: StackConfig,
  target: StackConfig
): DiffEntry[] {
  const allKeys = new Set([...Object.keys(source), ...Object.keys(target)]);
  const entries: DiffEntry[] = [];

  for (const key of Array.from(allKeys).sort()) {
    const inSource = Object.prototype.hasOwnProperty.call(source, key);
    const inTarget = Object.prototype.hasOwnProperty.call(target, key);

    if (inSource && !inTarget) {
      entries.push({ key, status: 'removed', sourceValue: source[key] });
    } else if (!inSource && inTarget) {
      entries.push({ key, status: 'added', targetValue: target[key] });
    } else if (source[key] !== target[key]) {
      entries.push({
        key,
        status: 'changed',
        sourceValue: source[key],
        targetValue: target[key],
      });
    } else {
      entries.push({
        key,
        status: 'unchanged',
        sourceValue: source[key],
        targetValue: target[key],
      });
    }
  }

  return entries;
}
