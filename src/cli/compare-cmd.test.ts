import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parseCompareArgs, runCompareCmd } from './compare-cmd';

function writeTmp(dir: string, name: string, content: string): string {
  const p = path.join(dir, name);
  fs.writeFileSync(p, content);
  return p;
}

describe('parseCompareArgs', () => {
  it('parses two positional file paths', () => {
    const args = parseCompareArgs(['fileA.env', 'fileB.env']);
    expect(args.fileA).toContain('fileA.env');
    expect(args.fileB).toContain('fileB.env');
  });

  it('defaults mode to strict', () => {
    const args = parseCompareArgs(['a.env', 'b.env']);
    expect(args.mode).toBe('strict');
  });

  it('parses --mode flag', () => {
    const args = parseCompareArgs(['a.env', 'b.env', '--mode', 'loose']);
    expect(args.mode).toBe('loose');
  });

  it('parses --json flag', () => {
    const args = parseCompareArgs(['a.env', 'b.env', '--json']);
    expect(args.json).toBe(true);
  });

  it('parses custom labels', () => {
    const args = parseCompareArgs(['a.env', 'b.env', '--label-a', 'staging', '--label-b', 'prod']);
    expect(args.labelA).toBe('staging');
    expect(args.labelB).toBe('prod');
  });

  it('throws if fewer than two files given', () => {
    expect(() => parseCompareArgs(['only-one.env'])).toThrow();
  });
});

describe('runCompareCmd', () => {
  let tmpDir: string;
  let writeSpy: jest.SpyInstance;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-cmd-'));
    writeSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    process.exitCode = 0;
  });

  afterEach(() => {
    writeSpy.mockRestore();
    fs.rmSync(tmpDir, { recursive: true });
    process.exitCode = 0;
  });

  it('outputs formatted result for differing configs', () => {
    const a = writeTmp(tmpDir, 'a.env', 'HOST=localhost\nPORT=3000\n');
    const b = writeTmp(tmpDir, 'b.env', 'HOST=prod.example.com\nPORT=3000\n');
    runCompareCmd({ fileA: a, fileB: b, mode: 'strict', labelA: 'A', labelB: 'B', json: false });
    const out = (writeSpy.mock.calls[0][0] as string);
    expect(out).toContain('HOST');
    expect(process.exitCode).toBe(1);
  });

  it('outputs JSON when --json flag set', () => {
    const a = writeTmp(tmpDir, 'a.env', 'KEY=val\n');
    const b = writeTmp(tmpDir, 'b.env', 'KEY=val\n');
    runCompareCmd({ fileA: a, fileB: b, mode: 'strict', labelA: 'A', labelB: 'B', json: true });
    const out = (writeSpy.mock.calls[0][0] as string);
    const parsed = JSON.parse(out);
    expect(parsed).toHaveProperty('score', 100);
  });

  it('sets exitCode 0 for identical configs', () => {
    const a = writeTmp(tmpDir, 'a.env', 'KEY=same\n');
    const b = writeTmp(tmpDir, 'b.env', 'KEY=same\n');
    runCompareCmd({ fileA: a, fileB: b, mode: 'strict', labelA: 'A', labelB: 'B', json: false });
    expect(process.exitCode).toBe(0);
  });
});
