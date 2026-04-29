import { Record } from '../types';

export type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffEntry {
  key: string;
  status: DiffStatus;
  left?: string;
  right?: string;
}

export interface DiffResult {
  entries: DiffEntry[];
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
}

export function diffEnvConfigs(
  left: Record<string, string>,
  right: Record<string, string>,
  includeUnchanged = false
): DiffResult {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  const entries: DiffEntry[] = [];
  let added = 0, removed = 0, changed = 0, unchanged = 0;

  for (const key of [...keys].sort()) {
    const lVal = left[key];
    const rVal = right[key];

    if (lVal === undefined) {
      entries.push({ key, status: 'added', right: rVal });
      added++;
    } else if (rVal === undefined) {
      entries.push({ key, status: 'removed', left: lVal });
      removed++;
    } else if (lVal !== rVal) {
      entries.push({ key, status: 'changed', left: lVal, right: rVal });
      changed++;
    } else {
      unchanged++;
      if (includeUnchanged) {
        entries.push({ key, status: 'unchanged', left: lVal, right: rVal });
      }
    }
  }

  return { entries, added, removed, changed, unchanged };
}

export function formatDiffResult(result: DiffResult): string {
  const lines: string[] = [];
  for (const entry of result.entries) {
    switch (entry.status) {
      case 'added':
        lines.push(`+ ${entry.key}=${entry.right}`);
        break;
      case 'removed':
        lines.push(`- ${entry.key}=${entry.left}`);
        break;
      case 'changed':
        lines.push(`~ ${entry.key}: ${entry.left} → ${entry.right}`);
        break;
      case 'unchanged':
        lines.push(`  ${entry.key}=${entry.left}`);
        break;
    }
  }
  lines.push(`\nSummary: +${result.added} -${result.removed} ~${result.changed} =${result.unchanged}`);
  return lines.join('\n');
}
