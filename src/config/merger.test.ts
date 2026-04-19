import { mergeConfigs, mergeWithDefaults } from './merger';

const staging = { HOST: 'staging.example.com', PORT: '3000', DEBUG: 'true' };
const production = { HOST: 'prod.example.com', PORT: '8080', SECRET: 'abc123' };

describe('mergeConfigs', () => {
  it('strategy=staging prefers staging values', () => {
    const result = mergeConfigs(staging, production, { strategy: 'staging' });
    expect(result.HOST).toBe('staging.example.com');
    expect(result.PORT).toBe('3000');
    expect(result.SECRET).toBe('abc123');
  });

  it('strategy=production prefers production values', () => {
    const result = mergeConfigs(staging, production, { strategy: 'production' });
    expect(result.HOST).toBe('prod.example.com');
    expect(result.PORT).toBe('8080');
    expect(result.DEBUG).toBe('true');
  });

  it('strategy=union includes all keys', () => {
    const result = mergeConfigs(staging, production, { strategy: 'union' });
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['HOST', 'PORT', 'DEBUG', 'SECRET']));
  });

  it('strategy=intersection only keeps shared keys', () => {
    const result = mergeConfigs(staging, production, { strategy: 'intersection' });
    expect(result).toHaveProperty('HOST');
    expect(result).toHaveProperty('PORT');
    expect(result).not.toHaveProperty('DEBUG');
    expect(result).not.toHaveProperty('SECRET');
  });

  it('applies overrides after merge', () => {
    const result = mergeConfigs(staging, production, {
      strategy: 'staging',
      overrides: { HOST: 'override.example.com' },
    });
    expect(result.HOST).toBe('override.example.com');
  });

  it('throws on unknown strategy', () => {
    expect(() =>
      mergeConfigs(staging, production, { strategy: 'unknown' as any })
    ).toThrow('Unknown merge strategy');
  });
});

describe('mergeWithDefaults', () => {
  it('fills missing keys from defaults', () => {
    const result = mergeWithDefaults({ HOST: 'custom.com' }, { HOST: 'default.com', TIMEOUT: '30' });
    expect(result.HOST).toBe('custom.com');
    expect(result.TIMEOUT).toBe('30');
  });
});
