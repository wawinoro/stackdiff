/**
 * Flattens nested config objects into dot-notation keys and vice versa.
 */

export type FlatConfig = Record<string, string>;
export type NestedConfig = Record<string, unknown>;

export function flattenConfig(
  obj: NestedConfig,
  prefix = "",
  separator = "."
): FlatConfig {
  const result: FlatConfig = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}${separator}${key}` : key;

    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      const nested = flattenConfig(value as NestedConfig, fullKey, separator);
      Object.assign(result, nested);
    } else {
      result[fullKey] = Array.isArray(value)
        ? JSON.stringify(value)
        : String(value ?? "");
    }
  }

  return result;
}

export function unflattenConfig(
  flat: FlatConfig,
  separator = "."
): NestedConfig {
  const result: NestedConfig = {};

  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(separator);
    let current: Record<string, unknown> = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined || typeof current[part] !== "object") {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
  }

  return result;
}

export function flattenKeys(obj: NestedConfig, separator = "."): string[] {
  return Object.keys(flattenConfig(obj, "", separator));
}
