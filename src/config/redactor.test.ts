import { redactConfig, redactValue, listRedactedKeys } from './redactor';

describe('redactValue', () => {
  it('returns placeholder for short values', () => {
    expect(redactValue('abc', true)).toBe('[REDACTED]');
  });

  it('returns partial redaction for longer values', () => {
    const result = redactValue('supersecrettoken', true);
    expect(result).toMatch(/^supe\*\*\*$/);
  });

  it('returns full placeholder when partial is false', () => {
    expect(redactValue('supersecrettoken', false)).toBe('[REDACTED]');
  });
});

describe('redactConfig', () => {
  const config = {
    APP_NAME: 'myapp',
    DB_PASSWORD: 'hunter2',
    API_SECRET: 'abc123xyz',
    PORT: '3000',
  };

  it('redacts secret keys using default placeholder', () => {
    const result = redactConfig(config);
    expect(result.DB_PASSWORD).toBe('[REDACTED]');
    expect(result.API_SECRET).toBe('[REDACTED]');
    expect(result.APP_NAME).toBe('myapp');
    expect(result.PORT).toBe('3000');
  });

  it('uses custom placeholder when provided', () => {
    const result = redactConfig(config, { placeholder: '***' });
    expect(result.DB_PASSWORD).toBe('***');
  });

  it('redacts additional keys specified in options', () => {
    const result = redactConfig(config, { keys: ['PORT'] });
    expect(result.PORT).toBe('[REDACTED]');
  });

  it('supports partial redaction', () => {
    const result = redactConfig(config, { partial: true });
    expect(result.API_SECRET).toMatch(/^abc\*\*\*$/);
  });

  it('does not mutate the original config', () => {
    redactConfig(config);
    expect(config.DB_PASSWORD).toBe('hunter2');
  });
});

describe('listRedactedKeys', () => {
  it('returns keys that would be redacted', () => {
    const config = { APP_NAME: 'x', DB_PASSWORD: 'y', TOKEN: 'z', PORT: '80' };
    const keys = listRedactedKeys(config);
    expect(keys).toContain('DB_PASSWORD');
    expect(keys).toContain('TOKEN');
    expect(keys).not.toContain('APP_NAME');
  });

  it('includes extra keys from options', () => {
    const config = { APP_NAME: 'x', PORT: '80' };
    const keys = listRedactedKeys(config, { keys: ['PORT'] });
    expect(keys).toContain('PORT');
  });
});
