import { diffConfigs } from './diff';

describe('diffConfigs', () => {
  const source = { A: 'hello', B: 'same', C: 'old' };
  const target = { B: 'same', C: 'new', D: 'added' };

  it('detects removed keys', () => {
    const entries = diffConfigs(source, target);
    const removed = entries.filter((e) => e.status === 'removed');
    expect(removed).toHaveLength(1);
    expect(removed[0].key).toBe('A');
    expect(removed[0].sourceValue).toBe('hello');
  });

  it('detects added keys', () => {
    const entries = diffConfigs(source, target);
    const added = entries.filter((e) => e.status === 'added');
    expect(added).toHaveLength(1);
    expect(added[0].key).toBe('D');
    expect(added[0].targetValue).toBe('added');
  });

  it('detects changed keys', () => {
    const entries = diffConfigs(source, target);
    const changed = entries.filter((e) => e.status === 'changed');
    expect(changed).toHaveLength(1);
    expect(changed[0].key).toBe('C');
    expect(changed[0].sourceValue).toBe('old');
    expect(changed[0].targetValue).toBe('new');
  });

  it('detects unchanged keys', () => {
    const entries = diffConfigs(source, target);
    const unchanged = entries.filter((e) => e.status === 'unchanged');
    expect(unchanged).toHaveLength(1);
    expect(unchanged[0].key).toBe('B');
  });

  it('returns results sorted by key', () => {
    const entries = diffConfigs(source, target);
    const keys = entries.map((e) => e.key);
    expect(keys).toEqual([...keys].sort());
  });

  it('handles identical configs', () => {
    const entries = diffConfigs({ X: 1 }, { X: 1 });
    expect(entries.every((e) => e.status === 'unchanged')).toBe(true);
  });
});
