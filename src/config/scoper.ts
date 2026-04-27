/**
 * scoper.ts — scope config keys by environment prefix or namespace
 */

export type ScopeMap = Record<string, Record<string, string>>;

/**
 * Extracts the scope (namespace) from a key like "APP_DB_HOST" given a list of known scopes.
 * Returns the matched scope or "default".
 */
export function detectScope(key: string, scopes: string[]): string {
  const upper = key.toUpperCase();
  for (const scope of scopes) {
    if (upper.startsWith(scope.toUpperCase() + "_")) {
      return scope;
    }
  }
  return "default";
}

/**
 * Groups a flat config into a ScopeMap keyed by scope.
 * Keys are stored without the scope prefix.
 */
export function scopeConfig(
  config: Record<string, string>,
  scopes: string[]
): ScopeMap {
  const result: ScopeMap = {};

  for (const [key, value] of Object.entries(config)) {
    const scope = detectScope(key, scopes);
    const strippedKey =
      scope !== "default"
        ? key.slice(scope.length + 1)
        : key;

    if (!result[scope]) result[scope] = {};
    result[scope][strippedKey] = value;
  }

  return result;
}

/**
 * Flattens a ScopeMap back into a flat config, re-adding scope prefixes.
 */
export function unscopeConfig(
  scopeMap: ScopeMap
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [scope, entries] of Object.entries(scopeMap)) {
    for (const [key, value] of Object.entries(entries)) {
      const fullKey = scope === "default" ? key : `${scope}_${key}`;
      result[fullKey] = value;
    }
  }

  return result;
}

/**
 * Lists all detected scopes present in a flat config given known scope names.
 */
export function listScopes(
  config: Record<string, string>,
  scopes: string[]
): string[] {
  const found = new Set<string>();
  for (const key of Object.keys(config)) {
    found.add(detectScope(key, scopes));
  }
  return Array.from(found).sort();
}
