# Snapshotter

The `snapshotter` module allows you to capture, persist, and compare point-in-time snapshots of config files.

## API

### `createSnapshot(config, label)`
Creates an in-memory snapshot object with a timestamp and label.

### `saveSnapshot(snapshot, dir)`
Persists a snapshot as a JSON file under the given directory. Returns the file path.

### `loadSnapshot(filepath)`
Loads and validates a snapshot from disk.

### `listSnapshots(dir)`
Returns a sorted list of snapshot file paths in the given directory.

### `diffSnapshots(a, b)`
Compares two snapshots and returns:
- `added` — keys present in `b` but not `a`
- `removed` — keys present in `a` but not `b`
- `changed` — keys present in both with differing values, as `[oldValue, newValue]` tuples

### `deleteSnapshot(filepath)`
Deletes a snapshot file from disk. Throws if the file does not exist or cannot be removed.

## CLI Usage

```bash
# Save a snapshot
stackdiff snapshot save --file staging.env --label staging

# List snapshots
stackdiff snapshot list --dir .snapshots

# Diff two snapshots
stackdiff snapshot diff --a .snapshots/staging-2024-01-01.json --b .snapshots/staging-2024-02-01.json

# Delete a snapshot
stackdiff snapshot delete --file .snapshots/staging-2024-01-01.json
```

## Snapshot File Format

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "label": "staging",
  "config": {
    "DB_HOST": "db.staging.example.com",
    "PORT": "3000"
  }
}
```
