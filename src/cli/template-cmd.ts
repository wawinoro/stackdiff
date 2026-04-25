import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../config/loader';
import { buildContext, renderTemplate } from '../config/templater';
import { exportConfig } from '../config/exporter';

export interface TemplateArgs {
  input: string;
  vars: Record<string, string>;
  env?: string;
  format: 'env' | 'json' | 'yaml';
  output?: string;
  strict: boolean;
}

export function parseTemplateArgs(argv: string[]): TemplateArgs {
  const args: TemplateArgs = {
    input: '',
    vars: {},
    format: 'env',
    strict: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--input' || arg === '-i') args.input = argv[++i];
    else if (arg === '--output' || arg === '-o') args.output = argv[++i];
    else if (arg === '--env') args.env = argv[++i];
    else if (arg === '--format' || arg === '-f') args.format = argv[++i] as TemplateArgs['format'];
    else if (arg === '--strict') args.strict = true;
    else if (arg.startsWith('--var=')) {
      const [k, v] = arg.slice(6).split('=');
      if (k && v !== undefined) args.vars[k] = v;
    }
  }

  if (!args.input) throw new Error('--input is required for template command');
  return args;
}

export async function runTemplateCmd(args: TemplateArgs): Promise<void> {
  const config = await loadConfig(args.input);
  const ctx = buildContext(args.vars, args.env);
  const { config: rendered, unresolved } = renderTemplate(config, ctx);

  if (unresolved.length > 0) {
    const msg = `Unresolved template variables: ${unresolved.join(', ')}`;
    if (args.strict) throw new Error(msg);
    console.warn(`[warn] ${msg}`);
  }

  const output = exportConfig(rendered, args.format);

  if (args.output) {
    fs.mkdirSync(path.dirname(args.output), { recursive: true });
    fs.writeFileSync(args.output, output, 'utf-8');
    console.log(`Rendered config written to ${args.output}`);
  } else {
    process.stdout.write(output + '\n');
  }
}
