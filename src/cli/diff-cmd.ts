import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../config/loader';
import { diffEnvConfigs, formatDiffResult } from '../config/differ';

export interface DiffCmdArgs {
  left: string;
  right: string;
  includeUnchanged: boolean;
  output?: string;
  json: boolean;
}

export function parseDiffArgs(argv: string[]): DiffCmdArgs {
  const args: DiffCmdArgs = {
    left: '',
    right: '',
    includeUnchanged: false,
    json: false,
  };

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--left':
      case '-l':
        args.left = argv[++i];
        break;
      case '--right':
      case '-r':
        args.right = argv[++i];
        break;
      case '--include-unchanged':
        args.includeUnchanged = true;
        break;
      case '--output':
      case '-o':
        args.output = argv[++i];
        break;
      case '--json':
        args.json = true;
        break;
    }
  }

  if (!args.left || !args.right) {
    throw new Error('--left and --right config paths are required');
  }

  return args;
}

export async function runDiffCmd(argv: string[]): Promise<void> {
  const args = parseDiffArgs(argv);

  const leftConfig = await loadConfig(args.left);
  const rightConfig = await loadConfig(args.right);

  const result = diffEnvConfigs(
    leftConfig as Record<string, string>,
    rightConfig as Record<string, string>,
    args.includeUnchanged
  );

  const output = args.json
    ? JSON.stringify(result, null, 2)
    : formatDiffResult(result);

  if (args.output) {
    fs.mkdirSync(path.dirname(path.resolve(args.output)), { recursive: true });
    fs.writeFileSync(args.output, output, 'utf-8');
    console.log(`Diff written to ${args.output}`);
  } else {
    console.log(output);
  }
}
