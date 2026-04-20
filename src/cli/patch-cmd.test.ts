import { parsePatchArgs, runPatchCmd } from './patch-cmd';
import * as patcher from '../config/patcher';
import * as loader from '../config/loader';
import * as exporter from '../config/exporter';

describe('parsePatchArgs', () => {
  it('parses input and operations', () => {
    const args = parsePatchArgs(['config.env', 'APP_ENV=production', '~DEBUG']);
    expect(args.input).toBe('config.env');
    expect(args.operations).toEqual(['APP_ENV=production', '~DEBUG']);
  });

  it('defaults format to env', () => {
    const args = parsePatchArgs(['config.env']);
    expect(args.format).toBe('env');
  });

  it('parses --format flag', () => {
    const args = parsePatchArgs(['config.env', '--format', 'json']);
    expect(args.format).toBe('json');
  });

  it('parses --dry-run flag', () => {
    const args = parsePatchArgs(['config.env', '--dry-run']);
    expect(args.dryRun).toBe(true);
  });

  it('parses --output flag', () => {
    const args = parsePatchArgs(['config.env', '--output', 'out.env']);
    expect(args.output).toBe('out.env');
  });
});

describe('runPatchCmd', () => {
  const mockConfig = { APP_ENV: 'staging', DEBUG: 'true' };

  beforeEach(() => {
    jest.spyOn(loader, 'loadConfig').mockResolvedValue(mockConfig);
    jest.spyOn(exporter, 'exportConfig').mockReturnValue('APP_ENV=production\n');
    jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => jest.restoreAllMocks());

  it('writes patched config to stdout', async () => {
    await runPatchCmd({
      input: 'config.env',
      operations: ['APP_ENV=production'],
      format: 'env',
      dryRun: false,
    });
    expect(process.stdout.write).toHaveBeenCalledWith('APP_ENV=production\n');
  });

  it('dry-run prints summary without writing', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    await runPatchCmd({
      input: 'config.env',
      operations: ['APP_ENV=production'],
      format: 'env',
      dryRun: true,
    });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Applied:'));
    expect(process.stdout.write).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
