import * as yaml from 'js-yaml';

export type EncodingFormat = 'base64' | 'hex' | 'uri';

export interface EncodeOptions {
  keys?: string[];
  format?: EncodingFormat;
}

export interface EncodeResult {
  config: Record<string, string>;
  encodedKeys: string[];
}

export function encodeValue(value: string, format: EncodingFormat = 'base64'): string {
  switch (format) {
    case 'base64':
      return Buffer.from(value).toString('base64');
    case 'hex':
      return Buffer.from(value).toString('hex');
    case 'uri':
      return encodeURIComponent(value);
    default:
      throw new Error(`Unsupported encoding format: ${format}`);
  }
}

export function decodeValue(value: string, format: EncodingFormat = 'base64'): string {
  switch (format) {
    case 'base64':
      return Buffer.from(value, 'base64').toString('utf8');
    case 'hex':
      return Buffer.from(value, 'hex').toString('utf8');
    case 'uri':
      return decodeURIComponent(value);
    default:
      throw new Error(`Unsupported encoding format: ${format}`);
  }
}

export function encodeConfig(
  config: Record<string, string>,
  options: EncodeOptions = {}
): EncodeResult {
  const { keys, format = 'base64' } = options;
  const result: Record<string, string> = { ...config };
  const encodedKeys: string[] = [];

  for (const key of Object.keys(config)) {
    if (!keys || keys.includes(key)) {
      result[key] = encodeValue(config[key], format);
      encodedKeys.push(key);
    }
  }

  return { config: result, encodedKeys };
}

export function decodeConfig(
  config: Record<string, string>,
  options: EncodeOptions = {}
): Record<string, string> {
  const { keys, format = 'base64' } = options;
  const result: Record<string, string> = { ...config };

  for (const key of Object.keys(config)) {
    if (!keys || keys.includes(key)) {
      result[key] = decodeValue(config[key], format);
    }
  }

  return result;
}
