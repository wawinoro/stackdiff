import { interpolateValue, interpolateConfig, hasUnresolvedRefs } from './interpolator';

describe('interpolateValue', () => {
  it('replaces a known variable from context', () => {
    expect(interpolateValue('hello ${NAME}', { NAME: 'world' }, {})).toBe('hello world');
  });

  it('falls back to env when not in context', () => {
    expect(interpolateValue('${HOME}/app', {}, { HOME: '/home/user' })).toBe('/home/user/app');
  });

  it('leaves unresolved references intact', () => {
    expect(interpolateValue('${UNKNOWN}', {}, {})).toBe('${UNKNOWN}');
  });

  it('replaces multiple references', () => {
    const ctx = { HOST: 'localhost', PORT: '5432' };
    expect(interpolateValue('${HOST}:${PORT}', ctx, {})).toBe('localhost:5432');
  });
});

describe('interpolateConfig', () => {
  it('resolves cross-references within the same config', () => {
    const config = { BASE_URL: 'https://example.com', API_URL: '${BASE_URL}/api' };
    const result = interpolateConfig(config, {}, {});
    expect(result.API_URL).toBe('https://example.com/api');
  });

  it('extraContext overrides config values for resolution', () => {
    const config = { URL: '${HOST}/path' };
    const result = interpolateConfig(config, { HOST: 'override.io' }, {});
    expect(result.URL).toBe('override.io/path');
  });

  it('does not mutate the original config', () => {
    const config = { KEY: '${X}' };
    interpolateConfig(config, { X: 'val' }, {});
    expect(config.KEY).toBe('${X}');
  });
});

describe('hasUnresolvedRefs', () => {
  it('returns keys with unresolved references', () => {
    const config = { A: '${MISSING}', B: 'resolved' };
    expect(hasUnresolvedRefs(config)).toEqual(['A']);
  });

  it('returns empty array when all resolved', () => {
    expect(hasUnresolvedRefs({ A: 'plain', B: 'value' })).toEqual([]);
  });
});
