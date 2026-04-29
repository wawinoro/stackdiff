import { Config } from "./loader";

export type TypeRule = {
  key: string;
  expectedType: "string" | "number" | "boolean" | "url" | "email" | "json";
};

export type TypeViolation = {
  key: string;
  value: string;
  expectedType: string;
  reason: string;
};

export type TypeCheckResult = {
  violations: TypeViolation[];
  checkedCount: number;
  passedCount: number;
};

const TYPE_PATTERNS: Record<string, RegExp> = {
  url: /^https?:\/\/.+/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export function checkType(
  key: string,
  value: string,
  expectedType: TypeRule["expectedType"]
): TypeViolation | null {
  switch (expectedType) {
    case "number":
      if (isNaN(Number(value))) {
        return { key, value, expectedType, reason: `"${value}" is not a valid number` };
      }
      break;
    case "boolean":
      if (!["true", "false", "1", "0"].includes(value.toLowerCase())) {
        return { key, value, expectedType, reason: `"${value}" is not a valid boolean` };
      }
      break;
    case "url":
      if (!TYPE_PATTERNS.url.test(value)) {
        return { key, value, expectedType, reason: `"${value}" is not a valid URL` };
      }
      break;
    case "email":
      if (!TYPE_PATTERNS.email.test(value)) {
        return { key, value, expectedType, reason: `"${value}" is not a valid email` };
      }
      break;
    case "json":
      try {
        JSON.parse(value);
      } catch {
        return { key, value, expectedType, reason: `"${value}" is not valid JSON` };
      }
      break;
    case "string":
    default:
      break;
  }
  return null;
}

export function typecheckConfig(
  config: Config,
  rules: TypeRule[]
): TypeCheckResult {
  const violations: TypeViolation[] = [];
  let checkedCount = 0;

  for (const rule of rules) {
    const value = config[rule.key];
    if (value === undefined) continue;
    checkedCount++;
    const violation = checkType(rule.key, value, rule.expectedType);
    if (violation) violations.push(violation);
  }

  return {
    violations,
    checkedCount,
    passedCount: checkedCount - violations.length,
  };
}

export function formatTypecheckResult(result: TypeCheckResult): string {
  const lines: string[] = [];
  lines.push(`Checked: ${result.checkedCount}, Passed: ${result.passedCount}, Violations: ${result.violations.length}`);
  for (const v of result.violations) {
    lines.push(`  [${v.expectedType}] ${v.key}: ${v.reason}`);
  }
  return lines.join("\n");
}
