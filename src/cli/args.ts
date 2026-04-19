import { parseArgs } from 'util';

export interface CliArgs {
  staging: string;
  production: string;
  format: 'text' | 'json';
  onlyDiffs: boolean;
  help: boolean;
}

const USAGE = `
Usage: stackdiff --staging <file> --production <file> [options]

Options:
  --staging    Path to staging config file (required)
  --production Path to production config file (required)
  --format     Output format: text | json (default: text)
  --only-diffs Show only differing keys (default: false)
  --help       Show this help message
`.trim();

export function parseCliArgs(argv: string[] = process.argv.slice(2)): CliArgs {
  const { values } = parseArgs({
    args: argv,
    options: {
      staging:      { type: 'string' },
      production:   { type: 'string' },
      format:       { type: 'string', default: 'text' },
      'only-diffs': { type: 'boolean', default: false },
      help:         { type: 'boolean', default: false },
    },
    strict: true,
  });

  if (values.help) {
    console.log(USAGE);
    process.exit(0);
  }

  if (!values.staging || !values.production) {
    console.error('Error: --staging and --production are required.\n');
    console.error(USAGE);
    process.exit(1);
  }

  const format = values.format === 'json' ? 'json' : 'text';

  return {
    staging:    values.staging as string,
    production: values.production as string,
    format,
    onlyDiffs:  values['only-diffs'] as boolean,
    help:       values.help as boolean,
  };
}
