import { ConfigRecord } from './loader';

export type FieldType = 'string' | 'number' | 'boolean';

export interface FieldSchema {
  type: FieldType;
  required?: boolean;
  default?: string | number | boolean;
}

export type ConfigSchema = Record<string, FieldSchema>;

export interface SchemaValidationError {
  key: string;
  message: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
}

export function validateAgainstSchema(
  config: ConfigRecord,
  schema: ConfigSchema
): SchemaValidationResult {
  const errors: SchemaValidationError[] = [];

  for (const [key, field] of Object.entries(schema)) {
    const value = config[key];

    if (field.required && (value === undefined || value === '')) {
      errors.push({ key, message: `required field "${key}" is missing` });
      continue;
    }

    if (value === undefined) continue;

    if (field.type === 'number' && isNaN(Number(value))) {
      errors.push({ key, message: `field "${key}" must be a number, got "${value}"` });
    } else if (field.type === 'boolean' && !['true', 'false', '1', '0'].includes(String(value).toLowerCase())) {
      errors.push({ key, message: `field "${key}" must be a boolean, got "${value}"` });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function applySchemaDefaults(
  config: ConfigRecord,
  schema: ConfigSchema
): ConfigRecord {
  const result: ConfigRecord = { ...config };
  for (const [key, field] of Object.entries(schema)) {
    if (result[key] === undefined && field.default !== undefined) {
      result[key] = String(field.default);
    }
  }
  return result;
}
