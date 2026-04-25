import { migrateConfig, getConfigVersion, formatMigrationResult } from './migrator';

describe('getConfigVersion', () => {
  it('returns 0 when CONFIG_VERSION is absent', () => {
    expect(getConfigVersion({ FOO: 'bar' })).toBe(0);
  });

  it('returns parsed integer version', () => {
    expect(getConfigVersion({ CONFIG_VERSION: '2' })).toBe(2);
  });
});

describe('migrateConfig', () => {
  it('applies DB_HOST rename migration', () => {
    const result = migrateConfig({ DB_HOST: 'localhost', PORT: '5432' }, 1);
    expect(result.config['DATABASE_HOST']).toBe('localhost');
    expect(result.config['DB_HOST']).toBeUndefined();
    expect(result.applied).toHaveLength(1);
  });

  it('skips already-applied migrations based on version', () => {
    const result = migrateConfig({ DATABASE_HOST: 'localhost', CONFIG_VERSION: '1' }, 1);
    expect(result.applied).toHaveLength(0);
    expect(result.fromVersion).toBe(1);
    expect(result.toVersion).toBe(1);
  });

  it('applies multiple migrations in order', () => {
    const result = migrateConfig({ DB_HOST: 'localhost', REDIS_URL: 'redis://localhost' }, 2);
    expect(result.config['DATABASE_HOST']).toBe('localhost');
    expect(result.config['CACHE_REDIS_URL']).toBe('redis://localhost');
    expect(result.applied).toHaveLength(2);
    expect(result.config['CONFIG_VERSION']).toBe('2');
  });

  it('sets CONFIG_VERSION after migration', () => {
    const result = migrateConfig({}, 2);
    expect(result.config['CONFIG_VERSION']).toBe('2');
  });

  it('returns empty applied list when already at target version', () => {
    const result = migrateConfig({ CONFIG_VERSION: '2' }, 2);
    expect(result.applied).toEqual([]);
  });
});

describe('formatMigrationResult', () => {
  it('formats result with applied migrations', () => {
    const result = migrateConfig({ DB_HOST: 'h' }, 1);
    const output = formatMigrationResult(result);
    expect(output).toContain('v0 → v1');
    expect(output).toContain('Rename DB_HOST');
  });

  it('shows no migrations message when none applied', () => {
    const result = migrateConfig({ CONFIG_VERSION: '2' }, 2);
    const output = formatMigrationResult(result);
    expect(output).toContain('No migrations applied');
  });
});
