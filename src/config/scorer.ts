import { ConfigMap } from "./loader";

export interface ScoreResult {
  total: number;
  breakdown: Record<string, number>;
  grade: "A" | "B" | "C" | "D" | "F";
  suggestions: string[];
}

const MAX_SCORE = 100;

export function scoreCompleteness(config: ConfigMap): number {
  const values = Object.values(config);
  if (values.length === 0) return 0;
  const filled = values.filter((v) => v !== "" && v !== undefined && v !== null);
  return Math.round((filled.length / values.length) * 30);
}

export function scoreConsistency(config: ConfigMap): number {
  const keys = Object.keys(config);
  if (keys.length === 0) return 0;
  const upperSnake = keys.filter((k) => /^[A-Z][A-Z0-9_]*$/.test(k));
  return Math.round((upperSnake.length / keys.length) * 25);
}

export function scoreSecretSafety(config: ConfigMap): number {
  const secretPattern = /secret|password|token|key|pwd|pass/i;
  const secretKeys = Object.keys(config).filter((k) => secretPattern.test(k));
  if (secretKeys.length === 0) return 20;
  const masked = secretKeys.filter((k) => {
    const v = config[k];
    return typeof v === "string" && /^\*+$|^\[redacted\]$/i.test(v);
  });
  return Math.round((masked.length / secretKeys.length) * 20);
}

export function scoreCoverage(config: ConfigMap, requiredKeys: string[]): number {
  if (requiredKeys.length === 0) return 25;
  const present = requiredKeys.filter((k) => k in config);
  return Math.round((present.length / requiredKeys.length) * 25);
}

export function scoreConfig(
  config: ConfigMap,
  requiredKeys: string[] = []
): ScoreResult {
  const completeness = scoreCompleteness(config);
  const consistency = scoreConsistency(config);
  const secretSafety = scoreSecretSafety(config);
  const coverage = scoreCoverage(config, requiredKeys);

  const total = completeness + consistency + secretSafety + coverage;

  const suggestions: string[] = [];
  if (completeness < 25) suggestions.push("Fill in missing config values.");
  if (consistency < 20) suggestions.push("Use UPPER_SNAKE_CASE for all keys.");
  if (secretSafety < 15) suggestions.push("Mask or redact secret values.");
  if (coverage < 20 && requiredKeys.length > 0)
    suggestions.push("Add missing required keys.");

  const grade =
    total >= 90 ? "A" :
    total >= 75 ? "B" :
    total >= 60 ? "C" :
    total >= 45 ? "D" : "F";

  return {
    total,
    breakdown: { completeness, consistency, secretSafety, coverage },
    grade,
    suggestions,
  };
}

export function formatScoreResult(result: ScoreResult): string {
  const lines: string[] = [
    `Score: ${result.total}/${MAX_SCORE}  Grade: ${result.grade}`,
    `  Completeness : ${result.breakdown.completeness}/30`,
    `  Consistency  : ${result.breakdown.consistency}/25`,
    `  Secret Safety: ${result.breakdown.secretSafety}/20`,
    `  Coverage     : ${result.breakdown.coverage}/25`,
  ];
  if (result.suggestions.length > 0) {
    lines.push("Suggestions:");
    result.suggestions.forEach((s) => lines.push(`  - ${s}`));
  }
  return lines.join("\n");
}
