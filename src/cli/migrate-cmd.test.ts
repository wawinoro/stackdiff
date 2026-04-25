import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parseMigrateArgs, runMigrateCmd } from './migrate-cmd';

function writeTmp(dir: string, name: string, content: string): string {
  const p = path.join(dir, name);
  fs.writeFileSync(p, content, 'utf-8');
  return p;
}

describe('parseMigrateArgs', () => {
  it('parses --input and --output', () => {
    const args = parseMigrateArgs(['--input', 'a.env', '--output', 'b.env']);
    expect(args.input).toBe('a.env');
    expect(args.output).toBe('b.env');
  });

  it('parses --target-version', () => {
    const args = parseMigrateArgs(['--input', 'a.env', '--target-version', '2']);
    expect(args.targetVersion).toBe(2);
  });

  it('parses --dry-run flag', () => {
    const args = parseMigrateArgs(['--input', 'a.env', '--dry-run']);
    expect(args.dryRun).toBe(true);
  });

  it('defaults dryRun to false and format to env', () => {
    const args = parseMigrateArgs(['--input', 'x.env']);
    expect(args.dryRun).toBe(false);
    expect(args.format).toBe('env');
  });

  it('throws when --input is missing', () => {
    expect(() => parseMigrateArgs([])).toThrow('--input is required');
  });
});

describe('runMigrateCmd', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'migrate-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('migrates and writes output file', async () => {
    const input = writeTmp(tmpDir, 'config.env', 'DB_HOST=localhost\nPORT=5432\n');
    const output = path.join(tmpDir, 'migrated.env');
    await runMigrateCmd(['--input', input, '--output', output, '--target-version', '1']);
    const content = fs.readFileSync(output, 'utf-8');
    expect(content).toContain('DATABASE_HOST');
    expect(content).not.toContain('DB_HOST=');
  });

  it('does not write file in dry-run mode', async () => {
    const input = writeTmp(tmpDir, 'config.env', 'DB_HOST=localhost\n');
    const output = path.join(tmpDir, 'out.env');
    await runMigrateCmd(['--input', input, '--output', output, '--dry-run', '--target-version', '1']);
    expect(fs.existsSync(output)).toBe(false);
  });
});
