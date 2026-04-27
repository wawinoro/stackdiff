import { describe, it, expect } from 'vitest';
import {
  parseAliasMap,
  applyAliases,
  listResolvedAliases,
  listUnresolvedAliases,
} from './aliaser';

describe('parseAliasMap', () => {
  it('parses valid entries', () => {
    expect(parseAliasMap(['DB=DATABASE_URL', 'PORT=APP_PORT'])).toEqual({
      DB: 'DATABASE_URL',
      PORT: 'APP_PORT',
    });
  });

  it('throws on missing equals sign', () => {
    expect(() => parseAliasMap(['INVALID'])).toThrow('Invalid alias entry');
  });

  it('throws on empty alias or original', () => {
    expect(() => parseAliasMap(['=ORIGINAL'])).toThrow('Invalid alias entry');
    expect(() => parseAliasMap(['ALIAS='])).toThrow('Invalid alias entry');
  });
});

describe('applyAliases', () => {
  const config = { DATABASE_URL: 'postgres://localhost/db', APP_PORT: '3000' };
  const aliasMap = { DB: 'DATABASE_URL', PORT: 'APP_PORT', MISSING: 'GHOST' };

  it('adds alias keys while keeping originals by default', () => {
    const result = applyAliases(config, aliasMap);
    expect(result.DB).toBe('postgres://localhost/db');
    expect(result.DATABASE_URL).toBe('postgres://localhost/db');
    expect(result.PORT).toBe('3000');
  });

  it('removes original keys when replace=true', () => {
    const result = applyAliases(config, aliasMap, true);
    expect(result.DB).toBe('postgres://localhost/db');
    expect(result.DATABASE_URL).toBeUndefined();
  });

  it('silently skips aliases whose original is absent', () => {
    const result = applyAliases(config, aliasMap);
    expect(result.MISSING).toBeUndefined();
  });
});

describe('listResolvedAliases', () => {
  it('returns only aliases that resolved', () => {
    const config = { DATABASE_URL: 'x' };
    const aliasMap = { DB: 'DATABASE_URL', PORT: 'APP_PORT' };
    expect(listResolvedAliases(config, aliasMap)).toEqual(['DB']);
  });
});

describe('listUnresolvedAliases', () => {
  it('returns only aliases that did not resolve', () => {
    const config = { DATABASE_URL: 'x' };
    const aliasMap = { DB: 'DATABASE_URL', PORT: 'APP_PORT' };
    expect(listUnresolvedAliases(config, aliasMap)).toEqual(['PORT']);
  });
});
