import { Config } from './loader';

export type CompareMode = 'strict' | 'loose' | 'keys-only';

export interface CompareResult {
  matching: string[];
  missingInB: string[];
  missingInA: string[];
  differing: Array<{ key: string; aVal: string; bVal: string }>;
  score: number; // 0-100 similarity score
}

export function compareConfigs(
  a: Config,
  b: Config,
  mode: CompareMode = 'strict'
): CompareResult {
  const keysA = new Set(Object.keys(a));
  const keysB = new Set(Object.keys(b));

  const allKeys = new Set([...keysA, ...keysB]);

  const matching: string[] = [];
  const missingInB: string[] = [];
  const missingInA: string[] = [];
  const differing: CompareResult['differing'] = [];

  for (const key of allKeys) {
    const inA = keysA.has(key);
    const inB = keysB.has(key);

    if (!inA) {
      missingInA.push(key);
      continue;
    }
    if (!inB) {
      missingInB.push(key);
      continue;
    }

    if (mode === 'keys-only') {
      matching.push(key);
      continue;
    }

    const aVal = mode === 'loose' ? a[key].trim().toLowerCase() : a[key];
    const bVal = mode === 'loose' ? b[key].trim().toLowerCase() : b[key];

    if (aVal === bVal) {
      matching.push(key);
    } else {
      differing.push({ key, aVal: a[key], bVal: b[key] });
    }
  }

  const total = allKeys.size;
  const score = total === 0 ? 100 : Math.round((matching.length / total) * 100);

  return { matching, missingInB, missingInA, differing, score };
}

export function formatCompareResult(result: CompareResult, labelA = 'A', labelB = 'B'): string {
  const lines: string[] = [];
  lines.push(`Similarity score: ${result.score}%`);
  lines.push(`  Matching keys  : ${result.matching.length}`);
  lines.push(`  Only in ${labelA.padEnd(6)}: ${result.missingInB.join(', ') || '(none)'}`);
  lines.push(`  Only in ${labelB.padEnd(6)}: ${result.missingInA.join(', ') || '(none)'}`);
  if (result.differing.length > 0) {
    lines.push(`  Value diffs:`);
    for (const { key, aVal, bVal } of result.differing) {
      lines.push(`    ${key}: ${labelA}=${JSON.stringify(aVal)} | ${labelB}=${JSON.stringify(bVal)}`);
    }
  }
  return lines.join('\n');
}
