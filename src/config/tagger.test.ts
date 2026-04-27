import { tagConfig, filterByTag, listTags, parseTagExpression } from "./tagger";

describe("parseTagExpression", () => {
  it("parses a valid expression", () => {
    expect(parseTagExpression("env:DB_*")).toEqual({ tag: "env", pattern: "DB_*" });
  });

  it("throws on missing colon", () => {
    expect(() => parseTagExpression("badexpr")).toThrow("Invalid tag expression");
  });

  it("handles expression with multiple colons", () => {
    expect(parseTagExpression("group:APP_*")).toEqual({ tag: "group", pattern: "APP_*" });
  });
});

describe("tagConfig", () => {
  const config = {
    DB_HOST: "localhost",
    DB_PORT: "5432",
    APP_NAME: "stackdiff",
    APP_ENV: "staging",
    SECRET_KEY: "abc123",
  };

  it("tags keys matching a wildcard pattern", () => {
    const { tagMap } = tagConfig(config, ["database:DB_*"]);
    expect(tagMap["database"]).toEqual(expect.arrayContaining(["DB_HOST", "DB_PORT"]));
    expect(tagMap["database"]).toHaveLength(2);
  });

  it("tags keys from multiple expressions", () => {
    const { tagMap } = tagConfig(config, ["database:DB_*", "app:APP_*"]);
    expect(tagMap["database"]).toContain("DB_HOST");
    expect(tagMap["app"]).toContain("APP_NAME");
  });

  it("returns empty tagMap entry when no keys match", () => {
    const { tagMap } = tagConfig(config, ["missing:NOPE_*"]);
    expect(tagMap["missing"]).toBeUndefined();
  });

  it("does not duplicate keys within the same tag", () => {
    const { tagMap } = tagConfig(config, ["all:DB_*", "all:APP_*"]);
    const allKeys = tagMap["all"];
    expect(new Set(allKeys).size).toBe(allKeys.length);
  });
});

describe("filterByTag", () => {
  const config = { DB_HOST: "localhost", DB_PORT: "5432", APP_NAME: "stackdiff" };
  const tagMap = { database: ["DB_HOST", "DB_PORT"] };

  it("returns only keys for the given tag", () => {
    const result = filterByTag(config, tagMap, "database");
    expect(result).toEqual({ DB_HOST: "localhost", DB_PORT: "5432" });
  });

  it("returns empty object for unknown tag", () => {
    expect(filterByTag(config, tagMap, "unknown")).toEqual({});
  });
});

describe("listTags", () => {
  it("returns sorted tag names", () => {
    const tagMap = { zebra: ["Z"], alpha: ["A"], middle: ["M"] };
    expect(listTags(tagMap)).toEqual(["alpha", "middle", "zebra"]);
  });

  it("returns empty array for empty tagMap", () => {
    expect(listTags({})).toEqual([]);
  });
});
