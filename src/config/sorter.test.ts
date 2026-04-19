import { sortConfig, sortKeys } from './sorter';

const sample: Record<string, string> = {
  ZEBRA: 'z',
  APPLE: 'a',
  MANGO: 'm',
  DATABASE_URL: 'db',
};

describe('sortConfig', () => {
  it('sorts keys ascending by default', () => {
    const result = sortConfig(sample);
    expect(Object.keys(result)).toEqual(['APPLE', 'DATABASE_URL', 'MANGO', 'ZEBRA']);
  });

  it('sorts keys descending', () => {
    const result = sortConfig(sample, { order: 'desc' });
    expect(Object.keys(result)).toEqual(['ZEBRA', 'MANGO', 'DATABASE_URL', 'APPLE']);
  });

  it('returns original order when order is none', () => {
    const result = sortConfig(sample, { order: 'none' });
    expect(Object.keys(result)).toEqual(Object.keys(sample));
  });

  it('places priority keys first', () => {
    const result = sortConfig(sample, { priorityKeys: ['DATABASE_URL'] });
    const keys = Object.keys(result);
    expect(keys[0]).toBe('DATABASE_URL');
    expect(keys.slice(1)).toEqual(['APPLE', 'MANGO', 'ZEBRA']);
  });

  it('preserves values after sorting', () => {
    const result = sortConfig(sample);
    expect(result['APPLE']).toBe('a');
    expect(result['ZEBRA']).toBe('z');
  });

  it('ignores priority keys not present in config', () => {
    const result = sortConfig(sample, { priorityKeys: ['MISSING_KEY'] });
    expect(Object.keys(result)).toEqual(['APPLE', 'DATABASE_URL', 'MANGO', 'ZEBRA']);
  });
});

describe('sortKeys', () => {
  it('sorts ascending', () => {
    expect(sortKeys(['C', 'A', 'B'])).toEqual(['A', 'B', 'C']);
  });

  it('sorts descending', () => {
    expect(sortKeys(['C', 'A', 'B'], 'desc')).toEqual(['C', 'B', 'A']);
  });

  it('returns original array reference-safe copy for none', () => {
    const keys = ['C', 'A', 'B'];
    expect(sortKeys(keys, 'none')).toEqual(['C', 'A', 'B']);
  });
});
