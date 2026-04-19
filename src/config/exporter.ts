import { ConfigMap } from './loader';

export type ExportFormat = 'env' | 'json' | 'yaml';

export function exportAsEnv(config: ConfigMap): string {
  return Object.entries(config)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
}

export function exportAsJson(config: ConfigMap, pretty = true): string {
  return JSON.stringify(config, null, pretty ? 2 : 0);
}

export function exportAsYaml(config: ConfigMap): string {
  return Object.entries(config)
    .map(([k, v]) => {
      const safe = String(v).includes(':') || String(v).includes('#')
        ? `"${v}"`
        : v;
      return `${k}: ${safe}`;
    })
    .join('\n');
}

export function exportConfig(
  config: ConfigMap,
  format: ExportFormat = 'env'
): string {
  switch (format) {
    case 'json':
      return exportAsJson(config);
    case 'yaml':
      return exportAsYaml(config);
    case 'env':
    default:
      return exportAsEnv(config);
  }
}
