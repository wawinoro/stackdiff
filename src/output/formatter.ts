export type DiffEntry = {
  key: string;
  staging: string | undefined;
  production: string | undefined;
  status: 'added' | 'removed' | 'changed' | 'unchanged';
};

export type OutputFormat = 'table' | 'json' | 'minimal';

export function formatDiff(entries: DiffEntry[], format: OutputFormat = 'table'): string {
  const changed = entries.filter((e) => e.status !== 'unchanged');

  if (format === 'json') {
    return JSON.stringify(changed, null, 2);
  }

  if (format === 'minimal') {
    return changed
      .map((e) => {
        if (e.status === 'added') return `+ ${e.key}=${e.production}`;
        if (e.status === 'removed') return `- ${e.key}=${e.staging}`;
        return `~ ${e.key}: ${e.staging} → ${e.production}`;
      })
      .join('\n');
  }

  // table format
  if (changed.length === 0) return 'No differences found.';

  const header = `${'KEY'.padEnd(30)} ${'STATUS'.padEnd(10)} ${'STAGING'.padEnd(25)} ${'PRODUCTION'.padEnd(25)}`;
  const separator = '-'.repeat(94);
  const rows = changed.map((e) => {
    const key = e.key.padEnd(30);
    const status = e.status.padEnd(10);
    const staging = (e.staging ?? '(none)').padEnd(25);
    const production = (e.production ?? '(none)').padEnd(25);
    return `${key} ${status} ${staging} ${production}`;
  });

  return [header, separator, ...rows].join('\n');
}
