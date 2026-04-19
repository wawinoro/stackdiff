import { formatDiff, OutputFormat, DiffEntry } from './formatter';

export type { DiffEntry, OutputFormat };
export { formatDiff };

export function printDiff(
  entries: DiffEntry[],
  format: OutputFormat = 'table',
  stream: NodeJS.WriteStream = process.stdout
): void {
  const output = formatDiff(entries, format);
  stream.write(output + '\n');
}

export function summarize(entries: DiffEntry[]): string {
  const counts = { added: 0, removed: 0, changed: 0, unchanged: 0 };
  for (const e of entries) {
    counts[e.status]++;
  }
  const parts: string[] = [];
  if (counts.changed) parts.push(`${counts.changed} changed`);
  if (counts.added) parts.push(`${counts.added} added`);
  if (counts.removed) parts.push(`${counts.removed} removed`);
  if (parts.length === 0) return 'Configs are identical.';
  return `Summary: ${parts.join(', ')}.`;
}
