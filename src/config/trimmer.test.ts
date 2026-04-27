import { trimValue, trimConfig, listUntrimmedKeys } from "./trimmer";

describe("trimValue", () => {
  it("removes leading and trailing whitespace", () => {
    expect(trimValue("  hello  ")).toBe("hello");
  });

  it("leaves already-trimmed values unchanged", () => {
    expect(trimValue("hello")).toBe("hello");
  });

  it("collapses internal whitespace when option is set", () => {
    expect(trimValue("hello   world", { collapseInternal: true })).toBe(
      "hello world"
    );
  });

  it("does not collapse internal whitespace by default", () => {
    expect(trimValue("hello   world")).toBe("hello   world");
  });

  it("handles empty string", () => {
    expect(trimValue("")).toBe("");
  });
});

describe("listUntrimmedKeys", () => {
  it("returns keys with surrounding whitespace", () => {
    const config = { A: "  val", B: "clean", C: "trail  " };
    expect(listUntrimmedKeys(config).sort()).toEqual(["A", "C"]);
  });

  it("returns empty array when all values are trimmed", () => {
    expect(listUntrimmedKeys({ X: "ok", Y: "fine" })).toEqual([]);
  });
});

describe("trimConfig", () => {
  const raw = {
    HOST: "  localhost  ",
    PORT: "3000",
    SECRET: "  s3cr3t  ",
    LABEL: "  hello   world  ",
  };

  it("trims all values by default", () => {
    const result = trimConfig(raw);
    expect(result.HOST).toBe("localhost");
    expect(result.PORT).toBe("3000");
    expect(result.SECRET).toBe("s3cr3t");
  });

  it("skips excluded keys", () => {
    const result = trimConfig(raw, { excludeKeys: ["SECRET"] });
    expect(result.SECRET).toBe("  s3cr3t  ");
    expect(result.HOST).toBe("localhost");
  });

  it("collapses internal whitespace when requested", () => {
    const result = trimConfig(raw, { collapseInternal: true });
    expect(result.LABEL).toBe("hello world");
  });

  it("does not mutate the original config", () => {
    trimConfig(raw);
    expect(raw.HOST).toBe("  localhost  ");
  });
});
