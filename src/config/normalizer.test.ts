import { normalizeConfig, normalizeValue, normalizeKey, formatNormalizeResult } from "./normalizer";

describe("normalizeValue", () => {
  it("trims whitespace", () => {
    expect(normalizeValue("  hello  ", { trimWhitespace: true })).toBe("hello");
  });

  it("uppercases values", () => {
    expect(normalizeValue("hello", { uppercaseValues: true })).toBe("HELLO");
  });

  it("collapses internal whitespace", () => {
    expect(normalizeValue("foo   bar", { collapseWhitespace: true })).toBe("foo bar");
  });

  it("applies multiple options", () => {
    expect(normalizeValue("  foo   bar  ", { trimWhitespace: true, collapseWhitespace: true })).toBe("foo bar");
  });

  it("returns value unchanged with no options", () => {
    expect(normalizeValue("  hello  ", {})).toBe("  hello  ");
  });
});

describe("normalizeKey", () => {
  it("lowercases keys", () => {
    expect(normalizeKey("DB_HOST", { lowercaseKeys: true })).toBe("db_host");
  });

  it("trims key whitespace", () => {
    expect(normalizeKey(" KEY ", { trimWhitespace: true })).toBe("KEY");
  });
});

describe("normalizeConfig", () => {
  it("normalizes all keys and values", () => {
    const result = normalizeConfig(
      { DB_HOST: "  localhost  ", API_KEY: "  secret  " },
      { trimWhitespace: true, lowercaseKeys: true }
    );
    expect(result.normalized).toEqual({ db_host: "localhost", api_key: "secret" });
    expect(result.changes).toHaveLength(2);
  });

  it("records no changes when config is already normalized", () => {
    const result = normalizeConfig({ host: "localhost" }, { trimWhitespace: true });
    expect(result.changes).toHaveLength(0);
  });

  it("returns empty config for empty input", () => {
    const result = normalizeConfig({}, { trimWhitespace: true });
    expect(result.normalized).toEqual({});
    expect(result.changes).toHaveLength(0);
  });
});

describe("formatNormalizeResult", () => {
  it("reports no changes", () => {
    expect(formatNormalizeResult({ normalized: {}, changes: [] })).toBe("No normalization changes applied.");
  });

  it("formats changes list", () => {
    const result = formatNormalizeResult({
      normalized: { host: "localhost" },
      changes: [{ key: "HOST", from: "  localhost  ", to: "localhost" }],
    });
    expect(result).toContain("Normalized 1 value(s)");
    expect(result).toContain("HOST");
  });
});
