import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parseSanitizeArgs, runSanitizeCmd } from './sanitize-cmd';

function writeTmp(name: string, content: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stackdiff-'));
  const file = path.join(dir, name);
  fs.writeFileSync(file, content, 'utf-8');
  return file;
}

describe('parseSanitizeArgs', () => {
  it('parses --input flag', () => {
    const args = parseSanitizeArgs(['--input', 'prod.env']);
    expect(args.input).toBe('prod.env');
  });

  it('parses positional input', () => {
    const args = parseSanitizeArgs(['prod.env']);
    expect(args.input).toBe('prod.env');
  });

  it('parses --format flag', () => {
    const args = parseSanitizeArgs(['--input', 'f.env', '--format', 'json']);
    expect(args.format).toBe('json');
  });

  it('parses --no-trim', () => {
    const args = parseSanitizeArgs(['--input', 'f.env', '--no-trim']);
    expect(args.trimWhitespace).toBe(false);
  });

  it('parses --keep-nullish', () => {
    const args = parseSanitizeArgs(['--input', 'f.env', '--keep-nullish']);
    expect(args.removeNullish).toBe(false);
  });

  it('parses --verbose flag', () => {
    const args = parseSanitizeArgs(['-i', 'f.env', '-v']);
    expect(args.verbose).toBe(true);
  });

  it('throws when input is missing', () => {
    expect(() => parseSanitizeArgs([])).toThrow('Missing required argument');
  });
});

describe('runSanitizeCmd', () => {
  it('sanitizes and writes to output file', async () => {
    const input = writeTmp('test.env', 'APP_NAME=  myapp  \nDEBUG=null\nPORT=3000\n');
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stackdiff-out-'));
    const output = path.join(outDir, 'sanitized.env');

    await runSanitizeCmd(['--input', input, '--output', output]);

    const content = fs.readFileSync(output, 'utf-8');
    expect(content).toContain('APP_NAME=myapp');
    expect(content).toContain('PORT=3000');
    expect(content).not.toContain('DEBUG');
  });

  it('outputs to stdout when no --output given', async () => {
    const input = writeTmp('test2.env', 'KEY=value\n');
    const writes: string[] = [];
    const orig = process.stdout.write.bind(process.stdout);
    jest.spyOn(process.stdout, 'write').mockImplementation((chunk: any) => {
      writes.push(chunk.toString());
      return true;
    });
    await runSanitizeCmd(['--input', input]);
    expect(writes.join('')).toContain('KEY=value');
    jest.restoreAllMocks();
  });
});
