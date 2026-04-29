# Promoter

The `promoter` module handles promoting configuration keys from one environment (e.g. staging) to another (e.g. production).

## Functions

### `promoteConfig(source, target, opts?)`

Compares `source` and `target` configs and computes what can be promoted.

**Options:**
- `overwrite` — overwrite conflicting keys in target (default: `false`)
- `dryRun` — compute result without applying changes (default: `false`)
- `keys` — restrict promotion to a specific list of keys

**Returns a `PromoteResult`:**
```ts
{
  promoted: Record<string, string>;   // keys to be applied
  skipped: Record<string, string>;    // keys not found in source
  conflicts: Record<string, { from: string; to: string }>; // differing values
}
```

### `applyPromotion(target, result)`

Merges `result.promoted` into `target`, returning a new config object.

### `formatPromoteResult(result)`

Returns a human-readable summary of the promotion result.

## CLI Usage

```bash
stackdiff promote --source staging.env --target production.env
stackdiff promote --source staging.env --target production.env --overwrite
stackdiff promote --source staging.env --target production.env --keys DB_HOST,DB_PORT
stackdiff promote --source staging.env --target production.env --dry-run
stackdiff promote --source staging.env --target production.env --output promoted.env --format json
```

## Conflict Handling

When a key exists in both source and target with different values, it is recorded as a conflict and **not** promoted unless `--overwrite` is passed. The CLI exits with code 1 if unresolved conflicts remain.
