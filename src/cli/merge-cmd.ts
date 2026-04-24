import { loadConfig } from '../config/loader';
import { mergeConfigs, MergeOptions, MergeStrategy } from '../config/merger';
import { validateConfig } from '../config/validator';
import * as fs from 'fs';
import * as path from 'path';

export interface MergeCmdOptions {
  stagingPath: string;
  productionPath: string;
  strategy: MergeStrategy;
  output?: string;
  overrides?: Record<string, string>;
}

export async function runMergeCmd(opts: MergeCmdOptions): Promise<void> {
  const staging = loadConfig(opts.stagingPath);
  const production = loadConfig(opts.productionPath);

  validateConfig(staging);
  validateConfig(production);

  const mergeOptions: MergeOptions = {
    strategy: opts.strategy,
    overrides: opts.overrides,
  };

  const merged = mergeConfigs(staging, production, mergeOptions);

  const lines = Object.entries(merged)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`);

  const output = lines.join('\n') + '\n';

  if (opts.output) {
    const outPath = path.resolve(opts.output);
    ensureOutputDir(outPath);
    fs.writeFileSync(outPath, output, 'utf-8');
    console.log(`Merged config written to ${outPath} (${lines.length} keys)`);
  } else {
    process.stdout.write(output);
  }
}

/**
 * Ensures the directory for the given file path exists, creating it
 * (and any intermediate directories) if necessary.
 */
function ensureOutputDir(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function parseOverrides(raw: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const item of raw) {
    const eq = item.indexOf('=');
    if (eq === -1) throw new Error(`Invalid override format (expected KEY=VALUE): ${item}`);
    result[item.slice(0, eq)] = item.slice(eq + 1);
  }
  return result;
}
