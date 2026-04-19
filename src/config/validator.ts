import { z } from 'zod';

export const ConfigSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()])
);

export type Config = z.infer<typeof ConfigSchema>;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateConfig(raw: unknown): ValidationResult {
  const result = ConfigSchema.safeParse(raw);

  if (result.success) {
    return { valid: true, errors: [] };
  }

  const errors = result.error.issues.map(
    (issue) => `[${issue.path.join('.')}] ${issue.message}`
  );

  return { valid: false, errors };
}

export function assertValidConfig(raw: unknown, label = 'config'): Config {
  const { valid, errors } = validateConfig(raw);
  if (!valid) {
    throw new Error(
      `Invalid ${label}:\n` + errors.map((e) => `  - ${e}`).join('\n')
    );
  }
  return raw as Config;
}
