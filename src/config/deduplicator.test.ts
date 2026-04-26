import {
  normalizeKeyForDedup,
  findDuplicateKeys,
  deduplicateConfig,
} from './deduplicator';

describe('normalizeKeyForDedup', () => {
  it('lowercases the key', () => {
    expect(normalizeKeyForDedup('DB_HOST')).toBe('dbhost');
  });

  it('strips underscores, dashes, and dots', () => {
    expect(normalizeKeyForDedup('db-host')).toBe('dbhost');
    expect(normalizeKeyForDedup('db.host')).toBe('dbhost');
    expect(normalizeKeyForDedup('DB_HOST')).toBe('dbhost');
  });

  it('handles already normalized keys', () => {
    expect(normalizeKeyForDedup('dbhost')).toBe('dbhost');
  });
});

describe('findDuplicateKeys', () => {
  it('returns empty array when no duplicates', () => {
    const config = { DB_HOST: 'localhost', DB_PORT: '5432' };
    expect(findDuplicateKeys(config)).toEqual([]);
  });

  it('detects keys that differ only by separator', () => {
    const config = { DB_HOST: 'localhost', 'DB-HOST': '127.0.0.1', OTHER: 'val' };
    const dupes = findDuplicateKeys(config);
    expect(dupes).toHaveLength(1);
    expect(dupes[0].normalized).toBe('dbhost');
    expect(dupes[0].values).toEqual(['localhost', '127.0.0.1']);
  });

  it('detects case-insensitive duplicates', () => {
    const config = { api_key: 'abc', API_KEY: 'xyz' };
    const dupes = findDuplicateKeys(config);
    expect(dupes).toHaveLength(1);
    expect(dupes[0].values).toHaveLength(2);
  });
});

describe('deduplicateConfig', () => {
  it('keeps all keys when no duplicates exist', () => {
    const config = { HOST: 'localhost', PORT: '3000' };
    const result = deduplicateConfig(config);
    expect(result.config).toEqual(config);
    expect(result.removedCount).toBe(0);
    expect(result.duplicates).toHaveLength(0);
  });

  it('keeps first occurrence of duplicate keys', () => {
    const config = { DB_HOST: 'first', 'DB-HOST': 'second', 'db.host': 'third' };
    const result = deduplicateConfig(config);
    expect(Object.keys(result.config)).toHaveLength(1);
    expect(result.config['DB_HOST']).toBe('first');
    expect(result.removedCount).toBe(2);
  });

  it('reports all duplicate groups', () => {
    const config = {
      DB_HOST: 'a',
      'DB-HOST': 'b',
      API_KEY: 'x',
      api_key: 'y',
      SAFE: 'ok',
    };
    const result = deduplicateConfig(config);
    expect(result.duplicates).toHaveLength(2);
    expect(result.removedCount).toBe(2);
    expect(result.config['SAFE']).toBe('ok');
  });
});
