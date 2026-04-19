import { resolveBothStacks } from '../config/resolver';
import { diffConfigs } from '../config/diff';
import { printDiff, summarize } from '../output/index';
import { ParsedArgs } from './args';

export interface ResolveCmdOptions {
  defaultsPath?: string;
  strict?: boolean;
  summaryOnly?: boolean;
}

export async function runResolveCmd(
  args: ParsedArgs,
  options: ResolveCmdOptions = {}
): Promise<void> {
  const { staging: stagingPath, production: productionPath } = args;

  if (!stagingPath || !productionPath) {
    throw new Error('Both --staging and --production paths are required.');
  }

  const { staging, production } = await resolveBothStacks(
    stagingPath,
    productionPath,
    { defaultsPath: options.defaultsPath, strict: options.strict }
  );

  const diffs = diffConfigs(staging.config, production.config);

  if (options.summaryOnly) {
    console.log(summarize(diffs));
  } else {
    console.log(`Comparing ${staging.sourcePath} <-> ${production.sourcePath}`);
    printDiff(diffs);
    console.log(summarize(diffs));
  }
}
