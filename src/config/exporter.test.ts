import { exportConfig, exportAsEnv, exportAsJson, exportAsYaml } from './exporter';

const sample = {
  APP_NAME: 'stackdiff',
  PORT: '3000',
  DB_URL: 'postgres://localhost:5432/db',
  DEBUG: 'true',
};

describe('exportAsEnv', () => {
  it('formats key=value lines', () => {
    const out = exportAsEnv({ KEY: 'val' });
    expect(out).toBe('KEY=val');
  });

  it('handles multiple keys', () => {
    const out = exportAsEnv({ A: '1', B: '2' });
    expect(out).toBe('A=1\nB=2');
  });
});

describe('exportAsJson', () => {
  it('produces valid JSON', () => {
    const out = exportAsJson(sample);
    expect(JSON.parse(out)).toEqual(sample);
  });

  it('compact mode', () => {
    const out = exportAsJson({ K: 'v' }, false);
    expect(out).toBe('{"K":"v"}');
  });
});

describe('exportAsYaml', () => {
  it('quotes values with colons', () => {
    const out = exportAsYaml({ DB_URL: 'postgres://localhost:5432/db' });
    expect(out).toContain('"postgres://localhost:5432/db"');
  });

  it('plain values unquoted', () => {
    const out = exportAsYaml({ PORT: '3000' });
    expect(out).toBe('PORT: 3000');
  });
});

describe('exportConfig', () => {
  it('defaults to env format', () => {
    const out = exportConfig({ X: 'y' });
    expect(out).toBe('X=y');
  });

  it('dispatches to json', () => {
    const out = exportConfig({ X: 'y' }, 'json');
    expect(JSON.parse(out)).toEqual({ X: 'y' });
  });

  it('dispatches to yaml', () => {
    const out = exportConfig({ X: 'y' }, 'yaml');
    expect(out).toBe('X: y');
  });
});
