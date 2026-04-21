import { ConfigMap } from './loader';

export type LintSeverity = 'error' | 'warn' | 'info';

export interface LintIssue {
  key: string;
  message: string;
  severity: LintSeverity;
}

export interface LintResult {
  issues: LintIssue[];
  errorCount: number;
  warnCount: number;
  passed: boolean;
}

const EMPTY_VALUE_KEYS_WHITELIST = new Set(['OPTIONAL_FEATURE', 'DEBUG']);

function checkEmptyValues(config: ConfigMap): LintIssue[] {
  return Object.entries(config)
    .filter(([key, val]) => !EMPTY_VALUE_KEYS_WHITELIST.has(key) && (val === '' || val === null || val === undefined))
    .map(([key]) => ({
      key,
      message: `Key "${key}" has an empty or null value`,
      severity: 'warn' as LintSeverity,
    }));
}

function checkNamingConventions(config: ConfigMap): LintIssue[] {
  const issues: LintIssue[] = [];
  for (const key of Object.keys(config)) {
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
      issues.push({
        key,
        message: `Key "${key}" does not follow SCREAMING_SNAKE_CASE convention`,
        severity: 'error',
      });
    }
  }
  return issues;
}

function checkDuplicatePrefixes(config: ConfigMap): LintIssue[] {
  const prefixMap: Record<string, string[]> = {};
  for (const key of Object.keys(config)) {
    const prefix = key.split('_')[0];
    if (!prefixMap[prefix]) prefixMap[prefix] = [];
    prefixMap[prefix].push(key);
  }
  const issues: LintIssue[] = [];
  for (const [prefix, keys] of Object.entries(prefixMap)) {
    if (keys.length === 1 && prefix.length <= 2) {
      issues.push({
        key: keys[0],
        message: `Key "${keys[0]}" uses a very short prefix "${prefix}" — consider a more descriptive namespace`,
        severity: 'info',
      });
    }
  }
  return issues;
}

export function lintConfig(config: ConfigMap): LintResult {
  const issues: LintIssue[] = [
    ...checkEmptyValues(config),
    ...checkNamingConventions(config),
    ...checkDuplicatePrefixes(config),
  ];

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warnCount = issues.filter(i => i.severity === 'warn').length;

  return {
    issues,
    errorCount,
    warnCount,
    passed: errorCount === 0,
  };
}

export function formatLintResult(result: LintResult): string {
  if (result.issues.length === 0) return '✔ No lint issues found.';
  const lines = result.issues.map(i => {
    const icon = i.severity === 'error' ? '✖' : i.severity === 'warn' ? '⚠' : 'ℹ';
    return `  ${icon} [${i.severity.toUpperCase()}] ${i.message}`;
  });
  lines.push('');
  lines.push(`${result.errorCount} error(s), ${result.warnCount} warning(s).`);
  return lines.join('\n');
}
