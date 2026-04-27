import { splitByPrefix, splitBySize, formatSplitResult } from './splitter';

describe('splitByPrefix', () => {
  const config = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    REDIS_URL: 'redis://localhost',
    APP_NAME: 'stackdiff',
    PORT: '3000',
  };

  it('groups keys by prefix', () => {
    const { chunks } = splitByPrefix(config, ['DB', 'REDIS']);
    const db = chunks.find((c) => c.name === 'DB')!;
    expect(Object.keys(db.config)).toEqual(['DB_HOST', 'DB_PORT']);
    const redis = chunks.find((c) => c.name === 'REDIS')!;
    expect(Object.keys(redis.config)).toEqual(['REDIS_URL']);
  });

  it('collects unmatched keys into __other__', () => {
    const { chunks } = splitByPrefix(config, ['DB']);
    const other = chunks.find((c) => c.name === '__other__')!;
    expect(other).toBeDefined();
    expect(Object.keys(other.config)).toContain('PORT');
    expect(Object.keys(other.config)).toContain('APP_NAME');
  });

  it('returns correct totalKeys', () => {
    const { totalKeys } = splitByPrefix(config, ['DB']);
    expect(totalKeys).toBe(5);
  });

  it('omits __other__ when all keys are matched', () => {
    const small = { DB_HOST: 'h', REDIS_URL: 'r' };
    const { chunks } = splitByPrefix(small, ['DB', 'REDIS']);
    expect(chunks.find((c) => c.name === '__other__')).toBeUndefined();
  });
});

describe('splitBySize', () => {
  const config = { A: '1', B: '2', C: '3', D: '4', E: '5' };

  it('splits into chunks of given size', () => {
    const { chunks } = splitBySize(config, 2);
    expect(chunks).toHaveLength(3);
    expect(Object.keys(chunks[0].config)).toHaveLength(2);
    expect(Object.keys(chunks[2].config)).toHaveLength(1);
  });

  it('names chunks sequentially', () => {
    const { chunks } = splitBySize(config, 2);
    expect(chunks[0].name).toBe('chunk_1');
    expect(chunks[1].name).toBe('chunk_2');
  });

  it('throws on non-positive size', () => {
    expect(() => splitBySize(config, 0)).toThrow(RangeError);
  });
});

describe('formatSplitResult', () => {
  it('includes total key count and chunk names', () => {
    const result = splitByPrefix({ DB_HOST: 'h', PORT: '3000' }, ['DB']);
    const output = formatSplitResult(result);
    expect(output).toContain('Total keys: 2');
    expect(output).toContain('[DB]');
    expect(output).toContain('DB_HOST');
    expect(output).toContain('[__other__]');
  });
});
