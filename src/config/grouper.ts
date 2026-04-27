/**
 * Groups config keys by a common prefix or custom grouping strategy.
 */

export type GroupedConfig = Record<string, Record<string, string>>;

export type GroupStrategy = "prefix" | "custom";

export interface GroupOptions {
  strategy?: GroupStrategy;
  delimiter?: string;
  customGroups?: Record<string, string[]>;
  ungroupedKey?: string;
}

const DEFAULT_DELIMITER = "_";
const DEFAULT_UNGROUPED = "__ungrouped__";

/**
 * Extracts the prefix from a key using the given delimiter.
 */
export function extractPrefix(key: string, delimiter: string): string | null {
  const idx = key.indexOf(delimiter);
  return idx > 0 ? key.slice(0, idx) : null;
}

/**
 * Groups a flat config record by key prefix.
 */
export function groupByPrefix(
  config: Record<string, string>,
  delimiter = DEFAULT_DELIMITER,
  ungroupedKey = DEFAULT_UNGROUPED
): GroupedConfig {
  const result: GroupedConfig = {};

  for (const [key, value] of Object.entries(config)) {
    const prefix = extractPrefix(key, delimiter) ?? ungroupedKey;
    if (!result[prefix]) result[prefix] = {};
    result[prefix][key] = value;
  }

  return result;
}

/**
 * Groups a flat config record using a custom group map.
 * Keys not matched to any group fall into ungroupedKey.
 */
export function groupByCustom(
  config: Record<string, string>,
  customGroups: Record<string, string[]>,
  ungroupedKey = DEFAULT_UNGROUPED
): GroupedConfig {
  const assigned = new Set<string>();
  const result: GroupedConfig = {};

  for (const [group, keys] of Object.entries(customGroups)) {
    result[group] = {};
    for (const key of keys) {
      if (key in config) {
        result[group][key] = config[key];
        assigned.add(key);
      }
    }
  }

  for (const [key, value] of Object.entries(config)) {
    if (!assigned.has(key)) {
      if (!result[ungroupedKey]) result[ungroupedKey] = {};
      result[ungroupedKey][key] = value;
    }
  }

  return result;
}

/**
 * Main entry point: groups config according to provided options.
 */
export function groupConfig(
  config: Record<string, string>,
  options: GroupOptions = {}
): GroupedConfig {
  const {
    strategy = "prefix",
    delimiter = DEFAULT_DELIMITER,
    customGroups = {},
    ungroupedKey = DEFAULT_UNGROUPED,
  } = options;

  if (strategy === "custom") {
    return groupByCustom(config, customGroups, ungroupedKey);
  }

  return groupByPrefix(config, delimiter, ungroupedKey);
}

/**
 * Returns the list of group names from a GroupedConfig.
 */
export function listGroups(grouped: GroupedConfig): string[] {
  return Object.keys(grouped);
}
