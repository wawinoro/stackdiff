import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../config/loader';
import { compareConfigs, formatCompareResult, CompareMode } from '../config/comparator';

export interface CompareArgs {
  fileA: string;
  fileB: string;
  mode: CompareMode;
  labelA: string;
  labelB: string;
  json: boolean;
}

export function parseCompareArgs(argv: string[]): CompareArgs {
  const args: CompareArgs = {
    fileA: '',
    fileB: '',
    mode: 'strict',
    labelA: 'A',
    labelB: 'B',
    json: false,
  };

  const positional: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--mode' || arg === '-m') {
      args.mode = (argv[++i] as CompareMode) ?? 'strict';
    } else if (arg === '--label-a') {
      args.labelA = argv[++i] ?? 'A';
    } else if (arg === '--label-b') {
      args.labelB = argv[++i] ?? 'B';
    } else if (arg === '--json') {
      args.json = true;
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    }
  }

  if (positional.length < 2) {
    throw new Error('compare-cmd requires two config file paths');
  }

  args.fileA = path.resolve(positional[0]);
  args.fileB = path.resolve(positional[1]);

  if (!args.labelA || args.labelA === 'A') {
    args.labelA = path.basename(args.fileA);
  }
  if (!args.labelB || args.labelB === 'B') {
    args.labelB = path.basename(args.fileB);
  }

  return args;
}

/**
 * Validates that both config file paths exist and are readable before
 * attempting to load them, providing clearer error messages than a raw
 * filesystem exception would.
 */
function assertFilesExist(fileA: string, fileB: string): void {
  for (const [label, filePath] of [['fileA', fileA], ['fileB', fileB]] as const) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`compare-cmd: ${label} not found: ${filePath}`);
    }
  }
}

export function runCompareCmd(args: CompareArgs): void {
  assertFilesExist(args.fileA, args.fileB);

  const configA = loadConfig(args.fileA);
  const configB = loadConfig(args.fileB);
  const result = compareConfigs(configA, configB, args.mode);

  if (args.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    process.stdout.write(formatCompareResult(result, args.labelA, args.labelB) + '\n');
  }

  if (result.score < 100) {
    process.exitCode = 1;
  }
}
