import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { assertValidConfig, Config } from './validator';

export type FileFormat = 'json' | 'yaml' | 'env';

function detectFormat(filePath: string): FileFormat {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.json') return 'json';
  if (ext === '.yaml' || ext === '.yml') return 'yaml';
  return 'env';
}

function parseEnv(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    result[key] = value;
  }
  return result;
}

export function loadConfig(filePath: string): Config {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Config file not found: ${abs}`);
  }

  const content = fs.readFileSync(abs, 'utf-8');
  const format = detectFormat(filePath);

  let raw: unknown;
  if (format === 'json') {
    raw = JSON.parse(content);
  } else if (format === 'yaml') {
    raw = yaml.load(content);
  } else {
    raw = parseEnv(content);
  }

  return assertValidConfig(raw, filePath);
}
