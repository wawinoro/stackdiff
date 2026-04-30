import { ConfigMap } from './loader';

export interface Annotation {
  key: string;
  note: string;
  author?: string;
  createdAt: string;
}

export type AnnotationMap = Record<string, Annotation[]>;

export function addAnnotation(
  annotations: AnnotationMap,
  key: string,
  note: string,
  author?: string
): AnnotationMap {
  const entry: Annotation = {
    key,
    note,
    author,
    createdAt: new Date().toISOString(),
  };
  const existing = annotations[key] ?? [];
  return { ...annotations, [key]: [...existing, entry] };
}

export function removeAnnotations(
  annotations: AnnotationMap,
  key: string
): AnnotationMap {
  const result = { ...annotations };
  delete result[key];
  return result;
}

export function getAnnotations(
  annotations: AnnotationMap,
  key: string
): Annotation[] {
  return annotations[key] ?? [];
}

export function annotateConfig(
  config: ConfigMap,
  annotations: AnnotationMap
): { config: ConfigMap; annotations: AnnotationMap } {
  const validKeys = Object.keys(config);
  const filtered: AnnotationMap = {};
  for (const key of Object.keys(annotations)) {
    if (validKeys.includes(key)) {
      filtered[key] = annotations[key];
    }
  }
  return { config, annotations: filtered };
}

export function formatAnnotationReport(
  annotations: AnnotationMap
): string {
  const lines: string[] = ['Annotations:'];
  const keys = Object.keys(annotations).sort();
  if (keys.length === 0) {
    lines.push('  (none)');
    return lines.join('\n');
  }
  for (const key of keys) {
    for (const ann of annotations[key]) {
      const author = ann.author ? ` [${ann.author}]` : '';
      lines.push(`  ${key}${author}: ${ann.note}`);
    }
  }
  return lines.join('\n');
}
