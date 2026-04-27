import { ConfigRecord } from "./loader";

export interface TagMap {
  [tag: string]: string[];
}

export interface TagResult {
  tagged: ConfigRecord;
  tagMap: TagMap;
}

/**
 * Parse a tag expression like "env:production" into { tag, pattern }
 */
export function parseTagExpression(expr: string): { tag: string; pattern: string } {
  const idx = expr.indexOf(":");
  if (idx === -1) throw new Error(`Invalid tag expression: "${expr}" (expected "tag:pattern")`);
  return { tag: expr.slice(0, idx).trim(), pattern: expr.slice(idx + 1).trim() };
}

/**
 * Tag config keys by matching key prefixes or glob-style wildcards.
 * Each matching key gets a "__tag__<key>" metadata entry.
 */
export function tagConfig(config: ConfigRecord, tagExpressions: string[]): TagResult {
  const tagMap: TagMap = {};
  const tagged: ConfigRecord = { ...config };

  for (const expr of tagExpressions) {
    const { tag, pattern } = parseTagExpression(expr);
    const regex = patternToRegex(pattern);

    for (const key of Object.keys(config)) {
      if (regex.test(key)) {
        if (!tagMap[tag]) tagMap[tag] = [];
        if (!tagMap[tag].includes(key)) tagMap[tag].push(key);
      }
    }
  }

  return { tagged, tagMap };
}

/**
 * Filter a config to only keys that belong to a given tag.
 */
export function filterByTag(config: ConfigRecord, tagMap: TagMap, tag: string): ConfigRecord {
  const keys = tagMap[tag] ?? [];
  return Object.fromEntries(keys.filter((k) => k in config).map((k) => [k, config[k]]));
}

/**
 * List all tags present in a tagMap.
 */
export function listTags(tagMap: TagMap): string[] {
  return Object.keys(tagMap).sort();
}

function patternToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`);
}
