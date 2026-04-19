/**
 * Filter config entries by key pattern or value type.
 */

export interface FilterOptions {
  include?: string[];
  exclude?: string[];
  onlySecrets?: boolean;
  onlyEmpty?: boolean;
}

const SECRET_PATTERNS = [/secret/i, /password/i, /token/i, /key/i, /auth/i, /credential/i];

export function isSecretKey(key: string): boolean {
  return SECRET_PATTERNS.some((re) => re.test(key));
}

export function filterConfig(
  config: Record<string, string>,
  options: FilterOptions
): Record<string, string> {
  const entries = Object.entries(config);

  const filtered = entries.filter(([key, value]) => {
    if (options.include && options.include.length > 0) {
      const matched = options.include.some((pattern) =>
        key.toLowerCase().includes(pattern.toLowerCase())
      );
      if (!matched) return false;
    }

    if (options.exclude && options.exclude.length > 0) {
      const matched = options.exclude.some((pattern) =>
        key.toLowerCase().includes(pattern.toLowerCase())
      );
      if (matched) return false;
    }

    if (options.onlySecrets && !isSecretKey(key)) return false;

    if (options.onlyEmpty && value.trim() !== '') return false;

    return true;
  });

  return Object.fromEntries(filtered);
}
