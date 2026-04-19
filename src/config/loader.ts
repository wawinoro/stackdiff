import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export type StackConfig = Record<string, string | number | boolean | null>;

export interface LoadedStack {
  name: string;
  config: StackConfig;
}

export function loadConfig(filePath: string, stackName: string): LoadedStack {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Config file not found: ${resolved}`);
  }

  const ext = path.extname(resolved).toLowerCase();
  const raw = fs.readFileSync(resolved, 'utf-8');

  let config: StackConfig;

  if (ext === '.json') {
    config = JSON.parse(raw) as StackConfig;
  } else if (ext === '.yaml' || ext === '.yml') {
    config = yaml.load(raw) as StackConfig;
  } else {
    throw new Error(`Unsupported config format: ${ext}. Use .json or .yaml/.yml`);
  }

  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    throw new Error(`Config file must be a key-value object: ${resolved}`);
  }

  return { name: stackName, config };
}
