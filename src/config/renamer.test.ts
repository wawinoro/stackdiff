import { renameKeys, parseRenameMap, RenameMap } from './renamer';

describe('parseRenameMap', () => {
  it('parses valid pairs', () => {
    const map = parseRenameMap(['DB_HOST=DATABASE_HOST', 'API_KEY=SERVICE_API_KEY']);
    expect(map).toEqual({ DB_HOST: 'DATABASE_HOST', API_KEY: 'SERVICE_API_KEY' });
  });

  it('throws on missing equals sign', () => {
    expect(() => parseRenameMap(['INVALID'])).toThrow('Invalid rename pair');
  });

  it('throws on empty new key', () => {
    expect(() => parseRenameMap(['OLD='])).toThrow('Empty new key');
  });

  it('trims whitespace around keys', () => {
    const map = parseRenameMap([' FOO = BAR ']);
    expect(map).toEqual({ FOO: 'BAR' });
  });
});

describe('renameKeys', () => {
  const config = { DB_HOST: 'localhost', DB_PORT: '5432', APP_ENV: 'staging' };

  it('renames existing keys', () => {
    const map: RenameMap = { DB_HOST: 'DATABASE_HOST' };
    const { config: out, renamed, notFound } = renameKeys(config, map);
    expect(out).toHaveProperty('DATABASE_HOST', 'localhost');
    expect(out).not.toHaveProperty('DB_HOST');
    expect(renamed).toEqual(['DB_HOST -> DATABASE_HOST']);
    expect(notFound).toEqual([]);
  });

  it('reports keys not found in config', () => {
    const map: RenameMap = { MISSING_KEY: 'NEW_KEY' };
    const { config: out, renamed, notFound } = renameKeys(config, map);
    expect(out).not.toHaveProperty('NEW_KEY');
    expect(renamed).toEqual([]);
    expect(notFound).toEqual(['MISSING_KEY']);
  });

  it('renames multiple keys at once', () => {
    const map: RenameMap = { DB_HOST: 'DATABASE_HOST', DB_PORT: 'DATABASE_PORT' };
    const { config: out, renamed } = renameKeys(config, map);
    expect(out).toHaveProperty('DATABASE_HOST', 'localhost');
    expect(out).toHaveProperty('DATABASE_PORT', '5432');
    expect(renamed).toHaveLength(2);
  });

  it('does not mutate the original config', () => {
    const original = { ...config };
    renameKeys(config, { DB_HOST: 'X' });
    expect(config).toEqual(original);
  });
});
