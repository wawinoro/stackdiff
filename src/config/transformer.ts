/**
 * Transforms config values: masking secrets, normalizing keys, casting types.
 */

export type TransformOptions = {
  maskSecrets?: boolean;
  normalizeKeys?: boolean;
  castTypes?: boolean;
};

const SECRET_PATTERN = /secret|password|token|key|pwd|auth/i;
const MASK = '***';

export function maskSecrets(config: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(config).map(([k, v]) => [
      k,
      SECRET_PATTERN.test(k) ? MASK : v,
    ])
  );
}

export function normalizeKeys(config: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(config).map(([k, v]) => [k.toUpperCase().replace(/-/g, '_'), v])
  );
}

export function castTypes(
  config: Record<string, string>
): Record<string, string | boolean | number> {
  return Object.fromEntries(
    Object.entries(config).map(([k, v]) => {
      if (v === 'true') return [k, true];
      if (v === 'false') return [k, false];
      const num = Number(v);
      if (v !== '' && !isNaN(num)) return [k, num];
      return [k, v];
    })
  );
}

export function transformConfig(
  config: Record<string, string>,
  opts: TransformOptions = {}
): Record<string, unknown> {
  let result: Record<string, string> = { ...config };
  if (opts.normalizeKeys) result = normalizeKeys(result);
  if (opts.maskSecrets) result = maskSecrets(result);
  if (opts.castTypes) return castTypes(result);
  return result;
}
