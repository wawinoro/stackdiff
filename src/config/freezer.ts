import { Config } from './loader';

export interface FreezeResult {
  frozen: Config;
  frozenKeys: string[];
  skippedKeys: string[];
}

/**
 * Returns a set of keys that are currently frozen (locked from modification).
 */
export function getFrozenKeys(config: Config): Set<string> {
  const frozen = new Set<string>();
  for (const key of Object.keys(config)) {
    if (key.startsWith('FROZEN_') || key.endsWith('_LOCKED')) {
      frozen.add(key);
    }
  }
  return frozen;
}

/**
 * Freezes specified keys in a config by prefixing them with a freeze marker
 * and returning a new config where those keys cannot be overridden.
 */
export function freezeKeys(config: Config, keys: string[]): FreezeResult {
  const frozen: Config = { ...config };
  const frozenKeys: string[] = [];
  const skippedKeys: string[] = [];

  for (const key of keys) {
    if (!(key in config)) {
      skippedKeys.push(key);
      continue;
    }
    const markerKey = `FROZEN_${key}`;
    frozen[markerKey] = config[key];
    frozenKeys.push(key);
  }

  return { frozen, frozenKeys, skippedKeys };
}

/**
 * Applies a patch config on top of a base config, but skips any keys
 * that are frozen in the base config.
 */
export function applyWithFreeze(base: Config, patch: Config): Config {
  const frozenKeys = getFrozenKeys(base);
  const result: Config = { ...base };

  for (const [key, value] of Object.entries(patch)) {
    const markerKey = `FROZEN_${key}`;
    if (frozenKeys.has(key) || frozenKeys.has(markerKey)) {
      // skip frozen keys
      continue;
    }
    result[key] = value;
  }

  return result;
}

/**
 * Strips all freeze marker keys from a config, returning a clean copy.
 */
export function unfreeze(config: Config): Config {
  const result: Config = {};
  for (const [key, value] of Object.entries(config)) {
    if (!key.startsWith('FROZEN_') && !key.endsWith('_LOCKED')) {
      result[key] = value;
    }
  }
  return result;
}
