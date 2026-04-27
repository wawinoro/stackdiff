/**
 * linker.ts
 *
 * Resolves cross-file config references, allowing one config file to
 * "link" values from another using a `$ref:KEY` syntax. Useful when
 * staging and production configs share a base set of values.
 *
 * Example:
 *   BASE_URL=$ref:ORIGIN_URL
 *   resolves to the value of ORIGIN_URL from the linked config.
 */

export type ConfigRecord = Record<string, string>;

export interface LinkResult {
  resolved: ConfigRecord;
  unresolvedRefs: string[];
  linkedKeys: string[];
}

const REF_PREFIX = "$ref:";

/**
 * Returns true if the value is a link reference.
 */
export function isRef(value: string): boolean {
  return typeof value === "string" && value.startsWith(REF_PREFIX);
}

/**
 * Extracts the target key name from a ref string like `$ref:SOME_KEY`.
 */
export function extractRefKey(value: string): string {
  return value.slice(REF_PREFIX.length).trim();
}

/**
 * Resolves all `$ref:KEY` values in `target` by looking up KEY in `source`.
 * Keys that cannot be resolved are left as-is and recorded in `unresolvedRefs`.
 *
 * @param target  - The config whose values may contain `$ref:` references.
 * @param source  - The config used to resolve those references.
 * @returns       A LinkResult with the resolved config and diagnostics.
 */
export function linkConfigs(target: ConfigRecord, source: ConfigRecord): LinkResult {
  const resolved: ConfigRecord = {};
  const unresolvedRefs: string[] = [];
  const linkedKeys: string[] = [];

  for (const [key, value] of Object.entries(target)) {
    if (isRef(value)) {
      const refKey = extractRefKey(value);
      if (Object.prototype.hasOwnProperty.call(source, refKey)) {
        resolved[key] = source[refKey];
        linkedKeys.push(key);
      } else {
        // Keep the original ref value so callers can detect it.
        resolved[key] = value;
        unresolvedRefs.push(key);
      }
    } else {
      resolved[key] = value;
    }
  }

  return { resolved, unresolvedRefs, linkedKeys };
}

/**
 * Formats a human-readable summary of a LinkResult.
 */
export function formatLinkResult(result: LinkResult): string {
  const lines: string[] = [];

  if (result.linkedKeys.length > 0) {
    lines.push(`Linked keys (${result.linkedKeys.length}):`);
    for (const key of result.linkedKeys) {
      lines.push(`  ✔ ${key}`);
    }
  } else {
    lines.push("No keys were linked.");
  }

  if (result.unresolvedRefs.length > 0) {
    lines.push(`\nUnresolved refs (${result.unresolvedRefs.length}):`);
    for (const key of result.unresolvedRefs) {
      lines.push(`  ✘ ${key}  →  ${result.resolved[key]}`);
    }
  }

  return lines.join("\n");
}
