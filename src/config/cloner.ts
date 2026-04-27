import { loadConfig } from './loader';
import { exportConfig } from './exporter';
import * as path from 'path';
import * as fs from 'fs';

export interface CloneOptions {
  overrides?: Record<string, string>;
  exclude?: string[];
  format?: 'env' | 'json' | 'yaml';
}

export interface CloneResult {
  source: string;
  destination: string;
  keysCopied: number;
  keysExcluded: number;
  keysOverridden: number;
}

export function cloneConfig(
  source: Record<string, string>,
  options: CloneOptions = {}
): Record<string, string> {
  const { overrides = {}, exclude = [] } = options;
  const excludeSet = new Set(exclude.map((k) => k.toUpperCase()));

  const cloned: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    if (excludeSet.has(key.toUpperCase())) continue;
    cloned[key] = key in overrides ? overrides[key] : value;
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (!(key in cloned) && !excludeSet.has(key.toUpperCase())) {
      cloned[key] = value;
    }
  }

  return cloned;
}

export async function cloneConfigFile(
  sourcePath: string,
  destPath: string,
  options: CloneOptions = {}
): Promise<CloneResult> {
  const source = await loadConfig(sourcePath);
  const { overrides = {}, exclude = [], format = 'env' } = options;
  const excludeSet = new Set(exclude.map((k) => k.toUpperCase()));

  const cloned = cloneConfig(source, options);

  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const content = exportConfig(cloned, format);
  fs.writeFileSync(destPath, content, 'utf-8');

  const keysExcluded = Object.keys(source).filter((k) =>
    excludeSet.has(k.toUpperCase())
  ).length;
  const keysOverridden = Object.keys(overrides).filter(
    (k) => k in source && !excludeSet.has(k.toUpperCase())
  ).length;

  return {
    source: sourcePath,
    destination: destPath,
    keysCopied: Object.keys(cloned).length,
    keysExcluded,
    keysOverridden,
  };
}

export function formatCloneResult(result: CloneResult): string {
  const lines = [
    `Cloned: ${result.source} → ${result.destination}`,
    `  Keys copied:     ${result.keysCopied}`,
    `  Keys excluded:   ${result.keysExcluded}`,
    `  Keys overridden: ${result.keysOverridden}`,
  ];
  return lines.join('\n');
}
