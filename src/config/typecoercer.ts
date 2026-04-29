/**
 * typecoercer.ts — coerce config values to target types with optional strict mode
 */

export type CoerceType = 'string' | 'number' | 'boolean' | 'json';

export interface CoerceRule {
  key: string;
  type: CoerceType;
}

export interface CoerceResult {
  coerced: Record<string, unknown>;
  changes: Array<{ key: string; from: string; to: CoerceType; value: unknown }>;
  errors: Array<{ key: string; reason: string }>;
}

export function coerceValue(raw: string, type: CoerceType): unknown {
  switch (type) {
    case 'string':
      return raw;
    case 'number': {
      const n = Number(raw);
      if (isNaN(n)) throw new Error(`Cannot coerce "${raw}" to number`);
      return n;
    }
    case 'boolean': {
      const lower = raw.trim().toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') return true;
      if (lower === 'false' || lower === '0' || lower === 'no') return false;
      throw new Error(`Cannot coerce "${raw}" to boolean`);
    }
    case 'json': {
      try {
        return JSON.parse(raw);
      } catch {
        throw new Error(`Cannot coerce "${raw}" to JSON`);
      }
    }
  }
}

export function coerceConfig(
  config: Record<string, string>,
  rules: CoerceRule[]
): CoerceResult {
  const coerced: Record<string, unknown> = { ...config };
  const changes: CoerceResult['changes'] = [];
  const errors: CoerceResult['errors'] = [];

  for (const rule of rules) {
    const raw = config[rule.key];
    if (raw === undefined) continue;
    try {
      const value = coerceValue(raw, rule.type);
      coerced[rule.key] = value;
      if (rule.type !== 'string') {
        changes.push({ key: rule.key, from: 'string', to: rule.type, value });
      }
    } catch (err) {
      errors.push({ key: rule.key, reason: (err as Error).message });
    }
  }

  return { coerced, changes, errors };
}

export function formatCoerceResult(result: CoerceResult): string {
  const lines: string[] = [];
  if (result.changes.length > 0) {
    lines.push(`Coerced ${result.changes.length} key(s):`);
    for (const c of result.changes) {
      lines.push(`  ${c.key}: string → ${c.to} (${JSON.stringify(c.value)})`);
    }
  } else {
    lines.push('No keys coerced.');
  }
  if (result.errors.length > 0) {
    lines.push(`Errors (${result.errors.length}):`);
    for (const e of result.errors) {
      lines.push(`  ${e.key}: ${e.reason}`);
    }
  }
  return lines.join('\n');
}
