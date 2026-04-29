import { loadConfig } from './loader';
import { diffEnvConfigs } from './differ';

export interface PromoteOptions {
  overwrite?: boolean;
  dryRun?: boolean;
  keys?: string[];
}

export interface PromoteResult {
  promoted: Record<string, string>;
  skipped: Record<string, string>;
  conflicts: Record<string, { from: string; to: string }>;
}

export function promoteConfig(
  source: Record<string, string>,
  target: Record<string, string>,
  opts: PromoteOptions = {}
): PromoteResult {
  const result: PromoteResult = { promoted: {}, skipped: {}, conflicts: {} };
  const keys = opts.keys ?? Object.keys(source);

  for (const key of keys) {
    if (!(key in source)) {
      result.skipped[key] = 'not in source';
      continue;
    }
    const srcVal = source[key];
    const tgtVal = target[key];

    if (tgtVal !== undefined && tgtVal !== srcVal && !opts.overwrite) {
      result.conflicts[key] = { from: srcVal, to: tgtVal };
      continue;
    }

    result.promoted[key] = srcVal;
  }

  return result;
}

export function applyPromotion(
  target: Record<string, string>,
  result: PromoteResult
): Record<string, string> {
  return { ...target, ...result.promoted };
}

export function formatPromoteResult(result: PromoteResult): string {
  const lines: string[] = [];
  const promoted = Object.keys(result.promoted);
  const conflicts = Object.keys(result.conflicts);
  const skipped = Object.keys(result.skipped);

  lines.push(`Promoted: ${promoted.length} key(s)`);
  for (const k of promoted) lines.push(`  + ${k}=${result.promoted[k]}`);

  if (conflicts.length > 0) {
    lines.push(`Conflicts: ${conflicts.length} key(s) (use --overwrite to force)`);
    for (const k of conflicts)
      lines.push(`  ! ${k}: source=${result.conflicts[k].from} target=${result.conflicts[k].to}`);
  }

  if (skipped.length > 0) {
    lines.push(`Skipped: ${skipped.length} key(s)`);
    for (const k of skipped) lines.push(`  - ${k}`);
  }

  return lines.join('\n');
}
