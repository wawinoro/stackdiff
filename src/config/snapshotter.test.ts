import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  createSnapshot,
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
  diffSnapshots,
} from './snapshotter';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'stackdiff-snap-'));
}

describe('createSnapshot', () => {
  it('creates a snapshot with label and timestamp', () => {
    const snap = createSnapshot({ FOO: 'bar' }, 'staging');
    expect(snap.label).toBe('staging');
    expect(snap.config).toEqual({ FOO: 'bar' });
    expect(snap.timestamp).toMatch(/^\d{4}-/);
  });
});

describe('saveSnapshot / loadSnapshot', () => {
  it('round-trips a snapshot to disk', () => {
    const dir = makeTmpDir();
    const snap = createSnapshot({ DB_HOST: 'localhost' }, 'prod');
    const filepath = saveSnapshot(snap, dir);
    expect(fs.existsSync(filepath)).toBe(true);
    const loaded = loadSnapshot(filepath);
    expect(loaded.label).toBe('prod');
    expect(loaded.config).toEqual({ DB_HOST: 'localhost' });
  });

  it('throws on invalid snapshot file', () => {
    const dir = makeTmpDir();
    const bad = path.join(dir, 'bad.json');
    fs.writeFileSync(bad, JSON.stringify({ foo: 1 }));
    expect(() => loadSnapshot(bad)).toThrow('Invalid snapshot file');
  });
});

describe('listSnapshots', () => {
  it('returns empty array for missing dir', () => {
    expect(listSnapshots('/nonexistent/path')).toEqual([]);
  });

  it('lists saved snapshots sorted', () => {
    const dir = makeTmpDir();
    saveSnapshot(createSnapshot({ A: '1' }, 'snap-a'), dir);
    saveSnapshot(createSnapshot({ B: '2' }, 'snap-b'), dir);
    const list = listSnapshots(dir);
    expect(list.length).toBe(2);
  });
});

describe('diffSnapshots', () => {
  it('detects added, removed, and changed keys', () => {
    const a = createSnapshot({ FOO: 'old', BAR: 'same', GONE: 'bye' }, 'a');
    const b = createSnapshot({ FOO: 'new', BAR: 'same', NEW: 'hi' }, 'b');
    const result = diffSnapshots(a, b);
    expect(result.changed).toEqual({ FOO: ['old', 'new'] });
    expect(result.added).toEqual({ NEW: 'hi' });
    expect(result.removed).toEqual({ GONE: 'bye' });
  });
});
