import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../config/loader';
import { migrateConfig, formatMigrationResult } from '../config/migrator';
import { exportConfig } from '../config/exporter';

export interface MigrateArgs {
  input: string;
  output?: string;
  targetVersion?: number;
  dryRun: boolean;
  format: 'env' | 'json' | 'yaml';
}

export function parseMigrateArgs(argv: string[]): MigrateArgs {
  const args: MigrateArgs = {
    input: '',
    dryRun: false,
    format: 'env',
  };

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--input':
      case '-i':
        args.input = argv[++i];
        break;
      case '--output':
      case '-o':
        args.output = argv[++i];
        break;
      case '--target-version':
        args.targetVersion = parseInt(argv[++i], 10);
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--format':
      case '-f':
        args.format = argv[++i] as MigrateArgs['format'];
        break;
    }
  }

  if (!args.input) {
    throw new Error('--input is required');
  }

  return args;
}

export async function runMigrateCmd(argv: string[]): Promise<void> {
  const args = parseMigrateArgs(argv);
  const config = loadConfig(args.input);
  const result = migrateConfig(config, args.targetVersion);

  console.log(formatMigrationResult(result));

  if (args.dryRun) {
    console.log('\n[dry-run] No changes written.');
    return;
  }

  const outputPath = args.output ?? args.input;
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const exported = exportConfig(result.config, args.format);
  fs.writeFileSync(outputPath, exported, 'utf-8');
  console.log(`\nWritten to ${outputPath}`);
}
