import { profileConfig, formatProfileReport } from './profiler';

describe('profileConfig', () => {
  it('returns zero stats for empty config', () => {
    const stats = profileConfig({});
    expect(stats.totalKeys).toBe(0);
    expect(stats.secretKeys).toBe(0);
    expect(stats.longestKey).toBe('');
  });

  it('counts total keys correctly', () => {
    const stats = profileConfig({ A: '1', B: '2', C: '3' });
    expect(stats.totalKeys).toBe(3);
  });

  it('detects secret keys by pattern', () => {
    const stats = profileConfig({
      DB_PASSWORD: 'secret',
      API_TOKEN: 'tok',
      APP_NAME: 'myapp',
    });
    expect(stats.secretKeys).toBe(2);
  });

  it('counts empty values', () => {
    const stats = profileConfig({ A: '', B: 'hello', C: '' });
    expect(stats.emptyValues).toBe(2);
  });

  it('counts numeric values', () => {
    const stats = profileConfig({ PORT: '3000', TIMEOUT: '30', NAME: 'app' });
    expect(stats.numericValues).toBe(2);
  });

  it('counts boolean values', () => {
    const stats = profileConfig({ DEBUG: 'true', VERBOSE: 'false', NAME: 'app' });
    expect(stats.booleanValues).toBe(2);
  });

  it('identifies the longest key', () => {
    const stats = profileConfig({ SHORT: 'a', VERY_LONG_KEY_NAME: 'b', MED: 'c' });
    expect(stats.longestKey).toBe('VERY_LONG_KEY_NAME');
  });

  it('groups keys by prefix', () => {
    const stats = profileConfig({
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      APP_NAME: 'test',
    });
    expect(stats.prefixes['DB']).toBe(2);
    expect(stats.prefixes['APP']).toBe(1);
  });

  it('calculates average value length', () => {
    const stats = profileConfig({ A: 'ab', B: 'abcd' });
    expect(stats.avgValueLength).toBe(3);
  });
});

describe('formatProfileReport', () => {
  it('includes all stat labels', () => {
    const stats = profileConfig({ DB_HOST: 'localhost', DB_PORT: '5432', SECRET_KEY: 'x' });
    const report = formatProfileReport(stats);
    expect(report).toContain('Total keys');
    expect(report).toContain('Secret keys');
    expect(report).toContain('Top prefixes');
    expect(report).toContain('DB_*');
  });

  it('handles empty config gracefully', () => {
    const report = formatProfileReport(profileConfig({}));
    expect(report).toContain('Total keys      : 0');
    expect(report).toContain('(none)');
  });
});
