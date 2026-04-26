import { ConfigMap } from './loader';

export interface DuplicateEntry {
  key: string;
  values: string[];
  normalized: string;
}

export interface DeduplicateResult {
  config: ConfigMap;
  duplicates: DuplicateEntry[];
  removedCount: number;
}

/**
 * Normalize a key for comparison: lowercase, strip separators.
 */
export function normalizeKeyForDedup(key: string): string {
  return key.toLowerCase().replace(/[_\-.]/g, '');
}

/**
 * Find keys that are semantically equivalent after normalization.
 */
export function findDuplicateKeys(config: ConfigMap): DuplicateEntry[] {
  const groups = new Map<string, string[]>();

  for (const key of Object.keys(config)) {
    const norm = normalizeKeyForDedup(key);
    const group = groups.get(norm) ?? [];
    group.push(key);
    groups.set(norm, group);
  }

  const duplicates: DuplicateEntry[] = [];
  for (const [normalized, keys] of groups) {
    if (keys.length > 1) {
      duplicates.push({
        key: keys[0],
        values: keys.map((k) => config[k]),
        normalized,
      });
    }
  }

  return duplicates;
}

/**
 * Remove duplicate keys from config, keeping the first occurrence.
 * Returns the cleaned config and metadata about what was removed.
 */
export function deduplicateConfig(config: ConfigMap): DeduplicateResult {
  const seen = new Map<string, string>();
  const result: ConfigMap = {};
  const duplicates = findDuplicateKeys(config);
  const duplicateNorms = new Set(duplicates.map((d) => d.normalized));

  for (const key of Object.keys(config)) {
    const norm = normalizeKeyForDedup(key);
    if (duplicateNorms.has(norm)) {
      if (!seen.has(norm)) {
        seen.set(norm, key);
        result[key] = config[key];
      }
    } else {
      result[key] = config[key];
    }
  }

  const removedCount = Object.keys(config).length - Object.keys(result).length;
  return { config: result, duplicates, removedCount };
}
