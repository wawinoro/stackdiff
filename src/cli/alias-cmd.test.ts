import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseAliasArgs, runAliasCmd } from './alias-cmd';
import * as loader from '../config/loader';
import * as exporter from '../config/exporter';

describe('parseAliasArgs', () => {
  it('parses required flags', () => {
    const args = parseAliasArgs([
      '--input', 'staging.env',
      '--alias', 'DB=DATABASE_URL',
    ]);
    expect(args.input).toBe('staging.env');
    expect(args.aliases).toEqual(['DB=DATABASE_URL']);
    expect(args.replace).toBe(false);
    expect(args.format).toBe('env');
  });

  it('parses --replace and --format flags', () => {
    const args = parseAliasArgs([
      '--input', 'prod.env',
      '--alias', 'DB=DATABASE_URL',
      '--replace',
      '--format', 'json',
    ]);
    expect(args.replace).toBe(true);
    expect(args.format).toBe('json');
  });

  it('parses --output and --no-warn', () => {
    const args = parseAliasArgs([
      '--input', 'a.env',
      '--alias', 'X=Y',
      '--output', 'out.env',
      '--no-warn',
    ]);
    expect(args.output).toBe('out.env');
    expect(args.warnUnresolved).toBe(false);
  });

  it('throws when --input is missing', () => {
    expect(() => parseAliasArgs(['--alias', 'X=Y'])).toThrow('--input is required');
  });

  it('throws when no --alias is provided', () => {
    expect(() => parseAliasArgs(['--input', 'a.env'])).toThrow('At least one --alias');
  });
});

describe('runAliasCmd', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('writes aliased config to stdout', async () => {
    vi.spyOn(loader, 'loadConfig').mockResolvedValue({ DATABASE_URL: 'pg://localhost' });
    vi.spyOn(exporter, 'exportConfig').mockReturnValue('DB=pg://localhost');
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    await runAliasCmd({
      input: 'staging.env',
      aliases: ['DB=DATABASE_URL'],
      replace: false,
      format: 'env',
      warnUnresolved: false,
    });

    expect(write).toHaveBeenCalledWith(expect.stringContaining('DB=pg://localhost'));
  });

  it('emits warning for unresolved aliases', async () => {
    vi.spyOn(loader, 'loadConfig').mockResolvedValue({});
    vi.spyOn(exporter, 'exportConfig').mockReturnValue('');
    const warn = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    await runAliasCmd({
      input: 'staging.env',
      aliases: ['DB=DATABASE_URL'],
      replace: false,
      format: 'env',
      warnUnresolved: true,
    });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('DB'));
  });
});
