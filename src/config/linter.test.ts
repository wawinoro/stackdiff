import { lintConfig, formatLintResult, LintResult } from './linter';

describe('lintConfig', () => {
  it('passes a clean config with no issues', () => {
    const result = lintConfig({ DATABASE_URL: 'postgres://localhost/db', APP_PORT: '3000' });
    expect(result.passed).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('reports error for keys not in SCREAMING_SNAKE_CASE', () => {
    const result = lintConfig({ camelCaseKey: 'value', GOOD_KEY: 'ok' });
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(1);
    expect(errors[0].key).toBe('camelCaseKey');
    expect(result.passed).toBe(false);
  });

  it('reports warning for empty string values', () => {
    const result = lintConfig({ API_KEY: '', APP_NAME: 'stackdiff' });
    const warns = result.issues.filter(i => i.severity === 'warn');
    expect(warns).toHaveLength(1);
    expect(warns[0].key).toBe('API_KEY');
  });

  it('does not warn for whitelisted empty keys', () => {
    const result = lintConfig({ DEBUG: '', OPTIONAL_FEATURE: '' });
    const warns = result.issues.filter(i => i.severity === 'warn');
    expect(warns).toHaveLength(0);
  });

  it('counts errors and warnings separately', () => {
    const result = lintConfig({ badKey: '', GOOD_KEY: 'val' });
    expect(result.errorCount).toBe(1);
    expect(result.warnCount).toBe(1);
  });

  it('reports info for very short prefix namespaces', () => {
    const result = lintConfig({ DB_URL: 'postgres://localhost' });
    const infos = result.issues.filter(i => i.severity === 'info');
    expect(infos).toHaveLength(1);
    expect(infos[0].key).toBe('DB_URL');
  });
});

describe('formatLintResult', () => {
  it('returns success message when no issues', () => {
    const result: LintResult = { issues: [], errorCount: 0, warnCount: 0, passed: true };
    expect(formatLintResult(result)).toBe('✔ No lint issues found.');
  });

  it('includes severity icons and summary line', () => {
    const result = lintConfig({ badKey: '', GOOD_KEY: 'val' });
    const output = formatLintResult(result);
    expect(output).toContain('✖');
    expect(output).toContain('⚠');
    expect(output).toContain('error(s)');
    expect(output).toContain('warning(s)');
  });
});
