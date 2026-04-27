import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { loadConfig } from '../config/loader';
import { parseAliasMap, applyAliases, listUnresolvedAliases } from '../config/aliaser';
import { exportConfig } from '../config/exporter';

export interface AliasArgs {
  input: string;
  aliases: string[];
  replace: boolean;
  format: 'env' | 'json' | 'yaml';
  output?: string;
  warnUnresolved: boolean;
}

export function parseAliasArgs(argv: string[]): AliasArgs {
  const args: AliasArgs = {
    input: '',
    aliases: [],
    replace: false,
    format: 'env',
    warnUnresolved: true,
  };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--input':  args.input  = argv[++i]; break;
      case '--alias':  args.aliases.push(argv[++i]); break;
      case '--replace': args.replace = true; break;
      case '--format': args.format = argv[++i] as AliasArgs['format']; break;
      case '--output': args.output = argv[++i]; break;
      case '--no-warn': args.warnUnresolved = false; break;
    }
  }
  if (!args.input) throw new Error('--input is required');
  if (args.aliases.length === 0) throw new Error('At least one --alias is required');
  return args;
}

export async function runAliasCmd(args: AliasArgs): Promise<void> {
  const config = await loadConfig(resolve(args.input));
  const aliasMap = parseAliasMap(args.aliases);

  if (args.warnUnresolved) {
    const unresolved = listUnresolvedAliases(config, aliasMap);
    if (unresolved.length > 0) {
      process.stderr.write(
        `Warning: unresolved aliases: ${unresolved.join(', ')}\n`
      );
    }
  }

  const result = applyAliases(config, aliasMap, args.replace);
  const output = exportConfig(result, args.format);

  if (args.output) {
    writeFileSync(resolve(args.output), output, 'utf8');
  } else {
    process.stdout.write(output + '\n');
  }
}
