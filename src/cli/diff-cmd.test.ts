import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parseDiffArgs, runDiffCmd } from './diff-cmd';

function writeTmp(dir: string, name: string, content: string): string {
  const p = path.join(dir, name);
  fs.writeFileSync(p, content, 'utf-8');
  return p;
}

describe('parseDiffArgs', () => {
  it('parses --left and --right', () => {
    const args = parseDiffArgs(['--left', 'a.env', '--right', 'b.env']);
    expect(args.left).toBe('a.env');
    expect(args.right).toBe('b.env');
  });

  it('parses short flags -l and -r', () => {
    const args = parseDiffArgs(['-l', 'x.env', '-r', 'y.env']);
    expect(args.left).toBe('x.env');
    expect(args.right).toBe('y.env');
  });

  it('parses --include-unchanged', () => {
    const args = parseDiffArgs(['-l', 'a', '-r', 'b', '--include-unchanged']);
    expect(args.includeUnchanged).toBe(true);
  });

  it('parses --json flag', () => {
    const args = parseDiffArgs(['-l', 'a', '-r', 'b', '--json']);
    expect(args.json).toBe(true);
  });

  it('parses --output path', () => {
    const args = parseDiffArgs(['-l', 'a', '-r', 'b', '--output', 'out.txt']);
    expect(args.output).toBe('out.txt');
  });

  it('throws if --left is missing', () => {
    expect(() => parseDiffArgs(['--right', 'b.env'])).toThrow();
  });

  it('throws if --right is missing', () => {
    expect(() => parseDiffArgs(['--left', 'a.env'])).toThrow();
  });
});

describe('runDiffCmd', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stackdiff-diff-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('prints diff to stdout', async () => {
    const l = writeTmp(tmpDir, 'left.env', 'HOST=localhost\nPORT=3000\n');
    const r = writeTmp(tmpDir, 'right.env', 'HOST=prod.example.com\nPORT=3000\n');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await runDiffCmd(['-l', l, '-r', r]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('HOST'));
    spy.mockRestore();
  });

  it('writes diff to file when --output is given', async () => {
    const l = writeTmp(tmpDir, 'left.env', 'A=1\n');
    const r = writeTmp(tmpDir, 'right.env', 'A=2\n');
    const outFile = path.join(tmpDir, 'out', 'diff.txt');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await runDiffCmd(['-l', l, '-r', r, '--output', outFile]);
    expect(fs.existsSync(outFile)).toBe(true);
    expect(fs.readFileSync(outFile, 'utf-8')).toContain('~ A');
    spy.mockRestore();
  });

  it('outputs valid JSON when --json is set', async () => {
    const l = writeTmp(tmpDir, 'left.env', 'X=foo\n');
    const r = writeTmp(tmpDir, 'right.env', 'X=bar\n');
    let captured = '';
    const spy = jest.spyOn(console, 'log').mockImplementation((msg) => { captured = msg; });
    await runDiffCmd(['-l', l, '-r', r, '--json']);
    const parsed = JSON.parse(captured);
    expect(parsed).toHaveProperty('entries');
    expect(parsed).toHaveProperty('changed');
    spy.mockRestore();
  });
});
