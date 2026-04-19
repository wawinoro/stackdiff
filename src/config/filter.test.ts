import { filterConfig, isSecretKey } from './filter';

const sample: Record<string, string> = {
  DATABASE_URL: 'postgres://localhost/db',
  API_KEY: 'abc123',
  APP_SECRET: '',
  NODE_ENV: 'production',
  AUTH_TOKEN: 'tok_xyz',
  LOG_LEVEL: 'info',
};

describe('isSecretKey', () => {
  it('detects secret keys', () => {
    expect(isSecretKey('API_KEY')).toBe(true);
    expect(isSecretKey('APP_SECRET')).toBe(true);
    expect(isSecretKey('AUTH_TOKEN')).toBe(true);
    expect(isSecretKey('DB_PASSWORD')).toBe(true);
  });

  it('returns false for non-secret keys', () => {
    expect(isSecretKey('NODE_ENV')).toBe(false);
    expect(isSecretKey('LOG_LEVEL')).toBe(false);
  });
});

describe('filterConfig', () => {
  it('returns all entries when no options given', () => {
    const result = filterConfig(sample, {});
    expect(Object.keys(result)).toHaveLength(6);
  });

  it('filters by include pattern', () => {
    const result = filterConfig(sample, { include: ['auth'] });
    expect(Object.keys(result)).toEqual(['AUTH_TOKEN']);
  });

  it('filters by exclude pattern', () => {
    const result = filterConfig(sample, { exclude: ['node', 'log'] });
    expect(result).not.toHaveProperty('NODE_ENV');
    expect(result).not.toHaveProperty('LOG_LEVEL');
  });

  it('filters only secrets', () => {
    const result = filterConfig(sample, { onlySecrets: true });
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['API_KEY', 'APP_SECRET', 'AUTH_TOKEN']));
    expect(result).not.toHaveProperty('NODE_ENV');
  });

  it('filters only empty values', () => {
    const result = filterConfig(sample, { onlyEmpty: true });
    expect(Object.keys(result)).toEqual(['APP_SECRET']);
  });

  it('combines include and onlySecrets', () => {
    const result = filterConfig(sample, { include: ['api'], onlySecrets: true });
    expect(Object.keys(result)).toEqual(['API_KEY']);
  });
});
