import { ConfigMap } from './loader';

export interface MigrationRule {
  version: number;
  description: string;
  up: (config: ConfigMap) => ConfigMap;
}

export interface MigrationResult {
  fromVersion: number;
  toVersion: number;
  applied: string[];
  config: ConfigMap;
}

const MIGRATIONS: MigrationRule[] = [
  {
    version: 1,
    description: 'Rename DB_HOST to DATABASE_HOST',
    up: (config) => {
      const next = { ...config };
      if ('DB_HOST' in next) {
        next['DATABASE_HOST'] = next['DB_HOST'];
        delete next['DB_HOST'];
      }
      return next;
    },
  },
  {
    version: 2,
    description: 'Prefix all cache keys with CACHE_',
    up: (config) => {
      const next: ConfigMap = {};
      for (const [k, v] of Object.entries(config)) {
        if (/^REDIS_/.test(k) && !k.startsWith('CACHE_')) {
          next[`CACHE_${k}`] = v;
        } else {
          next[k] = v;
        }
      }
      return next;
    },
  },
];

export function getConfigVersion(config: ConfigMap): number {
  const v = config['CONFIG_VERSION'];
  return v !== undefined ? parseInt(String(v), 10) : 0;
}

export function migrateConfig(
  config: ConfigMap,
  targetVersion?: number
): MigrationResult {
  const fromVersion = getConfigVersion(config);
  const maxVersion = targetVersion ?? Math.max(...MIGRATIONS.map((m) => m.version), fromVersion);

  let current = { ...config };
  const applied: string[] = [];

  for (const migration of MIGRATIONS) {
    if (migration.version > fromVersion && migration.version <= maxVersion) {
      current = migration.up(current);
      applied.push(`v${migration.version}: ${migration.description}`);
    }
  }

  current['CONFIG_VERSION'] = String(maxVersion);

  return {
    fromVersion,
    toVersion: maxVersion,
    applied,
    config: current,
  };
}

export function formatMigrationResult(result: MigrationResult): string {
  const lines: string[] = [
    `Migration: v${result.fromVersion} → v${result.toVersion}`,
  ];
  if (result.applied.length === 0) {
    lines.push('  No migrations applied.');
  } else {
    result.applied.forEach((a) => lines.push(`  ✔ ${a}`));
  }
  return lines.join('\n');
}
