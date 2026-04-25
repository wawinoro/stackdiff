import { flattenConfig, unflattenConfig, flattenKeys } from "./flattener";

describe("flattenConfig", () => {
  it("flattens a simple nested object", () => {
    const input = { db: { host: "localhost", port: "5432" } };
    expect(flattenConfig(input)).toEqual({
      "db.host": "localhost",
      "db.port": "5432",
    });
  });

  it("handles deeply nested objects", () => {
    const input = { a: { b: { c: "deep" } } };
    expect(flattenConfig(input)).toEqual({ "a.b.c": "deep" });
  });

  it("respects custom separator", () => {
    const input = { db: { host: "localhost" } };
    expect(flattenConfig(input, "", "__")).toEqual({
      "db__host": "localhost",
    });
  });

  it("serializes array values as JSON", () => {
    const input = { tags: ["a", "b"] };
    const result = flattenConfig(input);
    expect(result["tags"]).toBe('["a","b"]');
  });

  it("converts null to empty string", () => {
    const input = { key: null };
    expect(flattenConfig(input)).toEqual({ key: "" });
  });

  it("returns flat config unchanged", () => {
    const input = { HOST: "localhost", PORT: "3000" };
    expect(flattenConfig(input)).toEqual({ HOST: "localhost", PORT: "3000" });
  });
});

describe("unflattenConfig", () => {
  it("restores nested structure from dot keys", () => {
    const flat = { "db.host": "localhost", "db.port": "5432" };
    expect(unflattenConfig(flat)).toEqual({
      db: { host: "localhost", port: "5432" },
    });
  });

  it("handles deeply nested keys", () => {
    const flat = { "a.b.c": "deep" };
    expect(unflattenConfig(flat)).toEqual({ a: { b: { c: "deep" } } });
  });

  it("uses custom separator", () => {
    const flat = { "db__host": "localhost" };
    expect(unflattenConfig(flat, "__")).toEqual({ db: { host: "localhost" } });
  });
});

describe("flattenKeys", () => {
  it("returns all dot-notation keys", () => {
    const input = { db: { host: "x", port: "y" }, app: { name: "z" } };
    const keys = flattenKeys(input);
    expect(keys).toContain("db.host");
    expect(keys).toContain("db.port");
    expect(keys).toContain("app.name");
    expect(keys).toHaveLength(3);
  });
});
