/**
 * pin-cmd.ts — CLI command for pinning/unpinning config keys.
 */

import { loadConfig } from '../config/loader';
import {
  pinKeys,
  unpinKeys,
  listPinnedKeys,
  formatPinReport,
  PinnedConfig,
} from '../config/pinner';
import * as fs from 'fs';
import * as path from 'path';

export interface PinArgs {
  file: string;
  keys: string[];
  action: 'pin' | 'unpin' | 'list';
  pinFile?: string;
}

export function parsePinArgs(argv: string[]): PinArgs {
  const args = argv.slice(2);
  const action = (args[0] as PinArgs['action']) || 'list';
  const fileIdx = args.indexOf('--file');
  const file = fileIdx !== -1 ? args[fileIdx + 1] : '';
  const pinFileIdx = args.indexOf('--pin-file');
  const pinFile =
    pinFileIdx !== -1 ? args[pinFileIdx + 1] : '.stackdiff-pins.json';
  const keysIdx = args.indexOf('--keys');
  const keys =
    keysIdx !== -1
      ? args
          .slice(keysIdx + 1)
          .filter((a) => !a.startsWith('--'))
          .join('')
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      : [];
  return { file, keys, action, pinFile };
}

function loadPinFile(pinFile: string, source: Record<string, string>): PinnedConfig {
  if (fs.existsSync(pinFile)) {
    const raw = JSON.parse(fs.readFileSync(pinFile, 'utf8'));
    return { pins: raw.pins ?? {}, source };
  }
  return { pins: {}, source };
}

export async function runPinCmd(args: PinArgs): Promise<void> {
  const config = await loadConfig(args.file);
  const pinFilePath = path.resolve(args.pinFile ?? '.stackdiff-pins.json');
  let pinned = loadPinFile(pinFilePath, config);

  if (args.action === 'pin') {
    pinned = pinKeys(config, args.keys);
    fs.writeFileSync(pinFilePath, JSON.stringify({ pins: pinned.pins }, null, 2));
    console.log(`Pinned ${args.keys.length} key(s).`);
  } else if (args.action === 'unpin') {
    pinned = unpinKeys(pinned, args.keys);
    fs.writeFileSync(pinFilePath, JSON.stringify({ pins: pinned.pins }, null, 2));
    console.log(`Unpinned ${args.keys.length} key(s).`);
  } else {
    const keys = listPinnedKeys(pinned);
    console.log(formatPinReport({ pins: pinned.pins, source: config }));
  }
}
