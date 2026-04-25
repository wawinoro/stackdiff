import { loadConfig } from '../config/loader';
import { encodeConfig, decodeConfig, EncodingFormat } from '../config/encoder';
import { exportConfig } from '../config/exporter';
import * as path from 'path';
import * as fs from 'fs';

export interface EncodeArgs {
  input: string;
  output?: string;
  keys?: string[];
  format: EncodingFormat;
  decode: boolean;
}

export function parseEncodeArgs(argv: string[]): EncodeArgs {
  const args: EncodeArgs = { input: '', format: 'base64', decode: false };

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--input':
      case '-i':
        args.input = argv[++i];
        break;
      case '--output':
      case '-o':
        args.output = argv[++i];
        break;
      case '--keys':
      case '-k':
        args.keys = argv[++i].split(',').map(k => k.trim());
        break;
      case '--format':
      case '-f':
        args.format = argv[++i] as EncodingFormat;
        break;
      case '--decode':
      case '-d':
        args.decode = true;
        break;
    }
  }

  if (!args.input) throw new Error('--input is required');
  return args;
}

export async function runEncodeCmd(argv: string[]): Promise<void> {
  const args = parseEncodeArgs(argv);
  const config = loadConfig(args.input);

  const result = args.decode
    ? decodeConfig(config, { keys: args.keys, format: args.format })
    : encodeConfig(config, { keys: args.keys, format: args.format }).config;

  const ext = args.output ? path.extname(args.output).slice(1) : 'env';
  const outFormat = (['json', 'yaml', 'env'].includes(ext) ? ext : 'env') as 'json' | 'yaml' | 'env';
  const output = exportConfig(result, outFormat);

  if (args.output) {
    fs.mkdirSync(path.dirname(args.output), { recursive: true });
    fs.writeFileSync(args.output, output, 'utf8');
    console.log(`Written to ${args.output}`);
  } else {
    process.stdout.write(output + '\n');
  }
}
