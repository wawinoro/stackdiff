import { validateConfig, assertValidConfig } from './validator';

describe('validateConfig', () => {
  it('accepts a flat record of primitives', () => {
    const result = validateConfig({
      HOST: 'localhost',
      PORT: 3000,
      DEBUG: true,
      SECRET: null,
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects non-object input', () => {
    const result = validateConfig('not-an-object');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects nested objects as values', () => {
    const result = validateConfig({ KEY: { nested: true } });
    expect(result.valid).toBe(false);
  });

  it('rejects arrays as values', () => {
    const result = validateConfig({ KEY: [1, 2, 3] });
    expect(result.valid).toBe(false);
  });
});

describe('assertValidConfig', () => {
  it('returns config when valid', () => {
    const input = { FOO: 'bar', COUNT: 42 };
    expect(assertValidConfig(input)).toEqual(input);
  });

  it('throws with label when invalid', () => {
    expect(() => assertValidConfig('bad', 'staging')).toThrow(
      /Invalid staging/
    );
  });

  it('includes field errors in thrown message', () => {
    expect(() => assertValidConfig({ KEY: { deep: 1 } })).toThrow(/KEY/);
  });
});
