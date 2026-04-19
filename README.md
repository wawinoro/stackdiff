# stackdiff

> CLI tool to compare environment configs across staging and production stacks

## Installation

```bash
npm install -g stackdiff
```

## Usage

Compare environment configurations between two stacks:

```bash
stackdiff --source staging --target production
```

Specify a config file explicitly:

```bash
stackdiff --source staging --target production --config ./env.config.json
```

### Example Output

```
~ API_URL        staging.example.com  →  production.example.com
+ FEATURE_FLAG   true                 →  (not set)
- LOG_LEVEL      (not set)            →  error
```

### Options

| Flag | Description |
|------|-------------|
| `--source` | Source stack to compare from |
| `--target` | Target stack to compare against |
| `--config` | Path to config file (default: `stackdiff.config.json`) |
| `--output` | Output format: `text`, `json`, `table` (default: `text`) |

## Development

```bash
git clone https://github.com/your-org/stackdiff.git
cd stackdiff
npm install
npm run build
```

## License

[MIT](LICENSE)