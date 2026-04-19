import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { resolveStack, resolveBothStacks } from './resolver';

function writeTmp(name: string, content: string): string {
  const filePath = path.join(os.tmpdir(), name);
  fs.writeFileSync(filePath, content);
  return filePath;
}

describe('resolveStack', () => {
  it('loads and returns a resolved stack', async () => {
    const p = writeTmp('staging.env', 'APP_ENV=staging\nPORT=3000\n');
    const result = await resolveStack(p, 'staging');
    expect(result.name).toBe('staging');
    expect(result.config['APP_ENV']).toBe('staging');
    expect(result.sourcePath).toBe(path.resolve(p));
  });

  it('merges defaults when defaultsPath is provided', async () => {
    const defaults = writeTmp('defaults.env', 'LOG_LEVEL=info\nPORT=8080\n');
    const staging = writeTmp('staging2.env', 'APP_ENV=staging\nPORT=3000\n');
    const result = await resolveStack(staging, 'staging', { defaultsPath: defaults });
    expect(result.config['LOG_LEVEL']).toBe('info');
    expect(result.config['PORT']).toBe('3000');
  });

  it('throws in strict mode when config is invalid', async () => {
    const p = writeTmp('bad.env', '');
    await expect(
      resolveStack(p, 'staging', { strict: true })
    ).rejects.toThrow();
  });
});

describe('resolveBothStacks', () => {
  it('resolves staging and production concurrently', async () => {
    const s = writeTmp('s.env', 'APP_ENV=staging\n');
    const p = writeTmp('p.env', 'APP_ENV=production\n');
    const { staging, production } = await resolveBothStacks(s, p);
    expect(staging.name).toBe('staging');
    expect(production.name).toBe('production');
    expect(staging.config['APP_ENV']).toBe('staging');
    expect(production.config['APP_ENV']).toBe('production');
  });
});
