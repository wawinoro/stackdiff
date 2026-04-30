import {
  addAnnotation,
  removeAnnotations,
  getAnnotations,
  annotateConfig,
  formatAnnotationReport,
  AnnotationMap,
} from './annotator';

describe('addAnnotation', () => {
  it('adds a new annotation to an empty map', () => {
    const result = addAnnotation({}, 'DB_HOST', 'Primary database host');
    expect(result['DB_HOST']).toHaveLength(1);
    expect(result['DB_HOST'][0].note).toBe('Primary database host');
    expect(result['DB_HOST'][0].author).toBeUndefined();
  });

  it('appends annotation to existing key', () => {
    let map = addAnnotation({}, 'DB_HOST', 'First note', 'alice');
    map = addAnnotation(map, 'DB_HOST', 'Second note', 'bob');
    expect(map['DB_HOST']).toHaveLength(2);
    expect(map['DB_HOST'][1].author).toBe('bob');
  });

  it('includes createdAt timestamp', () => {
    const result = addAnnotation({}, 'KEY', 'note');
    expect(result['KEY'][0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });
});

describe('removeAnnotations', () => {
  it('removes annotations for a key', () => {
    const map = addAnnotation({}, 'DB_HOST', 'some note');
    const result = removeAnnotations(map, 'DB_HOST');
    expect(result['DB_HOST']).toBeUndefined();
  });

  it('is a no-op for missing key', () => {
    const result = removeAnnotations({}, 'MISSING');
    expect(result).toEqual({});
  });
});

describe('getAnnotations', () => {
  it('returns empty array for missing key', () => {
    expect(getAnnotations({}, 'MISSING')).toEqual([]);
  });

  it('returns annotations for existing key', () => {
    const map = addAnnotation({}, 'API_KEY', 'secret key');
    expect(getAnnotations(map, 'API_KEY')).toHaveLength(1);
  });
});

describe('annotateConfig', () => {
  it('filters out annotations for keys not in config', () => {
    const config = { DB_HOST: 'localhost' };
    const annotations: AnnotationMap = {
      DB_HOST: [{ key: 'DB_HOST', note: 'ok', createdAt: '' }],
      MISSING_KEY: [{ key: 'MISSING_KEY', note: 'orphan', createdAt: '' }],
    };
    const { annotations: result } = annotateConfig(config, annotations);
    expect(result['DB_HOST']).toBeDefined();
    expect(result['MISSING_KEY']).toBeUndefined();
  });
});

describe('formatAnnotationReport', () => {
  it('shows (none) when empty', () => {
    expect(formatAnnotationReport({})).toContain('(none)');
  });

  it('formats annotations with author', () => {
    const map = addAnnotation({}, 'DB_HOST', 'Primary DB', 'alice');
    const report = formatAnnotationReport(map);
    expect(report).toContain('DB_HOST [alice]: Primary DB');
  });

  it('formats annotations without author', () => {
    const map = addAnnotation({}, 'PORT', 'App port');
    const report = formatAnnotationReport(map);
    expect(report).toContain('PORT: App port');
  });
});
