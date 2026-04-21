import { auditConfig, formatAuditReport, AuditReport } from './auditor';

describe('auditConfig', () => {
  it('returns no issues for a clean config', () => {
    const report = auditConfig({ HOST: 'localhost', PORT: '3000', NAME: 'myapp' });
    expect(report.issues).toHaveLength(0);
    expect(report.passedChecks).toBe(report.totalChecks);
  });

  it('flags empty values as warnings', () => {
    const report = auditConfig({ HOST: '' });
    const issue = report.issues.find(i => i.key === 'HOST');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warn');
  });

  it('flags whitespace-only values as warnings', () => {
    const report = auditConfig({ HOST: '   ' });
    const issue = report.issues.find(i => i.key === 'HOST');
    expect(issue?.severity).toBe('warn');
  });

  it('flags placeholder values as errors', () => {
    const report = auditConfig({ API_URL: 'changeme' });
    const issue = report.issues.find(i => i.key === 'API_URL');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('error');
  });

  it('flags unmasked secret keys as warnings', () => {
    const report = auditConfig({ DB_PASSWORD: 'hunter2' });
    const issue = report.issues.find(i => i.key === 'DB_PASSWORD');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warn');
  });

  it('does not flag already-masked secrets', () => {
    const report = auditConfig({ DB_PASSWORD: '***masked***' });
    const issue = report.issues.find(
      i => i.key === 'DB_PASSWORD' && i.message.includes('not masked')
    );
    expect(issue).toBeUndefined();
  });

  it('tracks totalChecks as 3x the number of keys', () => {
    const report = auditConfig({ A: '1', B: '2' });
    expect(report.totalChecks).toBe(6);
  });
});

describe('formatAuditReport', () => {
  it('shows no issues message when clean', () => {
    const report: AuditReport = { issues: [], passedChecks: 3, totalChecks: 3 };
    const output = formatAuditReport(report);
    expect(output).toContain('3/3 checks passed');
    expect(output).toContain('No issues found');
  });

  it('lists issues with severity labels', () => {
    const report: AuditReport = {
      issues: [{ key: 'FOO', severity: 'error', message: 'Bad value' }],
      passedChecks: 2,
      totalChecks: 3,
    };
    const output = formatAuditReport(report);
    expect(output).toContain('[ERROR]');
    expect(output).toContain('Bad value');
  });
});
