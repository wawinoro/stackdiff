import { freezeKeys, getFrozenKeys, applyWithFreeze, unfreeze } from './freezer';

describe('getFrozenKeys', () => {
  it('detects FROZEN_ prefixed keys', () => {
    const config = { FROZEN_DB_URL: 'postgres://...', APP_NAME: 'myapp' };
    const keys = getFrozenKeys(config);
    expect(keys.has('FROZEN_DB_URL')).toBe(true);
    expect(keys.has('APP_NAME')).toBe(false);
  });

  it('detects _LOCKED suffixed keys', () => {
    const config = { API_KEY_LOCKED: 'secret', PORT: '3000' };
    const keys = getFrozenKeys(config);
    expect(keys.has('API_KEY_LOCKED')).toBe(true);
    expect(keys.has('PORT')).toBe(false);
  });

  it('returns empty set for config with no frozen keys', () => {
    const config = { HOST: 'localhost', PORT: '8080' };
    expect(getFrozenKeys(config).size).toBe(0);
  });
});

describe('freezeKeys', () => {
  it('adds FROZEN_ marker for specified keys', () => {
    const config = { DB_URL: 'postgres://localhost', APP: 'test' };
    const { frozen, frozenKeys, skippedKeys } = freezeKeys(config, ['DB_URL']);
    expect(frozen['FROZEN_DB_URL']).toBe('postgres://localhost');
    expect(frozenKeys).toContain('DB_URL');
    expect(skippedKeys).toHaveLength(0);
  });

  it('skips keys not present in config', () => {
    const config = { APP: 'test' };
    const { skippedKeys } = freezeKeys(config, ['MISSING_KEY']);
    expect(skippedKeys).toContain('MISSING_KEY');
  });

  it('does not mutate original config', () => {
    const config = { DB_URL: 'postgres://localhost' };
    freezeKeys(config, ['DB_URL']);
    expect('FROZEN_DB_URL' in config).toBe(false);
  });
});

describe('applyWithFreeze', () => {
  it('applies patch values for non-frozen keys', () => {
    const base = { APP: 'base', PORT: '3000' };
    const patch = { PORT: '4000' };
    const result = applyWithFreeze(base, patch);
    expect(result['PORT']).toBe('4000');
  });

  it('does not override frozen keys from patch', () => {
    const base = { FROZEN_DB_URL: 'postgres://prod', DB_URL: 'postgres://prod', PORT: '5432' };
    const patch = { DB_URL: 'postgres://staging', PORT: '5433' };
    const result = applyWithFreeze(base, patch);
    expect(result['DB_URL']).toBe('postgres://prod');
    expect(result['PORT']).toBe('5433');
  });
});

describe('unfreeze', () => {
  it('strips FROZEN_ prefixed keys', () => {
    const config = { FROZEN_DB_URL: 'postgres://...', APP: 'test' };
    const result = unfreeze(config);
    expect('FROZEN_DB_URL' in result).toBe(false);
    expect(result['APP']).toBe('test');
  });

  it('strips _LOCKED suffixed keys', () => {
    const config = { API_KEY_LOCKED: 'secret', HOST: 'localhost' };
    const result = unfreeze(config);
    expect('API_KEY_LOCKED' in result).toBe(false);
    expect(result['HOST']).toBe('localhost');
  });
});
