import { Config } from './loader';

export type PatchOperation =
  | { op: 'set'; key: string; value: string }
  | { op: 'delete'; key: string }
  | { op: 'rename'; key: string; newKey: string };

export interface PatchResult {
  config: Config;
  applied: PatchOperation[];
  skipped: PatchOperation[];
}

export function applyPatch(
  config: Config,
  operations: PatchOperation[]
): PatchResult {
  const result: Config = { ...config };
  const applied: PatchOperation[] = [];
  const skipped: PatchOperation[] = [];

  for (const op of operations) {
    if (op.op === 'set') {
      result[op.key] = op.value;
      applied.push(op);
    } else if (op.op === 'delete') {
      if (op.key in result) {
        delete result[op.key];
        applied.push(op);
      } else {
        skipped.push(op);
      }
    } else if (op.op === 'rename') {
      if (op.key in result) {
        result[op.newKey] = result[op.key];
        delete result[op.key];
        applied.push(op);
      } else {
        skipped.push(op);
      }
    }
  }

  return { config: result, applied, skipped };
}

export function parsePatchOperations(raw: string[]): PatchOperation[] {
  return raw.map((entry) => {
    if (entry.startsWith('~')) {
      const key = entry.slice(1);
      return { op: 'delete', key };
    }
    if (entry.includes('->')) {
      const [key, newKey] = entry.split('->').map((s) => s.trim());
      return { op: 'rename', key, newKey };
    }
    const eqIdx = entry.indexOf('=');
    if (eqIdx === -1) throw new Error(`Invalid patch operation: "${entry}"`);
    const key = entry.slice(0, eqIdx).trim();
    const value = entry.slice(eqIdx + 1).trim();
    return { op: 'set', key, value };
  });
}
