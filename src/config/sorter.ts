/**
 * Sorts config keys for consistent comparison and output.
 */

export type SortOrder = 'asc' | 'desc' | 'none';

export interface SortOptions {
  order?: SortOrder;
  priorityKeys?: string[];
}

/**
 * Sorts a config object's keys alphabetically, with optional priority keys first.
 */
export function sortConfig(
  config: Record<string, string>,
  options: SortOptions = {}
): Record<string, string> {
  const { order = 'asc', priorityKeys = [] } = options;

  if (order === 'none') return config;

  const allKeys = Object.keys(config);
  const priority = priorityKeys.filter((k) => allKeys.includes(k));
  const rest = allKeys.filter((k) => !priorityKeys.includes(k));

  const sortedRest = rest.sort((a, b) =>
    order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  );

  const sorted = [...priority, ...sortedRest];

  return sorted.reduce<Record<string, string>>((acc, key) => {
    acc[key] = config[key];
    return acc;
  }, {});
}

/**
 * Sorts an array of config key strings.
 */
export function sortKeys(keys: string[], order: SortOrder = 'asc'): string[] {
  if (order === 'none') return keys;
  return [...keys].sort((a, b) =>
    order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  );
}
