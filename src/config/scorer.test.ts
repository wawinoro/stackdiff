import {
  scoreCompleteness,
  scoreConsistency,
  scoreSecretSafety,
  scoreCoverage,
  scoreConfig,
  formatScoreResult,
} from "./scorer";

describe("scoreCompleteness", () => {
  it("returns 0 for empty config", () => {
    expect(scoreCompleteness({})).toBe(0);
  });

  it("returns 30 when all values are filled", () => {
    expect(scoreCompleteness({ A: "x", B: "y" })).toBe(30);
  });

  it("returns partial score for partially filled config", () => {
    expect(scoreCompleteness({ A: "x", B: "" })).toBe(15);
  });
});

describe("scoreConsistency", () => {
  it("returns 0 for empty config", () => {
    expect(scoreConsistency({})).toBe(0);
  });

  it("returns 25 when all keys are UPPER_SNAKE_CASE", () => {
    expect(scoreConsistency({ FOO_BAR: "1", BAZ: "2" })).toBe(25);
  });

  it("penalises lowercase keys", () => {
    expect(scoreConsistency({ fooBar: "1", BAZ: "2" })).toBe(13);
  });
});

describe("scoreSecretSafety", () => {
  it("returns 20 when no secret keys exist", () => {
    expect(scoreSecretSafety({ HOST: "localhost" })).toBe(20);
  });

  it("returns 20 when all secrets are masked", () => {
    expect(scoreSecretSafety({ DB_PASSWORD: "***" })).toBe(20);
  });

  it("returns 0 when secrets are unmasked", () => {
    expect(scoreSecretSafety({ API_TOKEN: "abc123" })).toBe(0);
  });
});

describe("scoreCoverage", () => {
  it("returns 25 with no required keys", () => {
    expect(scoreCoverage({}, [])).toBe(25);
  });

  it("returns 25 when all required keys present", () => {
    expect(scoreCoverage({ A: "1", B: "2" }, ["A", "B"])).toBe(25);
  });

  it("returns partial score for missing required keys", () => {
    expect(scoreCoverage({ A: "1" }, ["A", "B"])).toBe(13);
  });
});

describe("scoreConfig", () => {
  it("assigns grade A for a well-formed config", () => {
    const config = { HOST: "localhost", PORT: "3000", DB_PASSWORD: "***" };
    const result = scoreConfig(config, ["HOST", "PORT"]);
    expect(result.grade).toBe("A");
    expect(result.total).toBeGreaterThanOrEqual(90);
  });

  it("assigns grade F for an empty config with required keys", () => {
    const result = scoreConfig({}, ["HOST", "PORT"]);
    expect(result.grade).toBe("F");
  });

  it("includes suggestions when scores are low", () => {
    const result = scoreConfig({ foo: "" }, ["HOST"]);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });
});

describe("formatScoreResult", () => {
  it("includes grade and breakdown in output", () => {
    const result = scoreConfig({ HOST: "localhost", PORT: "8080" }, ["HOST"]);
    const output = formatScoreResult(result);
    expect(output).toContain("Grade:");
    expect(output).toContain("Completeness");
    expect(output).toContain("Coverage");
  });
});
