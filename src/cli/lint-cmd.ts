import { parseArgs } from 'node:util';
import { loadConfig } from '../config/loader';
import { lintConfig, formatLintResult } from '../config/linter';

/**
 * Parsed arguments for the lint command.
 */
export interface LintArgs {
  file: string;
  format: 'text' | 'json';
  strict: boolean;
  failOnWarn: boolean;
}

/**
 * Parse CLI arguments for the `lint` subcommand.
 *
 * Usage:
 *   stackdiff lint <file> [--format text|json] [--strict] [--fail-on-warn]
 */
export function parseLintArgs(argv: string[]): LintArgs {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      format: { type: 'string', short: 'f', default: 'text' },
      strict: { type: 'boolean', default: false },
      'fail-on-warn': { type: 'boolean', default: false },
    },
    allowPositionals: true,
    strict: false,
  });

  if (positionals.length === 0) {
    throw new Error('lint command requires a <file> argument');
  }

  const format = (values['format'] as string) ?? 'text';
  if (format !== 'text' && format !== 'json') {
    throw new Error(`Invalid --format value "${format}". Expected "text" or "json".`);
  }

  return {
    file: positionals[0],
    format,
    strict: Boolean(values['strict']),
    failOnWarn: Boolean(values['fail-on-warn']),
  };
}

/**
 * Execute the lint command: load a config file, run all lint checks,
 * print the report, and exit with a non-zero code on errors (or warnings
 * when --fail-on-warn is set).
 */
export async function runLintCmd(argv: string[]): Promise<void> {
  const args = parseLintArgs(argv);

  let config: Record<string, string>;
  try {
    config = await loadConfig(args.file);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error loading config file "${args.file}": ${message}`);
    process.exit(1);
  }

  const result = lintConfig(config, { strict: args.strict });

  if (args.format === 'json') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const report = formatLintResult(result);
    console.log(report);
  }

  const hasErrors = result.errors.length > 0;
  const hasWarnings = result.warnings.length > 0;

  if (hasErrors || (args.failOnWarn && hasWarnings)) {
    process.exit(1);
  }
}
