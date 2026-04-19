/**
 * Interpolates variable references within config values.
 * Supports ${VAR_NAME} syntax, resolving from the same config or process.env.
 */

export type ConfigRecord = Record<string, string>;

const INTERPOLATION_RE = /\$\{([^}]+)\}/g;

export function interpolateValue(
  value: string,
  context: ConfigRecord,
  env: ConfigRecord = process.env as ConfigRecord
): string {
  return value.replace(INTERPOLATION_RE, (_, key: string) => {
    if (key in context) return context[key];
    if (key in env) return env[key];
    return `\${${key}}`; // leave unresolved references as-is
  });
}

export function interpolateConfig(
  config: ConfigRecord,
  extraContext: ConfigRecord = {},
  env: ConfigRecord = process.env as ConfigRecord
): ConfigRecord {
  const context: ConfigRecord = { ...env, ...config, ...extraContext };
  const result: ConfigRecord = {};

  for (const [key, value] of Object.entries(config)) {
    result[key] = interpolateValue(value, context, env);
  }

  return result;
}

export function hasUnresolvedRefs(config: ConfigRecord): string[] {
  const unresolved: string[] = [];
  for (const [key, value] of Object.entries(config)) {
    if (INTERPOLATION_RE.test(value)) {
      unresolved.push(key);
      INTERPOLATION_RE.lastIndex = 0;
    }
  }
  return unresolved;
}
