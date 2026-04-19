import { ConfigMap } from './loader';

export type MergeStrategy = 'staging' | 'production' | 'union' | 'intersection';

export interface MergeOptions {
  strategy: MergeStrategy;
  overrides?: Record<string, string>;
}

/**
 * Merges two config maps according to the given strategy.
 * - staging: prefer staging values
 * - production: prefer production values
 * - union: include all keys, prefer left (staging)
 * - intersection: only keys present in both
 */
export function mergeConfigs(
  staging: ConfigMap,
  production: ConfigMap,
  options: MergeOptions
): ConfigMap {
  const { strategy, overrides = {} } = options;
  let result: ConfigMap = {};

  switch (strategy) {
    case 'staging':
      result = { ...production, ...staging };
      break;
    case 'production':
      result = { ...staging, ...production };
      break;
    case 'union':
      result = { ...production, ...staging };
      break;
    case 'intersection': {
      for (const key of Object.keys(staging)) {
        if (key in production) {
          result[key] = staging[key];
        }
      }
      break;
    }
    default:
      throw new Error(`Unknown merge strategy: ${strategy}`);
  }

  // Apply manual overrides last
  for (const [key, value] of Object.entries(overrides)) {
    result[key] = value;
  }

  return result;
}

export function mergeWithDefaults(
  config: ConfigMap,
  defaults: ConfigMap
): ConfigMap {
  return { ...defaults, ...config };
}
