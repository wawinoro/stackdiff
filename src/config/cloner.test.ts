import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { cloneConfig, cloneConfigFile, formatCloneResult } from './cloner';

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cloner-test-'));
}

describe('cloneConfig', () => {
  const source = { DB_HOST: 'localhost', DB_PASS: 'secret', APP_ENV: 'staging' };

  it('copies all keys when no options given', () => {
    const result = cloneConfig(source);
    expect(result).toEqual(source);
    expect(result).not.toBe(source);
  });

  it('excludes specified keys', () => {
    const result = cloneConfig(source, { exclude: ['DB_PASS'] });
    expect(result).not.toHaveProperty('DB_PASS');
    expect(result).toHaveProperty('DB_HOST', 'localhost');
  });

  it('applies overrides to existing keys', () => {
    const result = cloneConfig(source, { overrides: { DB_HOST: 'prod-db' } });
    expect(result.DB_HOST).toBe('prod-db');
  });

  it('adds new keys from overrides', () => {
    const result = cloneConfig(source, { overrides: { NEW_KEY: 'new-value' } });
    expect(result).toHaveProperty('NEW_KEY', 'new-value');
  });

  it('does not add overridden key if it is excluded', () => {
    const result = cloneConfig(source, {
      overrides: { DB_PASS: 'override' },
      exclude: ['DB_PASS'],
    });
    expect(result).not.toHaveProperty('DB_PASS');
  });

  it('exclude is case-insensitive', () => {
    const result = cloneConfig(source, { exclude: ['db_pass'] });
    expect(result).not.toHaveProperty('DB_PASS');
  });
});

describe('cloneConfigFile', () => {
  it('writes cloned config to destination', async () => {
    const tmp = makeTmpDir();
    const src = path.join(tmp, 'src.env');
    const dest = path.join(tmp, 'dest', 'out.env');
    fs.writeFileSync(src, 'DB_HOST=localhost\nDB_PASS=secret\n');

    const result = await cloneConfigFile(src, dest, {
      overrides: { DB_HOST: 'prod-db' },
      exclude: ['DB_PASS'],
    });

    expect(fs.existsSync(dest)).toBe(true);
    const content = fs.readFileSync(dest, 'utf-8');
    expect(content).toContain('DB_HOST=prod-db');
    expect(content).not.toContain('DB_PASS');
    expect(result.keysCopied).toBe(1);
    expect(result.keysExcluded).toBe(1);
    expect(result.keysOverridden).toBe(1);
  });
});

describe('formatCloneResult', () => {
  it('formats result summary', () => {
    const report = formatCloneResult({
      source: 'a.env',
      destination: 'b.env',
      keysCopied: 10,
      keysExcluded: 2,
      keysOverridden: 3,
    });
    expect(report).toContain('a.env → b.env');
    expect(report).toContain('10');
    expect(report).toContain('2');
    expect(report).toContain('3');
  });
});
