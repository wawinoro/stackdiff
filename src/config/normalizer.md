# Config Normalizer

The `normalizer` module standardizes config values and keys to ensure consistency across environments.

## Functions

### `normalizeValue(value, opts)`

Applies normalization transforms to a single string value.

**Options:**
- `trimWhitespace` — trims leading/trailing whitespace
- `collapseWhitespace` — collapses multiple internal spaces to one
- `uppercaseValues` — converts value to uppercase

### `normalizeKey(key, opts)`

Applies normalization transforms to a config key.

**Options:**
- `trimWhitespace` — trims key whitespace
- `lowercaseKeys` — converts key to lowercase

### `normalizeConfig(config, opts)`

Applies normalization to an entire config record. Returns:
- `normalized` — the transformed config
- `changes` — list of `{ key, from, to }` describing what changed

### `formatNormalizeResult(result)`

Returns a human-readable summary of normalization changes.

## CLI Usage

```
stackdiff normalize <input> [--output <path>] [--format env|json|yaml]
  [--trim] [--lowercase-keys] [--uppercase-values]
  [--collapse-whitespace] [--dry-run]
```

## Example

```
stackdiff normalize staging.env --trim --lowercase-keys --output staging.normalized.env
```

Outputs:
```
Normalized 3 value(s):
  DB_HOST: "  localhost  " → "localhost"
  ...
Written to staging.normalized.env
```
