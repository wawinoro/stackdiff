import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parseAnnotateArgs, runAnnotateCmd } from './annotate-cmd';

function writeTmp(dir: string, name: string, content: string): string {
  const p = path.join(dir, name);
  fs.writeFileSync(p, content, 'utf-8');
  return p;
}

describe('parseAnnotateArgs', () => {
  it('parses required --config flag', () => {
    const args = parseAnnotateArgs(['--config', 'app.env', '--action', 'list']);
    expect(args.configFile).toBe('app.env');
    expect(args.action).toBe('list');
  });

  it('parses add action with key, note, author', () => {
    const args = parseAnnotateArgs([
      '--config', 'app.env',
      '--action', 'add',
      '--key', 'DB_HOST',
      '--note', 'Primary DB',
      '--author', 'alice',
    ]);
    expect(args.key).toBe('DB_HOST');
    expect(args.note).toBe('Primary DB');
    expect(args.author).toBe('alice');
  });

  it('throws when --config is missing', () => {
    expect(() => parseAnnotateArgs(['--action', 'list'])).toThrow('--config is required');
  });
});

describe('runAnnotateCmd', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'annotate-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('adds and persists an annotation', async () => {
    const cfg = writeTmp(tmpDir, 'app.env', 'DB_HOST=localhost\nPORT=5432\n');
    const annFile = path.join(tmpDir, '.annotations.json');
    await runAnnotateCmd({
      configFile: cfg,
      action: 'add',
      key: 'DB_HOST',
      note: 'Primary host',
      author: 'tester',
      annotationFile: annFile,
    });
    const saved = JSON.parse(fs.readFileSync(annFile, 'utf-8'));
    expect(saved['DB_HOST']).toHaveLength(1);
    expect(saved['DB_HOST'][0].note).toBe('Primary host');
  });

  it('removes annotations', async () => {
    const cfg = writeTmp(tmpDir, 'app.env', 'DB_HOST=localhost\n');
    const annFile = writeTmp(tmpDir, '.annotations.json',
      JSON.stringify({ DB_HOST: [{ key: 'DB_HOST', note: 'test', createdAt: '' }] }));
    await runAnnotateCmd({
      configFile: cfg,
      action: 'remove',
      key: 'DB_HOST',
      annotationFile: annFile,
    });
    const saved = JSON.parse(fs.readFileSync(annFile, 'utf-8'));
    expect(saved['DB_HOST']).toBeUndefined();
  });

  it('lists annotations without error', async () => {
    const cfg = writeTmp(tmpDir, 'app.env', 'PORT=3000\n');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await runAnnotateCmd({ configFile: cfg, action: 'list' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
