import { compareConfigs, formatCompareResult, CompareResult } from './comparator';

describe('compareConfigs', () => {
  const a = { HOST: 'localhost', PORT: '3000', DEBUG: 'true' };
  const b = { HOST: 'prod.example.com', PORT: '3000', TIMEOUT: '30' };

  it('identifies matching keys with same values', () => {
    const result = compareConfigs(a, b);
    expect(result.matching).toContain('PORT');
  });

  it('identifies keys only in a', () => {
    const result = compareConfigs(a, b);
    expect(result.missingInB).toContain('DEBUG');
  });

  it('identifies keys only in b', () => {
    const result = compareConfigs(a, b);
    expect(result.missingInA).toContain('TIMEOUT');
  });

  it('identifies differing values', () => {
    const result = compareConfigs(a, b);
    const diff = result.differing.find(d => d.key === 'HOST');
    expect(diff).toBeDefined();
    expect(diff?.aVal).toBe('localhost');
    expect(diff?.bVal).toBe('prod.example.com');
  });

  it('computes a similarity score', () => {
    const result = compareConfigs(a, b);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('returns score 100 for identical configs', () => {
    const result = compareConfigs(a, a);
    expect(result.score).toBe(100);
    expect(result.differing).toHaveLength(0);
  });

  it('keys-only mode treats all shared keys as matching', () => {
    const result = compareConfigs(a, b, 'keys-only');
    expect(result.matching).toContain('HOST');
    expect(result.differing).toHaveLength(0);
  });

  it('loose mode normalizes whitespace and case', () => {
    const x = { KEY: '  Hello  ' };
    const y = { KEY: 'hello' };
    const result = compareConfigs(x, y, 'loose');
    expect(result.matching).toContain('KEY');
  });

  it('handles empty configs', () => {
    const result = compareConfigs({}, {});
    expect(result.score).toBe(100);
  });
});

describe('formatCompareResult', () => {
  it('includes similarity score', () => {
    const result: CompareResult = {
      matching: ['A'],
      missingInA: [],
      missingInB: ['B'],
      differing: [{ key: 'C', aVal: '1', bVal: '2' }],
      score: 50,
    };
    const output = formatCompareResult(result, 'staging', 'prod');
    expect(output).toContain('50%');
    expect(output).toContain('staging');
    expect(output).toContain('prod');
  });
});
