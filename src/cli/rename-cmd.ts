/**
 * rename-cmd.ts — CLI handler for the `rename` subcommand
 */
import * as path from 'path';
import * as fs from 'fs';
import { loadConfig } from '../config/loader';
import { parseRenameMap, renameKeys } from '../config/renamer';
import { exportConfig } from '../config/exporter';

export interface RenameArgs {
  inputFile: string;
  pairs: string[];
  outputFile?: string;
  format: 'env' | 'json' | 'yaml';
  strict: boolean;
}

export function parseRenameArgs(argv: string[]): RenameArgs {
  const args: RenameArgs = { inputFile: '', pairs: [], format: 'env', strict: false };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--input':  args.inputFile  = argv[++i]; break;
      case '--output': args.outputFile = argv[++i]; break;
      case '--format': args.format = argv[++i] as RenameArgs['format']; break;
      case '--strict': args.strict = true; break;
      case '--rename': args.pairs.push(argv[++i]); break;
    }
  }
  if (!args.inputFile) throw new Error('--input <file> is required');
  if (args.pairs.length === 0) throw new Error('At least one --rename OLD=NEW is required');
  return args;
}

export async function runRenameCmd(argv: string[]): Promise<void> {
  const args = parseRenameArgs(argv);
  const config = await loadConfig(args.inputFile);
  const renameMap = parseRenameMap(args.pairs);
  const { config: renamed, renamed: applied, notFound } = renameKeys(config, renameMap);

  if (args.strict && notFound.length > 0) {
    console.error(`Error: keys not found in config: ${notFound.join(', ')}`);
    process.exit(1);
  }

  if (notFound.length > 0) {
    console.warn(`Warning: keys not found: ${notFound.join(', ')}`);
  }

  applied.forEach(r => console.log(`  renamed: ${r}`));

  const output = exportConfig(renamed, args.format);

  if (args.outputFile) {
    fs.mkdirSync(path.dirname(args.outputFile), { recursive: true });
    fs.writeFileSync(args.outputFile, output, 'utf8');
    console.log(`Written to ${args.outputFile}`);
  } else {
    process.stdout.write(output);
  }
}
