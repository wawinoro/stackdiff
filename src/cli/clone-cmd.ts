import { Command } from 'commander';
import { cloneConfigFile, formatCloneResult } from '../config/cloner';

export interface CloneArgs {
  source: string;
  destination: string;
  override: string[];
  exclude: string[];
  format: 'env' | 'json' | 'yaml';
  quiet: boolean;
}

export function parseCloneArgs(argv: string[]): CloneArgs {
  const program = new Command();
  program
    .name('stackdiff clone')
    .description('Clone a config file to a new destination with optional overrides')
    .argument('<source>', 'source config file')
    .argument('<destination>', 'destination file path')
    .option(
      '-o, --override <key=value...>',
      'override key=value pairs in the clone',
      (val: string, prev: string[]) => [...prev, val],
      [] as string[]
    )
    .option(
      '-e, --exclude <key...>',
      'keys to exclude from the clone',
      (val: string, prev: string[]) => [...prev, val],
      [] as string[]
    )
    .option('-f, --format <fmt>', 'output format: env, json, yaml', 'env')
    .option('-q, --quiet', 'suppress output', false)
    .exitOverride()
    .parse(['node', 'clone-cmd', ...argv]);

  const opts = program.opts();
  const [source, destination] = program.args;
  return {
    source,
    destination,
    override: opts.override ?? [],
    exclude: opts.exclude ?? [],
    format: opts.format as 'env' | 'json' | 'yaml',
    quiet: opts.quiet,
  };
}

function parseOverridePairs(pairs: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) throw new Error(`Invalid override format (expected key=value): ${pair}`);
    result[pair.slice(0, idx)] = pair.slice(idx + 1);
  }
  return result;
}

export async function runCloneCmd(argv: string[]): Promise<void> {
  const args = parseCloneArgs(argv);
  const overrides = parseOverridePairs(args.override);

  const result = await cloneConfigFile(args.source, args.destination, {
    overrides,
    exclude: args.exclude,
    format: args.format,
  });

  if (!args.quiet) {
    console.log(formatCloneResult(result));
  }
}
