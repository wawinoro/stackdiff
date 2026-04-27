/**
 * aliaser.ts — map config keys to user-defined aliases
 */

export type AliasMap = Record<string, string>;

/**
 * Parse an alias map from an array of "alias=original" strings.
 */
export function parseAliasMap(entries: string[]): AliasMap {
  const map: AliasMap = {};
  for (const entry of entries) {
    const eq = entry.indexOf('=');
    if (eq < 1) throw new Error(`Invalid alias entry: "${entry}" (expected alias=original)`);
    const alias = entry.slice(0, eq).trim();
    const original = entry.slice(eq + 1).trim();
    if (!alias || !original) throw new Error(`Invalid alias entry: "${entry}"`);
    map[alias] = original;
  }
  return map;
}

/**
 * Apply aliases to a config: for each alias->original pair, if the original
 * key exists in config, expose it under the alias key as well.
 * When `replace` is true the original key is removed.
 */
export function applyAliases(
  config: Record<string, string>,
  aliasMap: AliasMap,
  replace = false
): Record<string, string> {
  const result: Record<string, string> = { ...config };
  for (const [alias, original] of Object.entries(aliasMap)) {
    if (Object.prototype.hasOwnProperty.call(config, original)) {
      result[alias] = config[original];
      if (replace) delete result[original];
    }
  }
  return result;
}

/**
 * Return the list of alias keys that were successfully resolved.
 */
export function listResolvedAliases(
  config: Record<string, string>,
  aliasMap: AliasMap
): string[] {
  return Object.entries(aliasMap)
    .filter(([, original]) => Object.prototype.hasOwnProperty.call(config, original))
    .map(([alias]) => alias);
}

/**
 * Return the list of alias keys whose originals were NOT found in config.
 */
export function listUnresolvedAliases(
  config: Record<string, string>,
  aliasMap: AliasMap
): string[] {
  return Object.entries(aliasMap)
    .filter(([, original]) => !Object.prototype.hasOwnProperty.call(config, original))
    .map(([alias]) => alias);
}
