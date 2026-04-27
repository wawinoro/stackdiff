import { describe, it, expect } from "vitest";
import {
  extractPrefix,
  groupByPrefix,
  groupByCustom,
  groupConfig,
  listGroups,
} from "./grouper";

const sample: Record<string, string> = {
  DB_HOST: "localhost",
  DB_PORT: "5432",
  APP_NAME: "stackdiff",
  APP_ENV: "production",
  SECRET_KEY: "abc123",
};

describe("extractPrefix", () => {
  it("returns prefix before delimiter", () => {
    expect(extractPrefix("DB_HOST", "_")).toBe("DB");
  });

  it("returns null when no delimiter found", () => {
    expect(extractPrefix("NODOT", ".")).toBeNull();
  });

  it("returns null when delimiter is at position 0", () => {
    expect(extractPrefix("_LEADING", "_")).toBeNull();
  });
});

describe("groupByPrefix", () => {
  it("groups keys by prefix", () => {
    const result = groupByPrefix(sample);
    expect(Object.keys(result)).toEqual(
      expect.arrayContaining(["DB", "APP", "SECRET"])
    );
    expect(result["DB"]).toHaveProperty("DB_HOST", "localhost");
    expect(result["DB"]).toHaveProperty("DB_PORT", "5432");
  });

  it("places unprefixed keys in ungrouped bucket", () => {
    const result = groupByPrefix({ NOPREFIX: "val" }, "_", "__other__");
    expect(result["__other__"]).toHaveProperty("NOPREFIX", "val");
  });
});

describe("groupByCustom", () => {
  it("groups keys according to custom map", () => {
    const result = groupByCustom(sample, {
      database: ["DB_HOST", "DB_PORT"],
      app: ["APP_NAME", "APP_ENV"],
    });
    expect(result["database"]).toHaveProperty("DB_HOST");
    expect(result["app"]).toHaveProperty("APP_NAME");
  });

  it("puts unmatched keys into ungrouped", () => {
    const result = groupByCustom(sample, { database: ["DB_HOST"] });
    expect(result["__ungrouped__"]).toHaveProperty("DB_PORT");
    expect(result["__ungrouped__"]).toHaveProperty("SECRET_KEY");
  });
});

describe("groupConfig", () => {
  it("defaults to prefix strategy", () => {
    const result = groupConfig(sample);
    expect(result).toHaveProperty("DB");
  });

  it("uses custom strategy when specified", () => {
    const result = groupConfig(sample, {
      strategy: "custom",
      customGroups: { db: ["DB_HOST", "DB_PORT"] },
    });
    expect(result["db"]).toHaveProperty("DB_HOST");
  });
});

describe("listGroups", () => {
  it("returns all group names", () => {
    const grouped = groupByPrefix(sample);
    const groups = listGroups(grouped);
    expect(groups).toContain("DB");
    expect(groups).toContain("APP");
  });
});
