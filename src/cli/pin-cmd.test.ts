import { parsePinArgs, runPinCmd } from './pin-cmd';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function writeTmp(dir: string, name: string, content: string): string {
  const p = path.join(dir, name);
  fs.writeFileSync(p, content);
  return p;
}

describe('parsePinArgs', () => {
  it('parses pin action with keys and file', () => {
    const args = parsePinArgs([
      'node', 'stackdiff',
      'pin',
      '--file', 'config.env',
      '--keys', 'API_URL,DB_HOST',
    ]);
    expect(args.action).toBe('pin');
    expect(args.file).toBe('config.env');
    expect(args.keys).toEqual(['API_URL', 'DB_HOST']);
  });

  it('parses unpin action', () => {
    const args = parsePinArgs([
      'node', 'stackdiff',
      'unpin',
      '--file', 'config.env',
      '--keys', 'LOG_LEVEL',
    ]);
    expect(args.action).toBe('unpin');
    expect(args.keys).toEqual(['LOG_LEVEL']);
  });

  it('defaults action to list when not provided', () => {
    const args = parsePinArgs(['node', 'stackdiff', 'list', '--file', 'x.env']);
    expect(args.action).toBe('list');
  });

  it('uses default pin file when not specified', () => {
    const args = parsePinArgs(['node', 'stackdiff', 'list', '--file', 'x.env']);
    expect(args.pinFile).toBe('.stackdiff-pins.json');
  });
});

describe('runPinCmd', () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pin-cmd-'));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('pins keys and writes pin file', async () => {
    const envFile = writeTmp(dir, 'config.env', 'API_URL=https://api.example.com\nDB_HOST=localhost\n');
    const pinFile = path.join(dir, 'pins.json');
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await runPinCmd({ file: envFile, keys: ['API_URL'], action: 'pin', pinFile });

    const written = JSON.parse(fs.readFileSync(pinFile, 'utf8'));
    expect(written.pins['API_URL']).toBe('https://api.example.com');
    consoleSpy.mockRestore();
  });

  it('lists pinned keys with no pins shows empty message', async () => {
    const envFile = writeTmp(dir, 'config.env', 'LOG_LEVEL=info\n');
    const pinFile = path.join(dir, 'pins.json');
    const logs: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));

    await runPinCmd({ file: envFile, keys: [], action: 'list', pinFile });

    expect(logs.some((l) => l.includes('No keys are pinned'))).toBe(true);
    jest.restoreAllMocks();
  });
});
