import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../config/loader';
import { validateAgainstSchema, applySchemaDefaults, ConfigSchema } from '../config/schema';

export interface SchemaArgs {
  configPath: string;
  schemaPath: string;
  applyDefaults?: boolean;
}

export function parseSchemaArgs(argv: string[]): SchemaArgs {
  const args: SchemaArgs = { configPath: '', schemaPath: '' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--config' && argv[i + 1]) args.configPath = argv[++i];
    else if (argv[i] === '--schema' && argv[i + 1]) args.schemaPath = argv[++i];
    else if (argv[i] === '--apply-defaults') args.applyDefaults = true;
  }
  if (!args.configPath) throw new Error('--config is required');
  if (!args.schemaPath) throw new Error('--schema is required');
  return args;
}

export async function runSchemaCmd(argv: string[]): Promise<void> {
  const args = parseSchemaArgs(argv);

  const config = await loadConfig(args.configPath);
  const schemaRaw = JSON.parse(
    fs.readFileSync(path.resolve(args.schemaPath), 'utf-8')
  ) as ConfigSchema;

  let effective = config;
  if (args.applyDefaults) {
    effective = applySchemaDefaults(config, schemaRaw);
  }

  const result = validateAgainstSchema(effective, schemaRaw);

  if (result.valid) {
    console.log('✓ Config is valid against schema');
  } else {
    console.error('✗ Schema validation failed:');
    for (const err of result.errors) {
      console.error(`  - ${err.message}`);
    }
    process.exit(1);
  }
}
