import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../config/loader';
import { sanitizeConfig, listSanitizedKeys, SanitizeOptions } from '../config/sanitizer';
import { exportConfig } from '../config/exporter';

export interface SanitizeArgs {
  input: string;
  output?: string;
  format: 'env' | 'json' | 'yaml';
  trimWhitespace: boolean;
  removeNullish: boolean;
  collapseEmpty: boolean;
  normalizeLineEndings: boolean;
  verbose: boolean;
}

export function parseSanitizeArgs(argv: string[]): SanitizeArgs {
  const args: SanitizeArgs = {
    input: '',
    format: 'env',
    trimWhitespace: true,
    removeNullish: true,
    collapseEmpty: false,
    normalizeLineEndings: true,
    verbose: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--input' || arg === '-i') args.input = argv[++i];
    else if (arg === '--output' || arg === '-o') args.output = argv[++i];
    else if (arg === '--format' || arg === '-f') args.format = argv[++i] as SanitizeArgs['format'];
    else if (arg === '--no-trim') args.trimWhitespace = false;
    else if (arg === '--keep-nullish') args.removeNullish = false;
    else if (arg === '--collapse-empty') args.collapseEmpty = true;
    else if (arg === '--no-normalize') args.normalizeLineEndings = false;
    else if (arg === '--verbose' || arg === '-v') args.verbose = true;
    else if (!args.input) args.input = arg;
  }

  if (!args.input) throw new Error('Missing required argument: --input');
  return args;
}

export async function runSanitizeCmd(argv: string[]): Promise<void> {
  const args = parseSanitizeArgs(argv);
  const config = await loadConfig(args.input);

  const opts: SanitizeOptions = {
    trimWhitespace: args.trimWhitespace,
    removeNullish: args.removeNullish,
    collapseEmpty: args.collapseEmpty,
    normalizeLineEndings: args.normalizeLineEndings,
  };

  const sanitized = sanitizeConfig(config, opts);

  if (args.verbose) {
    const changed = listSanitizedKeys(config, sanitized);
    if (changed.length > 0) {
      console.error(`Sanitized ${changed.length} key(s): ${changed.join(', ')}`);
    } else {
      console.error('No keys required sanitization.');
    }
  }

  const output = exportConfig(sanitized, args.format);

  if (args.output) {
    fs.mkdirSync(path.dirname(args.output), { recursive: true });
    fs.writeFileSync(args.output, output, 'utf-8');
  } else {
    process.stdout.write(output);
  }
}
