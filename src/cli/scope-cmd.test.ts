import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { parseScopeArgs, runScopeCmd } from "./scope-cmd";

function writeTmp(name: string, content: string): string {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content);
  return p;
}

describe("parseScopeArgs", () => {
  it("parses required args", () => {
    const args = parseScopeArgs(["-i", "config.env", "-s", "APP,DB"]);
    expect(args.input).toBe("config.env");
    expect(args.scopes).toEqual(["APP", "DB"]);
    expect(args.action).toBe("scope");
  });

  it("parses action and output", () => {
    const args = parseScopeArgs(["-i", "f.env", "-s", "APP", "-a", "list", "-o", "out.json"]);
    expect(args.action).toBe("list");
    expect(args.output).toBe("out.json");
  });

  it("throws if --input missing", () => {
    expect(() => parseScopeArgs(["-s", "APP"])).toThrow("--input is required");
  });

  it("throws if --scopes missing for scope action", () => {
    expect(() => parseScopeArgs(["-i", "f.env"])).toThrow("--scopes is required");
  });
});

describe("runScopeCmd", () => {
  it("scopes config and writes output file", async () => {
    const input = writeTmp("scope-input.env", "APP_PORT=3000\nDB_HOST=localhost\nLOG=info\n");
    const output = path.join(os.tmpdir(), "scope-output.json");
    await runScopeCmd({ input, scopes: ["APP", "DB"], action: "scope", output });
    const result = JSON.parse(fs.readFileSync(output, "utf8"));
    expect(result["APP"]).toEqual({ PORT: "3000" });
    expect(result["DB"]).toEqual({ HOST: "localhost" });
    expect(result["default"]).toEqual({ LOG: "info" });
  });

  it("unscopes a scope map", async () => {
    const scopeMap = { APP: { PORT: "3000" }, default: { LOG: "info" } };
    const mapFile = writeTmp("scope-map.json", JSON.stringify(scopeMap));
    const output = path.join(os.tmpdir(), "unscoped.json");
    await runScopeCmd({ input: mapFile, scopes: [], action: "unscope", scopeMap: mapFile, output });
    const result = JSON.parse(fs.readFileSync(output, "utf8"));
    expect(result).toEqual({ APP_PORT: "3000", LOG: "info" });
  });

  it("lists scopes to stdout", async () => {
    const input = writeTmp("scope-list.env", "APP_PORT=3000\nDB_HOST=localhost\n");
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    await runScopeCmd({ input, scopes: ["APP", "DB"], action: "list" });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("APP"));
    spy.mockRestore();
  });
});
