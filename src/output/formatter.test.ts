import { formatDiff, DiffEntry } from './formatter';

const entries: DiffEntry[] = [
  { key: 'DB_HOST', staging: 'localhost', production: 'prod.db.example.com', status: 'changed' },
  { key: 'NEW_FLAG', staging: undefined, production: 'true', status: 'added' },
  { key: 'OLD_KEY', staging: 'foo', production: undefined, status: 'removed' },
  { key: 'SAME_KEY', staging: 'bar', production: 'bar', status: 'unchanged' },
];

describe('formatDiff', () => {
  it('minimal format shows only changed entries with symbols', () => {
    const output = formatDiff(entries, 'minimal');
    expect(output).toContain('~ DB_HOST: localhost → prod.db.example.com');
    expect(output).toContain('+ NEW_FLAG=true');
    expect(output).toContain('- OLD_KEY=foo');
    expect(output).not.toContain('SAME_KEY');
  });

  it('json format returns valid JSON with only changed entries', () => {
    const output = formatDiff(entries, 'json');
    const parsed = JSON.parse(output);
    expect(parsed).toHaveLength(3);
    expect(parsed.find((e: DiffEntry) => e.key === 'SAME_KEY')).toBeUndefined();
  });

  it('table format includes header and separator', () => {
    const output = formatDiff(entries, 'table');
    expect(output).toContain('KEY');
    expect(output).toContain('STATUS');
    expect(output).toContain('STAGING');
    expect(output).toContain('PRODUCTION');
    expect(output).toContain('DB_HOST');
  });

  it('table format returns no-diff message when all unchanged', () => {
    const noChange: DiffEntry[] = [
      { key: 'X', staging: '1', production: '1', status: 'unchanged' },
    ];
    expect(formatDiff(noChange, 'table')).toBe('No differences found.');
  });

  it('defaults to table format', () => {
    const output = formatDiff(entries);
    expect(output).toContain('KEY');
  });
});
