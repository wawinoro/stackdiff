# Config Flattener

The flattener module converts nested configuration objects into flat dot-notation key/value pairs and back.

## Functions

### `flattenConfig(obj, prefix?, separator?)`

Recursively flattens a nested config object.

```ts
flattenConfig({ db: { host: "localhost", port: "5432" } })
// => { "db.host": "localhost", "db.port": "5432" }
```

- `separator` defaults to `"."`
- Arrays are serialized as JSON strings
- `null` values become empty strings

### `unflattenConfig(flat, separator?)`

Restores a nested object from a flat dot-notation map.

```ts
unflattenConfig({ "db.host": "localhost" })
// => { db: { host: "localhost" } }
```

### `flattenKeys(obj, separator?)`

Returns all flattened key names without values.

## CLI Usage

```bash
# Flatten a nested JSON config to .env format
stackdiff flatten --input config.json --format env

# Use double-underscore separator (common for env vars)
stackdiff flatten --input config.json --separator __ --format env

# Unflatten a flat .env back to JSON
stackdiff flatten --input flat.env --reverse --format json --output nested.json
```

## Options

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--input` | `-i` | Input config file | required |
| `--output` | `-o` | Output file path | stdout |
| `--separator` | `-s` | Key separator | `.` |
| `--reverse` | `-r` | Unflatten instead | false |
| `--format` | `-f` | Output format: env/json/yaml | `env` |
