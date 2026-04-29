import { promoteConfig, applyPromotion, formatPromoteResult } from './promoter';

const source = { A: '1', B: '2', C: '3' };
const target = { A: '1', B: 'old', D: '4' };

describe('promoteConfig', () => {
  it('promotes keys not in target', () => {
    const result = promoteConfig(source, target);
    expect(result.promoted['C']).toBe('3');
  });

  it('promotes keys with same value', () => {
    const result = promoteConfig(source, target);
    expect(result.promoted['A']).toBe('1');
  });

  it('records conflicts when values differ and overwrite is false', () => {
    const result = promoteConfig(source, target);
    expect(result.conflicts['B']).toEqual({ from: '2', to: 'old' });
  });

  it('overwrites conflicts when overwrite=true', () => {
    const result = promoteConfig(source, target, { overwrite: true });
    expect(result.promoted['B']).toBe('2');
    expect(result.conflicts).toEqual({});
  });

  it('restricts to specified keys', () => {
    const result = promoteConfig(source, target, { keys: ['A'] });
    expect(Object.keys(result.promoted)).toEqual(['A']);
    expect(result.conflicts).toEqual({});
  });

  it('skips keys not found in source', () => {
    const result = promoteConfig(source, target, { keys: ['Z'] });
    expect(result.skipped['Z']).toBeDefined();
  });
});

describe('applyPromotion', () => {
  it('merges promoted keys into target', () => {
    const result = promoteConfig(source, target, { overwrite: true });
    const applied = applyPromotion(target, result);
    expect(applied['B']).toBe('2');
    expect(applied['C']).toBe('3');
    expect(applied['D']).toBe('4');
  });
});

describe('formatPromoteResult', () => {
  it('includes promoted and conflict counts', () => {
    const result = promoteConfig(source, target);
    const output = formatPromoteResult(result);
    expect(output).toContain('Promoted:');
    expect(output).toContain('Conflicts:');
  });

  it('does not include conflicts section when none', () => {
    const result = promoteConfig(source, {}, { overwrite: true });
    const output = formatPromoteResult(result);
    expect(output).not.toContain('Conflicts:');
  });
});
