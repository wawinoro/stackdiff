import { parseSnapshotArgs, runSnapshotCmd } from './snapshot-cmd';
import * as snapshotter from '../config/snapshotter';
import * as loader from '../config/loader';

jest.mock('../config/snapshotter');
jest.mock('../config/loader');

const mockedLoader = loader as jest.Mocked<typeof loader>;
const mockedSnap = snapshotter as jest.Mocked<typeof snapshotter>;

describe('parseSnapshotArgs', () => {
  it('parses save subcommand', () => {
    const args = parseSnapshotArgs(['save', '--file', 'staging.env', '--label', 'staging']);
    expect(args.subcommand).toBe('save');
    expect(args.file).toBe('staging.env');
    expect(args.label).toBe('staging');
  });

  it('parses list subcommand with custom dir', () => {
    const args = parseSnapshotArgs(['list', '--dir', '/tmp/snaps']);
    expect(args.subcommand).toBe('list');
    expect(args.dir).toBe('/tmp/snaps');
  });

  it('parses diff subcommand', () => {
    const args = parseSnapshotArgs(['diff', '--a', 'snap1.json', '--b', 'snap2.json']);
    expect(args.snapshotA).toBe('snap1.json');
    expect(args.snapshotB).toBe('snap2.json');
  });

  it('throws on unknown subcommand', () => {
    expect(() => parseSnapshotArgs(['unknown'])).toThrow('Unknown snapshot subcommand');
  });
});

describe('runSnapshotCmd - save', () => {
  it('saves a snapshot', () => {
    mockedLoader.loadConfig.mockReturnValue({ FOO: 'bar' });
    mockedSnap.createSnapshot.mockReturnValue({ timestamp: 't', label: 'staging', config: { FOO: 'bar' } });
    mockedSnap.saveSnapshot.mockReturnValue('/tmp/snaps/staging-t.json');
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    runSnapshotCmd({ subcommand: 'save', file: 'staging.env', dir: '.snapshots' });
    expect(mockedSnap.saveSnapshot).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Snapshot saved'));
    consoleSpy.mockRestore();
  });

  it('throws if --file missing', () => {
    expect(() => runSnapshotCmd({ subcommand: 'save', dir: '.snapshots' })).toThrow('--file is required');
  });
});

describe('runSnapshotCmd - list', () => {
  it('lists snapshots', () => {
    mockedSnap.listSnapshots.mockReturnValue(['/tmp/a.json', '/tmp/b.json']);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    runSnapshotCmd({ subcommand: 'list', dir: '.snapshots' });
    expect(consoleSpy).toHaveBeenCalledTimes(2);
    consoleSpy.mockRestore();
  });
});
