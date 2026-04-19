import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../config/loader';
import { exportConfig, ExportFormat } from '../config/exporter';

export interface ExportArgs {
  input: string;
  format: ExportFormat;
  output?: string;
}

export function parseExportArgs(argv: string[]): ExportArgs {
  const args: ExportArgs = { input: '', format: 'env' };
  for (let i = 0; i < argv.length; i++) {
    if ((argv[i] === '--input' || argv[i] === '-i') && argv[i + 1]) {
      args.input = argv[++i];
    } else if ((argv[i] === '--format' || argv[i] === '-f') && argv[i + 1]) {
      args.format = argv[++i] as ExportFormat;
    } else if ((argv[i] === '--output' || argv[i] === '-o') && argv[i + 1]) {
      args.output = argv[++i];
    }
  }
  if (!args.input) throw new Error('--input is required');
  return args;
}

export async function runExportCmd(argv: string[]): Promise<void> {
  const args = parseExportArgs(argv);
  const config = loadConfig(args.input);
  const result = exportConfig(config, args.format);

  if (args.output) {
    fs.mkdirSync(path.dirname(args.output), { recursive: true });
    fs.writeFileSync(args.output, result, 'utf-8');
    console.log(`Exported to ${args.output}`);
  } else {
    process.stdout.write(result + '\n');
  }
}
