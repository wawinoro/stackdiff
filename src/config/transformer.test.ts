import { maskSecrets, normalizeKeys, castTypes, transformConfig } from './transformer';

describe('maskSecrets', () => {
  it('masks keys matching secret pattern', () => {
    const result = maskSecrets({ API_TOKEN: 'abc123', HOST: 'localhost', DB_PASSWORD: 'pass' });
    expect(result.API_TOKEN).toBe('***');
    expect(result.DB_PASSWORD).toBe('***');
    expect(result.HOST).toBe('localhost');
  });
});

describe('normalizeKeys', () => {
  it('uppercases keys and replaces dashes with underscores', () => {
    const result = normalizeKeys({ 'app-name': 'myapp', port: '3000' });
    expect(result).toHaveProperty('APP_NAME', 'myapp');
    expect(result).toHaveProperty('PORT', '3000');
  });
});

describe('castTypes', () => {
  it('casts booleans and numbers', () => {
    const result = castTypes({ ENABLED: 'true', RETRIES: '3', NAME: 'app', EMPTY: '' });
    expect(result.ENABLED).toBe(true);
    expect(result.RETRIES).toBe(3);
    expect(result.NAME).toBe('app');
    expect(result.EMPTY).toBe('');
  });

  it('casts false string to boolean', () => {
    expect(castTypes({ FLAG: 'false' }).FLAG).toBe(false);
  });
});

describe('transformConfig', () => {
  const input = { 'db-password': 'secret', 'max-retries': '5', debug: 'true' };

  it('applies all transforms in order', () => {
    const result = transformConfig(input, {
      normalizeKeys: true,
      maskSecrets: true,
      castTypes: true,
    });
    expect(result['DB_PASSWORD']).toBe('***');
    expect(result['MAX_RETRIES']).toBe(5);
    expect(result['DEBUG']).toBe(true);
  });

  it('returns plain copy with no options', () => {
    const result = transformConfig({ HOST: 'localhost' });
    expect(result).toEqual({ HOST: 'localhost' });
  });
});
