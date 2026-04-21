import { ConfigMap } from './loader';

export interface ProfileStats {
  totalKeys: number;
  secretKeys: number;
  emptyValues: number;
  numericValues: number;
  booleanValues: number;
  avgValueLength: number;
  longestKey: string;
  prefixes: Record<string, number>;
}

export function profileConfig(config: ConfigMap): ProfileStats {
  const keys = Object.keys(config);
  const totalKeys = keys.length;

  if (totalKeys === 0) {
    return {
      totalKeys: 0,
      secretKeys: 0,
      emptyValues: 0,
      numericValues: 0,
      booleanValues: 0,
      avgValueLength: 0,
      longestKey: '',
      prefixes: {},
    };
  }

  const secretPattern = /secret|password|token|key|pwd|auth/i;
  const prefixes: Record<string, number> = {};

  let secretKeys = 0;
  let emptyValues = 0;
  let numericValues = 0;
  let booleanValues = 0;
  let totalValueLength = 0;
  let longestKey = '';

  for (const key of keys) {
    const value = config[key];

    if (secretPattern.test(key)) secretKeys++;
    if (value === '' || value === null || value === undefined) emptyValues++;
    if (!isNaN(Number(value)) && value !== '') numericValues++;
    if (value === 'true' || value === 'false') booleanValues++;

    totalValueLength += String(value ?? '').length;

    if (key.length > longestKey.length) longestKey = key;

    const underscoreIdx = key.indexOf('_');
    if (underscoreIdx > 0) {
      const prefix = key.slice(0, underscoreIdx);
      prefixes[prefix] = (prefixes[prefix] ?? 0) + 1;
    }
  }

  return {
    totalKeys,
    secretKeys,
    emptyValues,
    numericValues,
    booleanValues,
    avgValueLength: Math.round(totalValueLength / totalKeys),
    longestKey,
    prefixes,
  };
}

export function formatProfileReport(stats: ProfileStats): string {
  const lines: string[] = [
    '=== Config Profile ===',
    `Total keys      : ${stats.totalKeys}`,
    `Secret keys     : ${stats.secretKeys}`,
    `Empty values    : ${stats.emptyValues}`,
    `Numeric values  : ${stats.numericValues}`,
    `Boolean values  : ${stats.booleanValues}`,
    `Avg value length: ${stats.avgValueLength}`,
    `Longest key     : ${stats.longestKey || '(none)'}`,
  ];

  const prefixEntries = Object.entries(stats.prefixes).sort((a, b) => b[1] - a[1]);
  if (prefixEntries.length > 0) {
    lines.push('Top prefixes:');
    for (const [prefix, count] of prefixEntries.slice(0, 5)) {
      lines.push(`  ${prefix}_* : ${count}`);
    }
  }

  return lines.join('\n');
}
