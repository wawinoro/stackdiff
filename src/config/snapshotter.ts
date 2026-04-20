import * as fs from 'fs';
import * as path from 'path';
import { ConfigMap } from './loader';

export interface Snapshot {
  timestamp: string;
  label: string;
  config: ConfigMap;
}

export function createSnapshot(config: ConfigMap, label: string): Snapshot {
  return {
    timestamp: new Date().toISOString(),
    label,
    config,
  };
}

export function saveSnapshot(snapshot: Snapshot, dir: string): string {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filename = `${snapshot.label}-${snapshot.timestamp.replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), 'utf-8');
  return filepath;
}

export function loadSnapshot(filepath: string): Snapshot {
  const raw = fs.readFileSync(filepath, 'utf-8');
  const parsed = JSON.parse(raw);
  if (!parsed.timestamp || !parsed.label || !parsed.config) {
    throw new Error(`Invalid snapshot file: ${filepath}`);
  }
  return parsed as Snapshot;
}

export function listSnapshots(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(dir, f))
    .sort();
}

export function diffSnapshots(
  a: Snapshot,
  b: Snapshot
): { added: ConfigMap; removed: ConfigMap; changed: Record<string, [string, string]> } {
  const added: ConfigMap = {};
  const removed: ConfigMap = {};
  const changed: Record<string, [string, string]> = {};

  for (const key of Object.keys(b.config)) {
    if (!(key in a.config)) {
      added[key] = b.config[key];
    } else if (a.config[key] !== b.config[key]) {
      changed[key] = [a.config[key], b.config[key]];
    }
  }
  for (const key of Object.keys(a.config)) {
    if (!(key in b.config)) {
      removed[key] = a.config[key];
    }
  }
  return { added, removed, changed };
}
