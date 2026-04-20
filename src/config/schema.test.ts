import { validateAgainstSchema, applySchemaDefaults, ConfigSchema } from './schema';

const schema: ConfigSchema = {
  PORT: { type: 'number', required: true },
  DEBUG: { type: 'boolean', required: false, default: 'false' },
  APP_NAME: { type: 'string', required: true },
  TIMEOUT: { type: 'number', required: false, default: '30' },
};

describe('validateAgainstSchema', () => {
  it('passes with valid config', () => {
    const result = validateAgainstSchema(
      { PORT: '8080', APP_NAME: 'myapp', DEBUG: 'true' },
      schema
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('reports missing required fields', () => {
    const result = validateAgainstSchema({ PORT: '8080' }, schema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ key: 'APP_NAME' })
    );
  });

  it('reports invalid number', () => {
    const result = validateAgainstSchema(
      { PORT: 'not-a-number', APP_NAME: 'app' },
      schema
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0].key).toBe('PORT');
  });

  it('reports invalid boolean', () => {
    const result = validateAgainstSchema(
      { PORT: '3000', APP_NAME: 'app', DEBUG: 'yes' },
      schema
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0].key).toBe('DEBUG');
  });
});

describe('applySchemaDefaults', () => {
  it('fills in missing defaults', () => {
    const result = applySchemaDefaults({ PORT: '3000', APP_NAME: 'app' }, schema);
    expect(result.DEBUG).toBe('false');
    expect(result.TIMEOUT).toBe('30');
  });

  it('does not override existing values', () => {
    const result = applySchemaDefaults(
      { PORT: '3000', APP_NAME: 'app', DEBUG: 'true' },
      schema
    );
    expect(result.DEBUG).toBe('true');
  });
});
