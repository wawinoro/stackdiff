import { coerceValue, coerceConfig, formatCoerceResult, CoerceRule } from './typecoercer';

describe('coerceValue', () => {
  it('returns string unchanged', () => {
    expect(coerceValue('hello', 'string')).toBe('hello');
  });

  it('coerces valid number', () => {
    expect(coerceValue('42', 'number')).toBe(42);
    expect(coerceValue('3.14', 'number')).toBe(3.14);
  });

  it('throws on invalid number', () => {
    expect(() => coerceValue('abc', 'number')).toThrow('Cannot coerce');
  });

  it('coerces boolean truthy values', () => {
    expect(coerceValue('true', 'boolean')).toBe(true);
    expect(coerceValue('1', 'boolean')).toBe(true);
    expect(coerceValue('yes', 'boolean')).toBe(true);
  });

  it('coerces boolean falsy values', () => {
    expect(coerceValue('false', 'boolean')).toBe(false);
    expect(coerceValue('0', 'boolean')).toBe(false);
    expect(coerceValue('no', 'boolean')).toBe(false);
  });

  it('throws on invalid boolean', () => {
    expect(() => coerceValue('maybe', 'boolean')).toThrow('Cannot coerce');
  });

  it('coerces valid JSON', () => {
    expect(coerceValue('{"a":1}', 'json')).toEqual({ a: 1 });
    expect(coerceValue('[1,2]', 'json')).toEqual([1, 2]);
  });

  it('throws on invalid JSON', () => {
    expect(() => coerceValue('{bad}', 'json')).toThrow('Cannot coerce');
  });
});

describe('coerceConfig', () => {
  const config = { PORT: '8080', DEBUG: 'true', NAME: 'app', SCORE: 'bad' };

  it('applies rules and records changes', () => {
    const rules: CoerceRule[] = [
      { key: 'PORT', type: 'number' },
      { key: 'DEBUG', type: 'boolean' },
      { key: 'NAME', type: 'string' },
    ];
    const result = coerceConfig(config, rules);
    expect(result.coerced['PORT']).toBe(8080);
    expect(result.coerced['DEBUG']).toBe(true);
    expect(result.coerced['NAME']).toBe('app');
    expect(result.changes).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  it('records errors for failed coercions', () => {
    const rules: CoerceRule[] = [{ key: 'SCORE', type: 'number' }];
    const result = coerceConfig(config, rules);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].key).toBe('SCORE');
  });

  it('skips missing keys', () => {
    const rules: CoerceRule[] = [{ key: 'MISSING', type: 'number' }];
    const result = coerceConfig(config, rules);
    expect(result.changes).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });
});

describe('formatCoerceResult', () => {
  it('formats changes and errors', () => {
    const result = coerceConfig({ PORT: '8080', BAD: 'nope' }, [
      { key: 'PORT', type: 'number' },
      { key: 'BAD', type: 'boolean' },
    ]);
    const out = formatCoerceResult(result);
    expect(out).toContain('PORT');
    expect(out).toContain('BAD');
  });

  it('shows no keys coerced message', () => {
    const result = coerceConfig({ NAME: 'app' }, [{ key: 'NAME', type: 'string' }]);
    const out = formatCoerceResult(result);
    expect(out).toContain('No keys coerced.');
  });
});
