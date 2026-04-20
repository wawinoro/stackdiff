import * as path from 'path';
import { loadConfig } from '../config/loader';
import {
  createSnapshot,
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
  diffSnapshots,
} from '../config/snapshotter';

export interface SnapshotArgs {
  subcommand: 'save' | 'list' | 'diff';
  file?: string;
  label?: string;
  dir: string;
  snapshotA?: string;
  snapshotB?: string;
}

export function parseSnapshotArgs(argv: string[]): SnapshotArgs {
  const [subcommand, ...rest] = argv;
  if (!['save', 'list', 'diff'].includes(subcommand)) {
    throw new Error(`Unknown snapshot subcommand: ${subcommand}`);
  }
  const args: SnapshotArgs = { subcommand: subcommand as SnapshotArgs['subcommand'], dir: '.snapshots' };
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--file' || rest[i] === '-f') args.file = rest[++i];
    else if (rest[i] === '--label' || rest[i] === '-l') args.label = rest[++i];
    else if (rest[i] === '--dir' || rest[i] === '-d') args.dir = rest[++i];
    else if (rest[i] === '--a') args.snapshotA = rest[++i];
    else if (rest[i] === '--b') args.snapshotB = rest[++i];
  }
  return args;
}

export function runSnapshotCmd(args: SnapshotArgs): void {
  if (args.subcommand === 'save') {
    if (!args.file) throw new Error('--file is required for save');
    const label = args.label ?? path.basename(args.file, path.extname(args.file));
    const config = loadConfig(args.file);
    const snap = createSnapshot(config, label);
    const saved = saveSnapshot(snap, args.dir);
    console.log(`Snapshot saved: ${saved}`);
  } else if (args.subcommand === 'list') {
    const snaps = listSnapshots(args.dir);
    if (snaps.length === 0) {
      console.log('No snapshots found.');
    } else {
      snaps.forEach((s) => console.log(s));
    }
  } else if (args.subcommand === 'diff') {
    if (!args.snapshotA || !args.snapshotB) throw new Error('--a and --b are required for diff');
    const a = loadSnapshot(args.snapshotA);
    const b = loadSnapshot(args.snapshotB);
    const result = diffSnapshots(a, b);
    console.log('Added:', result.added);
    console.log('Removed:', result.removed);
    console.log('Changed:', result.changed);
  }
}
