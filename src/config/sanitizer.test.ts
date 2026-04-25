import { sanitizeValue, sanitizeConfig, isNullish, listSanitizedKeys } from './sanitizer';

describe('isNullish', () => {
  it('returns true for empty string', () => expect(isNullish('')).toBe(true));
  it('returns true for "null"', () => expect(isNullish('null')).toBe(true));
  it('returns true for "NULL"', () => expect(isNullish('NULL')).toBe(true));
  it('returns true for "undefined"', () => expect(isNullish('undefined')).toBe(true));
  it('returns false for real value', () => expect(isNullish('hello')).toBe(false));
});

describe('sanitizeValue', () => {
  it('trims whitespace when enabled', () => {
    expect(sanitizeValue('  hello  ', { trimWhitespace: true })).toBe('hello');
  });

  it('does not trim when disabled', () => {
    expect(sanitizeValue('  hello  ', { trimWhitespace: false })).toBe('  hello  ');
  });

  it('normalizes CRLF to LF', () => {
    expect(sanitizeValue('line1\r\nline2', { normalizeLineEndings: true })).toBe('line1\nline2');
  });

  it('normalizes CR to LF', () => {
    expect(sanitizeValue('line1\rline2', { normalizeLineEndings: true })).toBe('line1\nline2');
  });
});

describe('sanitizeConfig', () => {
  const raw = {
    APP_NAME: '  myapp  ',
    DB_PASS: 'secret',
    EMPTY_VAL: '',
    NULL_VAL: 'null',
    VALID: 'ok',
  };

  it('removes nullish values by default', () => {
    const result = sanitizeConfig(raw);
    expect(result).not.toHaveProperty('EMPTY_VAL');
    expect(result).not.toHaveProperty('NULL_VAL');
  });

  it('trims whitespace by default', () => {
    const result = sanitizeConfig(raw);
    expect(result['APP_NAME']).toBe('myapp');
  });

  it('keeps nullish when removeNullish is false', () => {
    const result = sanitizeConfig(raw, { removeNullish: false });
    expect(result).toHaveProperty('EMPTY_VAL');
  });

  it('preserves valid values', () => {
    const result = sanitizeConfig(raw);
    expect(result['VALID']).toBe('ok');
    expect(result['DB_PASS']).toBe('secret');
  });
});

describe('listSanitizedKeys', () => {
  it('returns keys that were removed or changed', () => {
    const original = { A: '  val  ', B: 'null', C: 'ok' };
    const sanitized = { A: 'val', C: 'ok' };
    const changed = listSanitizedKeys(original, sanitized);
    expect(changed).toContain('A');
    expect(changed).toContain('B');
    expect(changed).not.toContain('C');
  });
});
