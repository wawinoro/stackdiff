import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../config/loader';
import { promoteConfig, applyPromotion, formatPromoteResult, PromoteOptions } from '../config/promoter';
import { exportConfig } from '../config/exporter';

export interface PromoteArgs {
  source: string;
  target: string;
  output?: string;
  overwrite: boolean;
  dryRun: boolean;
  keys?: string[];
  format: 'env' | 'json' | 'yaml';
}

export function parsePromoteArgs(argv: string[]): PromoteArgs {
  const args: PromoteArgs = {
    source: '',
    target: '',
    overwrite: false,
    dryRun: false,
    format: 'env',
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--source' || arg === '-s') args.source = argv[++i];
    else if (arg === '--target' || arg === '-t') args.target = argv[++i];
    else if (arg === '--output' || arg === '-o') args.output = argv[++i];
    else if (arg === '--overwrite') args.overwrite = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--keys') args.keys = argv[++i].split(',');
    else if (arg === '--format') args.format = argv[++i] as PromoteArgs['format'];
  }

  if (!args.source) throw new Error('--source is required');
  if (!args.target) throw new Error('--target is required');

  return args;
}

export async function runPromoteCmd(argv: string[]): Promise<void> {
  const args = parsePromoteArgs(argv);

  const sourceConfig = loadConfig(args.source);
  const targetConfig = loadConfig(args.target);

  const opts: PromoteOptions = {
    overwrite: args.overwrite,
    dryRun: args.dryRun,
    keys: args.keys,
  };

  const result = promoteConfig(sourceConfig, targetConfig, opts);
  const report = formatPromoteResult(result);
  console.log(report);

  if (args.dryRun) return;

  if (Object.keys(result.conflicts).length > 0 && !args.overwrite) {
    console.error('Promotion aborted: conflicts detected. Use --overwrite to force.');
    process.exit(1);
  }

  const merged = applyPromotion(targetConfig, result);
  const output = exportConfig(merged, args.format);
  const dest = args.output ?? args.target;
  fs.writeFileSync(dest, output, 'utf8');
  console.log(`Written to ${dest}`);
}
