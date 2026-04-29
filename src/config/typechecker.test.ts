import { checkType, typecheckConfig, formatTypecheckResult, TypeRule } from "./typechecker";

describe("checkType", () => {
  it("passes valid number", () => {
    expect(checkType("PORT", "3000", "number")).toBeNull();
  });

  it("fails invalid number", () => {
    const result = checkType("PORT", "abc", "number");
    expect(result).not.toBeNull();
    expect(result?.expectedType).toBe("number");
  });

  it("passes valid boolean", () => {
    expect(checkType("DEBUG", "true", "boolean")).toBeNull();
    expect(checkType("DEBUG", "0", "boolean")).toBeNull();
  });

  it("fails invalid boolean", () => {
    const result = checkType("DEBUG", "yes", "boolean");
    expect(result).not.toBeNull();
  });

  it("passes valid URL", () => {
    expect(checkType("API_URL", "https://example.com", "url")).toBeNull();
  });

  it("fails invalid URL", () => {
    const result = checkType("API_URL", "not-a-url", "url");
    expect(result).not.toBeNull();
    expect(result?.reason).toContain("not a valid URL");
  });

  it("passes valid email", () => {
    expect(checkType("ADMIN_EMAIL", "admin@example.com", "email")).toBeNull();
  });

  it("fails invalid email", () => {
    const result = checkType("ADMIN_EMAIL", "not-an-email", "email");
    expect(result).not.toBeNull();
  });

  it("passes valid JSON", () => {
    expect(checkType("OPTS", '{"key":"val"}', "json")).toBeNull();
  });

  it("fails invalid JSON", () => {
    const result = checkType("OPTS", "{bad json}", "json");
    expect(result).not.toBeNull();
  });

  it("passes string type always", () => {
    expect(checkType("NAME", "anything", "string")).toBeNull();
  });
});

describe("typecheckConfig", () => {
  const rules: TypeRule[] = [
    { key: "PORT", expectedType: "number" },
    { key: "API_URL", expectedType: "url" },
    { key: "DEBUG", expectedType: "boolean" },
  ];

  it("returns no violations for valid config", () => {
    const config = { PORT: "8080", API_URL: "https://api.example.com", DEBUG: "false" };
    const result = typecheckConfig(config, rules);
    expect(result.violations).toHaveLength(0);
    expect(result.checkedCount).toBe(3);
    expect(result.passedCount).toBe(3);
  });

  it("detects violations", () => {
    const config = { PORT: "not-a-port", API_URL: "https://ok.com", DEBUG: "maybe" };
    const result = typecheckConfig(config, rules);
    expect(result.violations).toHaveLength(2);
    expect(result.passedCount).toBe(1);
  });

  it("skips keys not present in config", () => {
    const result = typecheckConfig({}, rules);
    expect(result.checkedCount).toBe(0);
  });
});

describe("formatTypecheckResult", () => {
  it("formats result with violations", () => {
    const result = {
      violations: [{ key: "PORT", value: "abc", expectedType: "number", reason: '"abc" is not a valid number' }],
      checkedCount: 2,
      passedCount: 1,
    };
    const output = formatTypecheckResult(result);
    expect(output).toContain("Violations: 1");
    expect(output).toContain("PORT");
  });

  it("formats clean result", () => {
    const result = { violations: [], checkedCount: 3, passedCount: 3 };
    const output = formatTypecheckResult(result);
    expect(output).toContain("Violations: 0");
  });
});
