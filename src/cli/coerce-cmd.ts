/**
 * coerce-cmd.ts — CLI command to coerce config values to target types
 */

import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../config/loader';
import { coerceConfig, formatCoerceResult, CoerceRule, CoerceType } from '../config/typecoercer';

export interface CoerceArgs {
  input: string;
  rules: CoerceRule[];
  output?: string;
  format: 'env' | 'json';
  quiet: boolean;
}

export function parseCoerceArgs(argv: string[]): CoerceArgs {
  const args: CoerceArgs = {
    input: '',
    rules: [],
    format: 'env',
    quiet: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--input' || arg === '-i') {
      args.input = argv[++i];
    } else if (arg === '--output' || arg === '-o') {
      args.output = argv[++i];
    } else if (arg === '--format' || arg === '-f') {
      args.format = argv[++i] as 'env' | 'json';
    } else if (arg === '--quiet' || arg === '-q') {
      args.quiet = true;
    } else if (arg === '--rule' || arg === '-r') {
      // format: KEY:type e.g. PORT:number
      const pair = argv[++i];
      const colonIdx = pair.indexOf(':');
      if (colonIdx === -1) throw new Error(`Invalid rule format: "${pair}". Expected KEY:type`);
      const key = pair.slice(0, colonIdx);
      const type = pair.slice(colonIdx + 1) as CoerceType;
      args.rules.push({ key, type });
    }
  }

  if (!args.input) throw new Error('--input is required');
  return args;
}

export async function runCoerceCmd(argv: string[]): Promise<void> {
  const args = parseCoerceArgs(argv);
  const config = loadConfig(args.input);
  const stringConfig = Object.fromEntries(
    Object.entries(config).map(([k, v]) => [k, String(v)])
  );

  const result = coerceConfig(stringConfig, args.rules);

  if (!args.quiet) {
    console.log(formatCoerceResult(result));
  }

  if (result.errors.length > 0) {
    process.exitCode = 1;
    return;
  }

  if (args.output) {
    const dir = path.dirname(args.output);
    if (dir && dir !== '.') fs.mkdirSync(dir, { recursive: true });

    let content: string;
    if (args.format === 'json') {
      content = JSON.stringify(result.coerced, null, 2);
    } else {
      content = Object.entries(result.coerced)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join('\n');
    }
    fs.writeFileSync(args.output, content + '\n', 'utf8');
  }
}
