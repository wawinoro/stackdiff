import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parseCoerceArgs, runCoerceCmd } from './coerce-cmd';

function writeTmp(dir: string, name: string, content: string): string {
  const p = path.join(dir, name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('parseCoerceArgs', () => {
  it('parses required --input', () => {
    const args = parseCoerceArgs(['--input', 'staging.env']);
    expect(args.input).toBe('staging.env');
  });

  it('parses multiple --rule flags', () => {
    const args = parseCoerceArgs([
      '--input', 'a.env',
      '--rule', 'PORT:number',
      '--rule', 'DEBUG:boolean',
    ]);
    expect(args.rules).toHaveLength(2);
    expect(args.rules[0]).toEqual({ key: 'PORT', type: 'number' });
    expect(args.rules[1]).toEqual({ key: 'DEBUG', type: 'boolean' });
  });

  it('parses --output and --format', () => {
    const args = parseCoerceArgs(['--input', 'a.env', '--output', 'out.json', '--format', 'json']);
    expect(args.output).toBe('out.json');
    expect(args.format).toBe('json');
  });

  it('parses --quiet flag', () => {
    const args = parseCoerceArgs(['--input', 'a.env', '-q']);
    expect(args.quiet).toBe(true);
  });

  it('throws if --input missing', () => {
    expect(() => parseCoerceArgs([])).toThrow('--input is required');
  });

  it('throws on malformed rule', () => {
    expect(() => parseCoerceArgs(['--input', 'a.env', '--rule', 'BADFORMAT'])).toThrow('Invalid rule format');
  });
});

describe('runCoerceCmd', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'coerce-cmd-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes coerced json output', async () => {
    const input = writeTmp(tmpDir, 'input.env', 'PORT=3000\nDEBUG=true\nNAME=app\n');
    const output = path.join(tmpDir, 'out.json');
    await runCoerceCmd([
      '--input', input,
      '--output', output,
      '--format', 'json',
      '--rule', 'PORT:number',
      '--rule', 'DEBUG:boolean',
      '--quiet',
    ]);
    const data = JSON.parse(fs.readFileSync(output, 'utf8'));
    expect(data.PORT).toBe(3000);
    expect(data.DEBUG).toBe(true);
    expect(data.NAME).toBe('app');
  });

  it('sets exitCode=1 on coercion errors', async () => {
    const input = writeTmp(tmpDir, 'bad.env', 'SCORE=notanumber\n');
    const prev = process.exitCode;
    await runCoerceCmd(['--input', input, '--rule', 'SCORE:number', '--quiet']);
    expect(process.exitCode).toBe(1);
    process.exitCode = prev;
  });
});
