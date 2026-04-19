import fs from 'fs';
import path from 'path';
import os from 'os';
import { loadConfig } from './loader';

function writeTmp(name: string, content: string): string {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content, 'utf-8');
  return p;
}

describe('loadConfig', () => {
  it('loads a valid JSON config', () => {
    const p = writeTmp('test.json', JSON.stringify({ KEY: 'value', PORT: 3000 }));
    const result = loadConfig(p, 'staging');
    expect(result.name).toBe('staging');
    expect(result.config['KEY']).toBe('value');
    expect(result.config['PORT']).toBe(3000);
  });

  it('loads a valid YAML config', () => {
    const p = writeTmp('test.yaml', 'KEY: value\nPORT: 3000\n');
    const result = loadConfig(p, 'production');
    expect(result.config['KEY']).toBe('value');
  });

  it('throws if file does not exist', () => {
    expect(() => loadConfig('/nonexistent/path.json', 'x')).toThrow(
      'Config file not found'
    );
  });

  it('throws on unsupported extension', () => {
    const p = writeTmp('test.toml', 'KEY=value');
    expect(() => loadConfig(p, 'x')).toThrow('Unsupported config format');
  });

  it('throws if config is not a plain object', () => {
    const p = writeTmp('arr.json', '[1,2,3]');
    expect(() => loadConfig(p, 'x')).toThrow('must be a key-value object');
  });
});
