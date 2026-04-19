import { loadConfig } from '../config/loader';
import { sortConfig, SortOrder } from '../config/sorter';
import { printDiff } from '../output/index';

export interface SortCmdOptions {
  file: string;
  order?: SortOrder;
  priorityKeys?: string[];
  output?: 'json' | 'env';
}

/**
 * CLI command handler: load a config file, sort its keys, and print the result.
 */
export async function runSortCmd(options: SortCmdOptions): Promise<void> {
  const { file, order = 'asc', priorityKeys = [], output = 'env' } = options;

  const config = await loadConfig(file);
  const sorted = sortConfig(config, { order, priorityKeys });

  if (output === 'json') {
    process.stdout.write(JSON.stringify(sorted, null, 2) + '\n');
    return;
  }

  // env format
  for (const [key, value] of Object.entries(sorted)) {
    process.stdout.write(`${key}=${value}\n`);
  }
}

/**
 * Parse sort-specific CLI flags from raw argv.
 */
export function parseSortArgs(argv: string[]): SortCmdOptions {
  const file = argv[0];
  if (!file) throw new Error('Usage: stackdiff sort <file> [--order asc|desc|none] [--priority KEY,...] [--output json|env]');

  let order: SortOrder = 'asc';
  let priorityKeys: string[] = [];
  let output: 'json' | 'env' = 'env';

  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === '--order' && argv[i + 1]) {
      order = argv[++i] as SortOrder;
    } else if (argv[i] === '--priority' && argv[i + 1]) {
      priorityKeys = argv[++i].split(',').map((k) => k.trim());
    } else if (argv[i] === '--output' && argv[i + 1]) {
      output = argv[++i] as 'json' | 'env';
    }
  }

  return { file, order, priorityKeys, output };
}
