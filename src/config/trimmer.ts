/**
 * trimmer.ts — strips leading/trailing whitespace from config values
 * and optionally collapses internal whitespace.
 */

export type TrimOptions = {
  /** Also collapse runs of internal whitespace to a single space */
  collapseInternal?: boolean;
  /** Keys to skip during trimming */
  excludeKeys?: string[];
};

/**
 * Trim a single string value according to options.
 */
export function trimValue(value: string, opts: TrimOptions = {}): string {
  let result = value.trim();
  if (opts.collapseInternal) {
    result = result.replace(/\s+/g, " ");
  }
  return result;
}

/**
 * Return a list of keys whose values had surrounding whitespace.
 */
export function listUntrimmedKeys(
  config: Record<string, string>
): string[] {
  return Object.entries(config)
    .filter(([, v]) => v !== v.trim())
    .map(([k]) => k);
}

/**
 * Trim all string values in a config object.
 * Non-string values are left untouched.
 */
export function trimConfig(
  config: Record<string, string>,
  opts: TrimOptions = {}
): Record<string, string> {
  const excluded = new Set(opts.excludeKeys ?? []);
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(config)) {
    if (excluded.has(key)) {
      result[key] = value;
    } else {
      result[key] = trimValue(value, opts);
    }
  }

  return result;
}
