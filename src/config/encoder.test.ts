import { encodeValue, decodeValue, encodeConfig, decodeConfig } from './encoder';

describe('encodeValue', () => {
  it('encodes to base64 by default', () => {
    expect(encodeValue('hello')).toBe('aGVsbG8=');
  });

  it('encodes to hex', () => {
    expect(encodeValue('hello', 'hex')).toBe('68656c6c6f');
  });

  it('encodes to uri', () => {
    expect(encodeValue('hello world', 'uri')).toBe('hello%20world');
  });

  it('throws on unsupported format', () => {
    expect(() => encodeValue('x', 'rot13' as any)).toThrow('Unsupported encoding format');
  });
});

describe('decodeValue', () => {
  it('decodes base64', () => {
    expect(decodeValue('aGVsbG8=')).toBe('hello');
  });

  it('decodes hex', () => {
    expect(decodeValue('68656c6c6f', 'hex')).toBe('hello');
  });

  it('decodes uri', () => {
    expect(decodeValue('hello%20world', 'uri')).toBe('hello world');
  });
});

describe('encodeConfig', () => {
  const config = { SECRET: 'mypassword', HOST: 'localhost', PORT: '3000' };

  it('encodes all keys when no keys specified', () => {
    const { config: encoded, encodedKeys } = encodeConfig(config);
    expect(encodedKeys).toEqual(['SECRET', 'HOST', 'PORT']);
    expect(encoded.SECRET).toBe(Buffer.from('mypassword').toString('base64'));
  });

  it('encodes only specified keys', () => {
    const { config: encoded, encodedKeys } = encodeConfig(config, { keys: ['SECRET'] });
    expect(encodedKeys).toEqual(['SECRET']);
    expect(encoded.HOST).toBe('localhost');
    expect(encoded.PORT).toBe('3000');
  });

  it('uses specified format', () => {
    const { config: encoded } = encodeConfig(config, { keys: ['HOST'], format: 'hex' });
    expect(encoded.HOST).toBe(Buffer.from('localhost').toString('hex'));
  });
});

describe('decodeConfig', () => {
  it('round-trips encode/decode', () => {
    const original = { KEY: 'supersecret', VAL: 'data' };
    const { config: encoded } = encodeConfig(original);
    const decoded = decodeConfig(encoded);
    expect(decoded).toEqual(original);
  });

  it('decodes only specified keys', () => {
    const encoded = { A: Buffer.from('alpha').toString('base64'), B: 'plain' };
    const decoded = decodeConfig(encoded, { keys: ['A'] });
    expect(decoded.A).toBe('alpha');
    expect(decoded.B).toBe('plain');
  });
});
