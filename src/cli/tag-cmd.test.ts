import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { parseTagArgs, runTagCmd } from "./tag-cmd";

function writeTmp(content: string, ext = ".env"): string {
  const file = path.join(os.tmpdir(), `tagger-test-${Date.now()}${ext}`);
  fs.writeFileSync(file, content);
  return file;
}

describe("parseTagArgs", () => {
  it("parses required --input and --tag", () => {
    const args = parseTagArgs(["--input", "config.env", "--tag", "db:DB_*"]);
    expect(args.input).toBe("config.env");
    expect(args.tags).toEqual(["db:DB_*"]);
  });

  it("parses multiple --tag flags", () => {
    const args = parseTagArgs(["--input", "f.env", "--tag", "a:A_*", "--tag", "b:B_*"]);
    expect(args.tags).toHaveLength(2);
  });

  it("parses --list flag", () => {
    const args = parseTagArgs(["--input", "f.env", "--list"]);
    expect(args.listOnly).toBe(true);
  });

  it("parses --filter and --format", () => {
    const args = parseTagArgs(["--input", "f.env", "--tag", "x:X", "--filter", "x", "--format", "json"]);
    expect(args.filter).toBe("x");
    expect(args.outputFormat).toBe("json");
  });

  it("throws when --input is missing", () => {
    expect(() => parseTagArgs(["--tag", "x:X"])).toThrow("--input is required");
  });

  it("throws when no --tag and not --list", () => {
    expect(() => parseTagArgs(["--input", "f.env"])).toThrow("At least one --tag");
  });
});

describe("runTagCmd", () => {
  let spy: jest.SpyInstance;
  beforeEach(() => { spy = jest.spyOn(console, "log").mockImplementation(() => {}); });
  afterEach(() => { spy.mockRestore(); });

  it("prints env output for matched keys", () => {
    const file = writeTmp("DB_HOST=localhost\nDB_PORT=5432\nAPP_NAME=stackdiff\n");
    runTagCmd({ input: file, tags: ["db:DB_*"], listOnly: false, outputFormat: "env" });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("DB_HOST"));
  });

  it("prints JSON when format is json", () => {
    const file = writeTmp("APP_ENV=staging\nAPP_NAME=test\n");
    runTagCmd({ input: file, tags: ["app:APP_*"], filter: "app", listOnly: false, outputFormat: "json" });
    const call = spy.mock.calls[0][0];
    expect(() => JSON.parse(call)).not.toThrow();
  });

  it("lists tags when --list is set", () => {
    const file = writeTmp("DB_HOST=localhost\nAPP_NAME=test\n");
    runTagCmd({ input: file, tags: ["db:DB_*", "app:APP_*"], listOnly: true, outputFormat: "env" });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("db:"));
  });

  it("prints no tags matched when nothing matches", () => {
    const file = writeTmp("FOO=bar\n");
    runTagCmd({ input: file, tags: ["x:NOPE_*"], listOnly: true, outputFormat: "env" });
    expect(spy).toHaveBeenCalledWith("No tags matched.");
  });
});
