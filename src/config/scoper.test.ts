import { detectScope, scopeConfig, unscopeConfig, listScopes } from "./scoper";

const SCOPES = ["APP", "DB", "CACHE"];

describe("detectScope", () => {
  it("returns matching scope", () => {
    expect(detectScope("APP_PORT", SCOPES)).toBe("APP");
    expect(detectScope("DB_HOST", SCOPES)).toBe("DB");
    expect(detectScope("CACHE_TTL", SCOPES)).toBe("CACHE");
  });

  it("returns 'default' for unmatched keys", () => {
    expect(detectScope("LOG_LEVEL", SCOPES)).toBe("default");
    expect(detectScope("PORT", SCOPES)).toBe("default");
  });

  it("is case-insensitive", () => {
    expect(detectScope("app_port", SCOPES)).toBe("APP");
  });
});

describe("scopeConfig", () => {
  const flat = {
    APP_PORT: "3000",
    APP_ENV: "staging",
    DB_HOST: "localhost",
    LOG_LEVEL: "info",
  };

  it("groups keys by scope", () => {
    const result = scopeConfig(flat, SCOPES);
    expect(result["APP"]).toEqual({ PORT: "3000", ENV: "staging" });
    expect(result["DB"]).toEqual({ HOST: "localhost" });
    expect(result["default"]).toEqual({ LOG_LEVEL: "info" });
  });

  it("handles empty config", () => {
    expect(scopeConfig({}, SCOPES)).toEqual({});
  });
});

describe("unscopeConfig", () => {
  it("reconstructs flat config from scope map", () => {
    const scopeMap = {
      APP: { PORT: "3000", ENV: "staging" },
      DB: { HOST: "localhost" },
      default: { LOG_LEVEL: "info" },
    };
    const result = unscopeConfig(scopeMap);
    expect(result).toEqual({
      APP_PORT: "3000",
      APP_ENV: "staging",
      DB_HOST: "localhost",
      LOG_LEVEL: "info",
    });
  });
});

describe("listScopes", () => {
  it("returns sorted list of detected scopes", () => {
    const flat = { APP_PORT: "3000", DB_HOST: "localhost", LOG_LEVEL: "info" };
    expect(listScopes(flat, SCOPES)).toEqual(["APP", "DB", "default"]);
  });

  it("returns empty array for empty config", () => {
    expect(listScopes({}, SCOPES)).toEqual([]);
  });
});
