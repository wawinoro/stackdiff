import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parsePromoteArgs, runPromoteCmd } from './promote-cmd';

function writeTmp(dir: string, name: string, content: string): string {
  const p = path.join(dir, name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('parsePromoteArgs', () => {
  it('parses required source and target', () => {
    const args = parsePromoteArgs(['--source', 'a.env', '--target', 'b.env']);
    expect(args.source).toBe('a.env');
    expect(args.target).toBe('b.env');
  });

  it('parses optional flags', () => {
    const args = parsePromoteArgs([
      '--source', 'a.env',
      '--target', 'b.env',
      '--overwrite',
      '--dry-run',
      '--keys', 'A,B',
      '--format', 'json',
    ]);
    expect(args.overwrite).toBe(true);
    expect(args.dryRun).toBe(true);
    expect(args.keys).toEqual(['A', 'B']);
    expect(args.format).toBe('json');
  });

  it('throws if source is missing', () => {
    expect(() => parsePromoteArgs(['--target', 'b.env'])).toThrow('--source is required');
  });

  it('throws if target is missing', () => {
    expect(() => parsePromoteArgs(['--source', 'a.env'])).toThrow('--target is required');
  });
});

describe('runPromoteCmd', () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'promote-'));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('promotes source keys into target file', async () => {
    const src = writeTmp(dir, 'source.env', 'A=1\nB=2\n');
    const tgt = writeTmp(dir, 'target.env', 'A=1\nC=3\n');
    const out = path.join(dir, 'out.env');
    await runPromoteCmd(['--source', src, '--target', tgt, '--output', out]);
    const content = fs.readFileSync(out, 'utf8');
    expect(content).toContain('B=2');
    expect(content).toContain('C=3');
  });

  it('does not write in dry-run mode', async () => {
    const src = writeTmp(dir, 'source.env', 'A=1\n');
    const tgt = writeTmp(dir, 'target.env', 'B=2\n');
    const out = path.join(dir, 'out.env');
    await runPromoteCmd(['--source', src, '--target', tgt, '--output', out, '--dry-run']);
    expect(fs.existsSync(out)).toBe(false);
  });
});
