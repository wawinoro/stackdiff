import { ConfigMap } from './loader';

export interface TemplateContext {
  vars: Record<string, string>;
  env?: string;
}

export interface TemplateResult {
  config: ConfigMap;
  unresolved: string[];
}

const TEMPLATE_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

export function renderValue(value: string, ctx: TemplateContext): string {
  return value.replace(TEMPLATE_RE, (_, key) => {
    if (key in ctx.vars) return ctx.vars[key];
    if (ctx.env && key === 'env') return ctx.env;
    return `{{${key}}}`;
  });
}

export function collectUnresolved(value: string): string[] {
  const unresolved: string[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(TEMPLATE_RE.source, 'g');
  while ((match = re.exec(value)) !== null) {
    unresolved.push(match[1]);
  }
  return unresolved;
}

export function renderTemplate(
  config: ConfigMap,
  ctx: TemplateContext
): TemplateResult {
  const result: ConfigMap = {};
  const unresolved: string[] = [];

  for (const [key, raw] of Object.entries(config)) {
    if (typeof raw !== 'string') {
      result[key] = raw;
      continue;
    }
    const rendered = renderValue(raw, ctx);
    result[key] = rendered;
    const missed = collectUnresolved(rendered);
    unresolved.push(...missed);
  }

  return { config: result, unresolved: [...new Set(unresolved)] };
}

export function buildContext(
  base: Record<string, string>,
  env?: string
): TemplateContext {
  return { vars: { ...base }, env };
}
