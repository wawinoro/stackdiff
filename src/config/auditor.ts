import { ConfigMap } from './loader';

export type AuditSeverity = 'info' | 'warn' | 'error';

export interface AuditIssue {
  key: string;
  severity: AuditSeverity;
  message: string;
}

export interface AuditReport {
  issues: AuditIssue[];
  passedChecks: number;
  totalChecks: number;
}

const SECRET_PATTERNS = /password|secret|token|key|api_key|private/i;
const PLACEHOLDER_PATTERNS = /^(todo|fixme|changeme|placeholder|xxx|tbd)$/i;
const EMPTY_VALUE = /^\s*$/;

export function auditConfig(config: ConfigMap): AuditReport {
  const issues: AuditIssue[] = [];
  const entries = Object.entries(config);
  let passedChecks = 0;
  const totalChecks = entries.length * 3;

  for (const [key, value] of entries) {
    const strValue = String(value ?? '');

    // Check 1: empty values
    if (EMPTY_VALUE.test(strValue)) {
      issues.push({ key, severity: 'warn', message: `Value for "${key}" is empty or whitespace` });
    } else {
      passedChecks++;
    }

    // Check 2: placeholder values
    if (PLACEHOLDER_PATTERNS.test(strValue)) {
      issues.push({ key, severity: 'error', message: `Value for "${key}" appears to be a placeholder: "${strValue}"` });
    } else {
      passedChecks++;
    }

    // Check 3: unmasked secrets
    if (SECRET_PATTERNS.test(key) && strValue.length > 0 && !strValue.startsWith('***')) {
      issues.push({ key, severity: 'warn', message: `Key "${key}" looks like a secret but value is not masked` });
    } else {
      passedChecks++;
    }
  }

  return { issues, passedChecks, totalChecks };
}

export function formatAuditReport(report: AuditReport): string {
  const lines: string[] = [];
  lines.push(`Audit: ${report.passedChecks}/${report.totalChecks} checks passed`);
  if (report.issues.length === 0) {
    lines.push('  No issues found.');
  } else {
    for (const issue of report.issues) {
      const icon = issue.severity === 'error' ? '✖' : '⚠';
      lines.push(`  [${issue.severity.toUpperCase()}] ${icon} ${issue.message}`);
    }
  }
  return lines.join('\n');
}
