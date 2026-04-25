import { ConfigRecord } from './loader';

export interface SanitizeOptions {
  trimWhitespace?: boolean;
  removeNullish?: boolean;
  collapseEmpty?: boolean;
  normalizeLineEndings?: boolean;
}

const DEFAULT_OPTIONS: SanitizeOptions = {
  trimWhitespace: true,
  removeNullish: true,
  collapseEmpty: false,
  normalizeLineEndings: true,
};

export function sanitizeValue(value: string, opts: SanitizeOptions): string {
  let v = value;
  if (opts.normalizeLineEndings) {
    v = v.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }
  if (opts.trimWhitespace) {
    v = v.trim();
  }
  return v;
}

export function isNullish(value: string): boolean {
  return value === '' || value === 'null' || value === 'undefined' || value === 'NULL';
}

export function sanitizeConfig(
  config: ConfigRecord,
  options: SanitizeOptions = {}
): ConfigRecord {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const result: ConfigRecord = {};

  for (const [key, value] of Object.entries(config)) {
    const sanitized = sanitizeValue(value, opts);

    if (opts.removeNullish && isNullish(sanitized)) {
      continue;
    }
    if (opts.collapseEmpty && sanitized === '') {
      continue;
    }

    result[key] = sanitized;
  }

  return result;
}

export function listSanitizedKeys(
  original: ConfigRecord,
  sanitized: ConfigRecord
): string[] {
  return Object.keys(original).filter(
    (k) => !(k in sanitized) || original[k] !== sanitized[k]
  );
}
