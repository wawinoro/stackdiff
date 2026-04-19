import { loadConfig, Config } from './loader';
import { mergeWithDefaults } from './merger';
import { validateConfig } from './validator';
import * as path from 'path';

export interface ResolveOptions {
  defaultsPath?: string;
  strict?: boolean;
}

export interface ResolvedStack {
  name: string;
  config: Config;
  sourcePath: string;
}

export async function resolveStack(
  filePath: string,
  stackName: string,
  options: ResolveOptions = {}
): Promise<ResolvedStack> {
  const config = await loadConfig(filePath);

  let resolved = config;
  if (options.defaultsPath) {
    const defaults = await loadConfig(options.defaultsPath);
    resolved = mergeWithDefaults(config, defaults);
  }

  const errors = validateConfig(resolved);
  if (options.strict && errors.length > 0) {
    throw new Error(
      `Config validation failed for stack "${stackName}":\n` +
        errors.map((e) => `  - ${e}`).join('\n')
    );
  }

  return {
    name: stackName,
    config: resolved,
    sourcePath: path.resolve(filePath),
  };
}

export async function resolveBothStacks(
  stagingPath: string,
  productionPath: string,
  options: ResolveOptions = {}
): Promise<{ staging: ResolvedStack; production: ResolvedStack }> {
  const [staging, production] = await Promise.all([
    resolveStack(stagingPath, 'staging', options),
    resolveStack(productionPath, 'production', options),
  ]);
  return { staging, production };
}
