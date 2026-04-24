/**
 * renamer.ts — rename/alias keys in a config object
 */

export type RenameMap = Record<string, string>;

export interface RenameResult {
  config: Record<string, string>;
  renamed: string[];
  notFound: string[];
}

/**
 * Rename keys in a config according to a rename map.
 * Keys not present in the config are reported in `notFound`.
 */
export function renameKeys(
  config: Record<string, string>,
  renameMap: RenameMap
): RenameResult {
  const result: Record<string, string> = { ...config };
  const renamed: string[] = [];
  const notFound: string[] = [];

  for (const [oldKey, newKey] of Object.entries(renameMap)) {
    if (Object.prototype.hasOwnProperty.call(result, oldKey)) {
      result[newKey] = result[oldKey];
      delete result[oldKey];
      renamed.push(`${oldKey} -> ${newKey}`);
    } else {
      notFound.push(oldKey);
    }
  }

  return { config: result, renamed, notFound };
}

/**
 * Parse a list of "OLD=NEW" strings into a RenameMap.
 */
export function parseRenameMap(pairs: string[]): RenameMap {
  const map: RenameMap = {};
  for (const pair of pairs) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx < 1) {
      throw new Error(`Invalid rename pair (expected OLD=NEW): "${pair}"`);
    }
    const oldKey = pair.slice(0, eqIdx).trim();
    const newKey = pair.slice(eqIdx + 1).trim();
    if (!newKey) {
      throw new Error(`Empty new key in rename pair: "${pair}"`);
    }
    map[oldKey] = newKey;
  }
  return map;
}
