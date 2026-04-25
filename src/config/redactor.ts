import { isSecretKey } from './filter';

export interface RedactOptions {
  placeholder?: string;
  keys?: string[];
  partial?: boolean;
}

const DEFAULT_PLACEHOLDER = '[REDACTED]';

export function redactValue(value: string, partial = false): string {
  if (!partial || value.length <= 4) {
    return DEFAULT_PLACEHOLDER;
  }
  const visible = Math.min(4, Math.floor(value.length * 0.25));
  return value.slice(0, visible) + '***';
}

export function redactConfig(
  config: Record<string, string>,
  options: RedactOptions = {}
): Record<string, string> {
  const {
    placeholder = DEFAULT_PLACEHOLDER,
    keys = [],
    partial = false,
  } = options;

  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(config)) {
    const shouldRedact = isSecretKey(key) || keys.includes(key);
    if (shouldRedact) {
      result[key] = partial
        ? redactValue(value, true)
        : placeholder;
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function listRedactedKeys(
  config: Record<string, string>,
  options: RedactOptions = {}
): string[] {
  const { keys = [] } = options;
  return Object.keys(config).filter(
    (key) => isSecretKey(key) || keys.includes(key)
  );
}
