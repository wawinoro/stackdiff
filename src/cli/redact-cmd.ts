import { loadConfig } from '../config/loader';
import { redactConfig, listRedactedKeys, RedactOptions } from '../config/redactor';
import { exportConfig } from '../config/exporter';

export interface RedactArgs {
  input: string;
  format: 'env' | 'json' | 'yaml';
  placeholder?: string;
  partial?: boolean;
  extraKeys?: string[];
  listOnly?: boolean;
}

export function parseRedactArgs(argv: string[]): RedactArgs {
  const args: RedactArgs = { input: '', format: 'env' };

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--input':
      case '-i':
        args.input = argv[++i];
        break;
      case '--format':
      case '-f':
        args.format = argv[++i] as RedactArgs['format'];
        break;
      case '--placeholder':
        args.placeholder = argv[++i];
        break;
      case '--partial':
        args.partial = true;
        break;
      case '--key':
        args.extraKeys = args.extraKeys ?? [];
        args.extraKeys.push(argv[++i]);
        break;
      case '--list':
        args.listOnly = true;
        break;
    }
  }

  if (!args.input) {
    throw new Error('Missing required argument: --input');
  }

  return args;
}

export async function runRedactCmd(argv: string[]): Promise<void> {
  const args = parseRedactArgs(argv);
  const config = await loadConfig(args.input);

  const options: RedactOptions = {
    placeholder: args.placeholder,
    partial: args.partial,
    keys: args.extraKeys,
  };

  if (args.listOnly) {
    const keys = listRedactedKeys(config, options);
    console.log('Keys to be redacted:');
    keys.forEach((k) => console.log(`  - ${k}`));
    return;
  }

  const redacted = redactConfig(config, options);
  const output = exportConfig(redacted, args.format);
  process.stdout.write(output);
}
