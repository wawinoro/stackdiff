import { Command } from 'commander';
import { loadConfig } from '../config/loader';
import { parsePatchOperations, applyPatch } from '../config/patcher';
import { exportConfig } from '../config/exporter';

export interface PatchArgs {
  input: string;
  operations: string[];
  format: 'env' | 'json' | 'yaml';
  output?: string;
  dryRun: boolean;
}

export function parsePatchArgs(argv: string[]): PatchArgs {
  const program = new Command();
  program
    .argument('<input>', 'path to config file')
    .option('-o, --output <path>', 'write result to file instead of stdout')
    .option('-f, --format <fmt>', 'output format: env | json | yaml', 'env')
    .option('--dry-run', 'print summary without writing output', false)
    .argument('[operations...]', 'patch operations: KEY=VAL, ~KEY, OLD->NEW');

  program.parse(['node', 'patch-cmd', ...argv]);
  const [input, ...operations] = program.args;
  const opts = program.opts();

  return {
    input,
    operations,
    format: opts.format as PatchArgs['format'],
    output: opts.output,
    dryRun: opts.dryRun,
  };
}

export async function runPatchCmd(args: PatchArgs): Promise<void> {
  const config = await loadConfig(args.input);
  const ops = parsePatchOperations(args.operations);
  const { config: patched, applied, skipped } = applyPatch(config, ops);

  if (args.dryRun) {
    console.log(`Applied: ${applied.length}, Skipped: ${skipped.length}`);
    applied.forEach((op) => console.log('  ✔', JSON.stringify(op)));
    skipped.forEach((op) => console.log('  ✗', JSON.stringify(op)));
    return;
  }

  const out = exportConfig(patched, args.format);
  if (args.output) {
    const fs = await import('fs/promises');
    await fs.writeFile(args.output, out, 'utf8');
    console.log(`Patched config written to ${args.output}`);
  } else {
    process.stdout.write(out);
  }
}
