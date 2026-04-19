import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseCliArgs } from './args';

const exitSpy = vi
  .spyOn(process, 'exit')
  .mockImplementation((_code?: number) => { throw new Error('process.exit'); });

const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
const logSpy   = vi.spyOn(console, 'log').mockImplementation(() => {});

afterEach(() => {
  vi.clearAllMocks();
});

describe('parseCliArgs', () => {
  it('parses required args with defaults', () => {
    const args = parseCliArgs(['--staging', 'stg.json', '--production', 'prd.json']);
    expect(args).toEqual({
      staging:    'stg.json',
      production: 'prd.json',
      format:     'text',
      onlyDiffs:  false,
      help:       false,
    });
  });

  it('parses --format json', () => {
    const args = parseCliArgs(['--staging', 'a', '--production', 'b', '--format', 'json']);
    expect(args.format).toBe('json');
  });

  it('parses --only-diffs flag', () => {
    const args = parseCliArgs(['--staging', 'a', '--production', 'b', '--only-diffs']);
    expect(args.onlyDiffs).toBe(true);
  });

  it('falls back to text for unknown format', () => {
    const args = parseCliArgs(['--staging', 'a', '--production', 'b', '--format', 'yaml']);
    expect(args.format).toBe('text');
  });

  it('exits when --staging is missing', () => {
    expect(() => parseCliArgs(['--production', 'b'])).toThrow('process.exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('exits when --production is missing', () => {
    expect(() => parseCliArgs(['--staging', 'a'])).toThrow('process.exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('prints help and exits 0 for --help', () => {
    expect(() => parseCliArgs(['--help'])).toThrow('process.exit');
    expect(logSpy).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});
