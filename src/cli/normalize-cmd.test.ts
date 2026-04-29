import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { parseNormalizeArgs, runNormalizeCmd } from "./normalize-cmd";

function writeTmp(dir: string, name: string, content: string): string {
  const p = path.join(dir, name);
  fs.writeFileSync(p, content, "utf8");
  return p;
}

describe("parseNormalizeArgs", () => {
  it("parses --input and --output", () => {
    const args = parseNormalizeArgs(["--input", "a.env", "--output", "b.env"]);
    expect(args.input).toBe("a.env");
    expect(args.output).toBe("b.env");
  });

  it("parses flags", () => {
    const args = parseNormalizeArgs(["a.env", "--trim", "--lowercase-keys", "--uppercase-values", "--collapse-whitespace"]);
    expect(args.trimWhitespace).toBe(true);
    expect(args.lowercaseKeys).toBe(true);
    expect(args.uppercaseValues).toBe(true);
    expect(args.collapseWhitespace).toBe(true);
  });

  it("parses --dry-run", () => {
    const args = parseNormalizeArgs(["a.env", "--dry-run"]);
    expect(args.dryRun).toBe(true);
  });

  it("parses --format", () => {
    const args = parseNormalizeArgs(["a.env", "--format", "json"]);
    expect(args.format).toBe("json");
  });

  it("throws when no input given", () => {
    expect(() => parseNormalizeArgs([])).toThrow("--input is required");
  });
});

describe("runNormalizeCmd", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "normalize-cmd-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("writes normalized output to file", async () => {
    const input = writeTmp(tmpDir, "input.env", "DB_HOST=  localhost  \nAPI_KEY=  secret  \n");
    const output = path.join(tmpDir, "output.env");
    await runNormalizeCmd([input, "--output", output, "--trim"]);
    const content = fs.readFileSync(output, "utf8");
    expect(content).toContain("localhost");
    expect(content).not.toContain("  localhost  ");
  });

  it("does not write in dry-run mode", async () => {
    const input = writeTmp(tmpDir, "input.env", "KEY=  value  \n");
    const output = path.join(tmpDir, "should-not-exist.env");
    await runNormalizeCmd([input, "--output", output, "--trim", "--dry-run"]);
    expect(fs.existsSync(output)).toBe(false);
  });
});
