/**
 * pinner.ts — pin specific config keys to fixed values,
 * preventing them from being overwritten by merges or patches.
 */

export type PinnedConfig = {
  pins: Record<string, string>;
  source: Record<string, string>;
};

/**
 * Pin a set of keys to their current values in the config.
 * Returns a new config with a `__pinned__` metadata key listing pinned keys.
 */
export function pinKeys(
  config: Record<string, string>,
  keys: string[]
): PinnedConfig {
  const pins: Record<string, string> = {};
  for (const key of keys) {
    if (key in config) {
      pins[key] = config[key];
    }
  }
  return { pins, source: { ...config } };
}

/**
 * Apply a config update while respecting pinned keys.
 * Pinned keys in `incoming` are ignored; their pinned values are preserved.
 */
export function applyWithPins(
  pinned: PinnedConfig,
  incoming: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = { ...pinned.source, ...incoming };
  for (const [key, value] of Object.entries(pinned.pins)) {
    result[key] = value;
  }
  return result;
}

/**
 * List all currently pinned keys.
 */
export function listPinnedKeys(pinned: PinnedConfig): string[] {
  return Object.keys(pinned.pins);
}

/**
 * Remove pins for specific keys, returning an updated PinnedConfig.
 */
export function unpinKeys(
  pinned: PinnedConfig,
  keys: string[]
): PinnedConfig {
  const pins = { ...pinned.pins };
  for (const key of keys) {
    delete pins[key];
  }
  return { pins, source: pinned.source };
}

/**
 * Format a summary of pinned keys for display.
 */
export function formatPinReport(pinned: PinnedConfig): string {
  const keys = listPinnedKeys(pinned);
  if (keys.length === 0) return 'No keys are pinned.';
  const lines = keys.map((k) => `  ${k} = ${pinned.pins[k]}`);
  return `Pinned keys (${keys.length}):\n${lines.join('\n')}`;
}
