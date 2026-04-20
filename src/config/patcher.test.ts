import { applyPatch, parsePatchOperations, PatchOperation } from './patcher';
import { Config } from './loader';

const base: Config = {
  APP_ENV: 'staging',
  DB_HOST: 'localhost',
  LOG_LEVEL: 'debug',
};

describe('applyPatch', () => {
  it('applies set operation', () => {
    const ops: PatchOperation[] = [{ op: 'set', key: 'APP_ENV', value: 'production' }];
    const { config, applied, skipped } = applyPatch(base, ops);
    expect(config.APP_ENV).toBe('production');
    expect(applied).toHaveLength(1);
    expect(skipped).toHaveLength(0);
  });

  it('applies delete operation', () => {
    const ops: PatchOperation[] = [{ op: 'delete', key: 'LOG_LEVEL' }];
    const { config, applied } = applyPatch(base, ops);
    expect('LOG_LEVEL' in config).toBe(false);
    expect(applied).toHaveLength(1);
  });

  it('skips delete for missing key', () => {
    const ops: PatchOperation[] = [{ op: 'delete', key: 'MISSING_KEY' }];
    const { skipped } = applyPatch(base, ops);
    expect(skipped).toHaveLength(1);
  });

  it('applies rename operation', () => {
    const ops: PatchOperation[] = [{ op: 'rename', key: 'DB_HOST', newKey: 'DATABASE_HOST' }];
    const { config, applied } = applyPatch(base, ops);
    expect(config.DATABASE_HOST).toBe('localhost');
    expect('DB_HOST' in config).toBe(false);
    expect(applied).toHaveLength(1);
  });

  it('skips rename for missing key', () => {
    const ops: PatchOperation[] = [{ op: 'rename', key: 'NOPE', newKey: 'ALSO_NOPE' }];
    const { skipped } = applyPatch(base, ops);
    expect(skipped).toHaveLength(1);
  });

  it('does not mutate original config', () => {
    const ops: PatchOperation[] = [{ op: 'set', key: 'NEW_KEY', value: 'val' }];
    applyPatch(base, ops);
    expect('NEW_KEY' in base).toBe(false);
  });
});

describe('parsePatchOperations', () => {
  it('parses set operation', () => {
    const ops = parsePatchOperations(['APP_ENV=production']);
    expect(ops[0]).toEqual({ op: 'set', key: 'APP_ENV', value: 'production' });
  });

  it('parses delete operation', () => {
    const ops = parsePatchOperations(['~LOG_LEVEL']);
    expect(ops[0]).toEqual({ op: 'delete', key: 'LOG_LEVEL' });
  });

  it('parses rename operation', () => {
    const ops = parsePatchOperations(['DB_HOST -> DATABASE_HOST']);
    expect(ops[0]).toEqual({ op: 'rename', key: 'DB_HOST', newKey: 'DATABASE_HOST' });
  });

  it('throws on invalid operation', () => {
    expect(() => parsePatchOperations(['INVALID'])).toThrow();
  });
});
