import { diffEnvConfigs, formatDiffResult } from './differ';

const left = {
  HOST: 'localhost',
  PORT: '3000',
  DB_URL: 'postgres://localhost/dev',
  ONLY_LEFT: 'yes',
};

const right = {
  HOST: 'prod.example.com',
  PORT: '3000',
  DB_URL: 'postgres://prod/main',
  ONLY_RIGHT: 'true',
};

describe('diffEnvConfigs', () => {
  it('detects changed keys', () => {
    const result = diffEnvConfigs(left, right);
    const changed = result.entries.filter(e => e.status === 'changed');
    expect(changed.map(e => e.key)).toEqual(['DB_URL', 'HOST']);
  });

  it('detects added keys', () => {
    const result = diffEnvConfigs(left, right);
    const added = result.entries.filter(e => e.status === 'added');
    expect(added.map(e => e.key)).toEqual(['ONLY_RIGHT']);
  });

  it('detects removed keys', () => {
    const result = diffEnvConfigs(left, right);
    const removed = result.entries.filter(e => e.status === 'removed');
    expect(removed.map(e => e.key)).toEqual(['ONLY_LEFT']);
  });

  it('counts unchanged keys correctly', () => {
    const result = diffEnvConfigs(left, right);
    expect(result.unchanged).toBe(1);
  });

  it('includes unchanged entries when flag is set', () => {
    const result = diffEnvConfigs(left, right, true);
    const unchanged = result.entries.filter(e => e.status === 'unchanged');
    expect(unchanged.map(e => e.key)).toEqual(['PORT']);
  });

  it('returns correct summary counts', () => {
    const result = diffEnvConfigs(left, right);
    expect(result.added).toBe(1);
    expect(result.removed).toBe(1);
    expect(result.changed).toBe(2);
  });

  it('handles empty configs', () => {
    const result = diffEnvConfigs({}, {});
    expect(result.entries).toHaveLength(0);
  });
});

describe('formatDiffResult', () => {
  it('includes summary line', () => {
    const result = diffEnvConfigs(left, right);
    const output = formatDiffResult(result);
    expect(output).toContain('Summary:');
    expect(output).toContain('+1');
    expect(output).toContain('-1');
  });

  it('prefixes added lines with +', () => {
    const result = diffEnvConfigs({}, { NEW_KEY: 'val' });
    expect(formatDiffResult(result)).toContain('+ NEW_KEY=val');
  });

  it('prefixes removed lines with -', () => {
    const result = diffEnvConfigs({ OLD_KEY: 'val' }, {});
    expect(formatDiffResult(result)).toContain('- OLD_KEY=val');
  });

  it('prefixes changed lines with ~', () => {
    const result = diffEnvConfigs({ K: 'a' }, { K: 'b' });
    expect(formatDiffResult(result)).toContain('~ K: a → b');
  });
});
