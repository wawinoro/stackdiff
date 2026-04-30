# Annotator

The `annotator` module lets you attach human-readable notes to individual config keys. Annotations are stored in a sidecar JSON file (`.annotations.json` by default) alongside the config file.

## API

### `addAnnotation(annotations, key, note, author?)`
Returns a new `AnnotationMap` with the note appended to the given key's list.

### `removeAnnotations(annotations, key)`
Returns a new `AnnotationMap` with all annotations for `key` removed.

### `getAnnotations(annotations, key)`
Returns the list of `Annotation` objects for the given key, or `[]` if none exist.

### `annotateConfig(config, annotations)`
Filters the annotation map to only include keys present in `config`. Useful for cleaning up stale annotations after a config is modified.

### `formatAnnotationReport(annotations)`
Returns a human-readable string listing all annotations grouped by key.

## CLI Usage

```bash
# Add an annotation
stackdiff annotate --config staging.env --action add --key DB_HOST --note "Points to RDS" --author alice

# Remove annotations for a key
stackdiff annotate --config staging.env --action remove --key DB_HOST

# List all annotations
stackdiff annotate --config staging.env --action list

# Use a custom annotation file
stackdiff annotate --config staging.env --action list --ann-file ./notes.json
```

## Annotation File Format

```json
{
  "DB_HOST": [
    {
      "key": "DB_HOST",
      "note": "Points to RDS",
      "author": "alice",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```
