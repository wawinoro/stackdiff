import { renderValue, renderTemplate, collectUnresolved, buildContext } from './templater';

describe('renderValue', () => {
  it('replaces known vars', () => {
    const ctx = buildContext({ HOST: 'localhost', PORT: '5432' });
    expect(renderValue('postgres://{{ HOST }}:{{ PORT }}/db', ctx)).toBe(
      'postgres://localhost:5432/db'
    );
  });

  it('leaves unknown vars as-is', () => {
    const ctx = buildContext({});
    expect(renderValue('{{ UNKNOWN }}', ctx)).toBe('{{ UNKNOWN }}');
  });

  it('replaces env token when env provided', () => {
    const ctx = buildContext({}, 'production');
    expect(renderValue('app-{{ env }}', ctx)).toBe('app-production');
  });
});

describe('collectUnresolved', () => {
  it('returns empty array for fully resolved value', () => {
    expect(collectUnresolved('hello world')).toEqual([]);
  });

  it('returns unresolved keys', () => {
    expect(collectUnresolved('{{ FOO }} and {{ BAR }}')).toEqual(['FOO', 'BAR']);
  });
});

describe('renderTemplate', () => {
  it('renders all string values', () => {
    const config = { DB_URL: 'postgres://{{ HOST }}/mydb', TIMEOUT: '30' };
    const ctx = buildContext({ HOST: '10.0.0.1' });
    const { config: out, unresolved } = renderTemplate(config, ctx);
    expect(out.DB_URL).toBe('postgres://10.0.0.1/mydb');
    expect(out.TIMEOUT).toBe('30');
    expect(unresolved).toEqual([]);
  });

  it('reports unresolved keys', () => {
    const config = { URL: 'http://{{ HOST }}:{{ PORT }}' };
    const ctx = buildContext({ HOST: 'localhost' });
    const { unresolved } = renderTemplate(config, ctx);
    expect(unresolved).toContain('PORT');
    expect(unresolved).not.toContain('HOST');
  });

  it('deduplicates unresolved keys', () => {
    const config = { A: '{{ X }}', B: '{{ X }}' };
    const { unresolved } = renderTemplate(config, buildContext({}));
    expect(unresolved.filter(k => k === 'X').length).toBe(1);
  });
});
