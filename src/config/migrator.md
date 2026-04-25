# Config Migrator

The migrator module provides versioned, incremental config migrations for `stackdiff`.

## Overview

As your stack evolves, key names and conventions change. The migrator lets you define ordered migration rules that transform a config map from one version to the next.

## Usage

```ts
import { migrateConfig, formatMigrationResult } from './migrator';

const config = { DB_HOST: 'localhost', PORT: '5432' };
const result = migrateConfig(config, 2);
console.log(formatMigrationResult(result));
// Migration: v0 → v2
//   ✔ v1: Rename DB_HOST to DATABASE_HOST
//   ✔ v2: Prefix all cache keys with CACHE_
```

## CLI

```bash
stackdiff migrate --input staging.env --output staging.migrated.env --target-version 2
stackdiff migrate --input prod.env --dry-run
```

### Options

| Flag               | Description                              |
|--------------------|------------------------------------------|
| `--input, -i`      | Path to the source config file           |
| `--output, -o`     | Path to write migrated config (optional) |
| `--target-version` | Target migration version (default: max)  |
| `--dry-run`        | Preview changes without writing          |
| `--format, -f`     | Output format: `env`, `json`, `yaml`     |

## Adding Migrations

Edit `src/config/migrator.ts` and append a new entry to the `MIGRATIONS` array:

```ts
{
  version: 3,
  description: 'Rename LOG_LEVEL to LOGGING_LEVEL',
  up: (config) => {
    const next = { ...config };
    if ('LOG_LEVEL' in next) {
      next['LOGGING_LEVEL'] = next['LOG_LEVEL'];
      delete next['LOG_LEVEL'];
    }
    return next;
  },
}
```

Versions must be monotonically increasing integers. Migrations are applied in order and skipped if the config's `CONFIG_VERSION` is already at or above that version.
