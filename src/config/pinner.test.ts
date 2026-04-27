import {
  pinKeys,
  applyWithPins,
  listPinnedKeys,
  unpinKeys,
  formatPinReport,
} from './pinner';

const base = {
  API_URL: 'https://api.example.com',
  DB_HOST: 'localhost',
  LOG_LEVEL: 'info',
};

describe('pinKeys', () => {
  it('pins existing keys', () => {
    const pinned = pinKeys(base, ['API_URL', 'DB_HOST']);
    expect(pinned.pins).toEqual({
      API_URL: 'https://api.example.com',
      DB_HOST: 'localhost',
    });
  });

  it('ignores keys not present in config', () => {
    const pinned = pinKeys(base, ['MISSING_KEY']);
    expect(pinned.pins).toEqual({});
  });

  it('preserves the source config', () => {
    const pinned = pinKeys(base, ['LOG_LEVEL']);
    expect(pinned.source).toEqual(base);
  });
});

describe('applyWithPins', () => {
  it('prevents pinned keys from being overwritten', () => {
    const pinned = pinKeys(base, ['API_URL']);
    const incoming = { API_URL: 'https://evil.com', LOG_LEVEL: 'debug' };
    const result = applyWithPins(pinned, incoming);
    expect(result['API_URL']).toBe('https://api.example.com');
    expect(result['LOG_LEVEL']).toBe('debug');
  });

  it('allows non-pinned keys to be updated', () => {
    const pinned = pinKeys(base, ['DB_HOST']);
    const incoming = { LOG_LEVEL: 'warn' };
    const result = applyWithPins(pinned, incoming);
    expect(result['LOG_LEVEL']).toBe('warn');
    expect(result['DB_HOST']).toBe('localhost');
  });
});

describe('listPinnedKeys', () => {
  it('returns all pinned key names', () => {
    const pinned = pinKeys(base, ['API_URL', 'LOG_LEVEL']);
    expect(listPinnedKeys(pinned)).toEqual(['API_URL', 'LOG_LEVEL']);
  });
});

describe('unpinKeys', () => {
  it('removes specified keys from pins', () => {
    const pinned = pinKeys(base, ['API_URL', 'DB_HOST']);
    const updated = unpinKeys(pinned, ['API_URL']);
    expect(listPinnedKeys(updated)).toEqual(['DB_HOST']);
  });
});

describe('formatPinReport', () => {
  it('returns a message when no keys are pinned', () => {
    const pinned = pinKeys(base, []);
    expect(formatPinReport(pinned)).toBe('No keys are pinned.');
  });

  it('lists pinned keys and values', () => {
    const pinned = pinKeys(base, ['LOG_LEVEL']);
    const report = formatPinReport(pinned);
    expect(report).toContain('Pinned keys (1)');
    expect(report).toContain('LOG_LEVEL = info');
  });
});
