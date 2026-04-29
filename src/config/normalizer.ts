import { ConfigRecord } from "./loader";

export type NormalizerOptions = {
  trimWhitespace?: boolean;
  lowercaseKeys?: boolean;
  uppercaseValues?: boolean;
  collapseWhitespace?: boolean;
};

export type NormalizeResult = {
  normalized: ConfigRecord;
  changes: Array<{ key: string; from: string; to: string }>;
};

export function normalizeValue(
  value: string,
  opts: NormalizerOptions
): string {
  let v = value;
  if (opts.trimWhitespace) v = v.trim();
  if (opts.collapseWhitespace) v = v.replace(/\s+/g, " ");
  if (opts.uppercaseValues) v = v.toUpperCase();
  return v;
}

export function normalizeKey(key: string, opts: NormalizerOptions): string {
  let k = key;
  if (opts.trimWhitespace) k = k.trim();
  if (opts.lowercaseKeys) k = k.toLowerCase();
  return k;
}

export function normalizeConfig(
  config: ConfigRecord,
  opts: NormalizerOptions = {}
): NormalizeResult {
  const normalized: ConfigRecord = {};
  const changes: NormalizeResult["changes"] = [];

  for (const [rawKey, rawValue] of Object.entries(config)) {
    const newKey = normalizeKey(rawKey, opts);
    const newValue = normalizeValue(rawValue, opts);

    if (newKey !== rawKey || newValue !== rawValue) {
      changes.push({ key: rawKey, from: rawValue, to: newValue });
    }

    normalized[newKey] = newValue;
  }

  return { normalized, changes };
}

export function formatNormalizeResult(result: NormalizeResult): string {
  if (result.changes.length === 0) {
    return "No normalization changes applied.";
  }
  const lines = result.changes.map(
    (c) => `  ${c.key}: ${JSON.stringify(c.from)} → ${JSON.stringify(c.to)}`
  );
  return `Normalized ${result.changes.length} value(s):\n${lines.join("\n")}`;
}
