import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { parseGroupArgs, runGroupCmd } from "./group-cmd";

function writeTmp(dir: string, name: string, content: string): string {
  const file = path.join(dir, name);
  fs.writeFileSync(file, content, "utf-8");
  return file;
}

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "groupcmd-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("parseGroupArgs", () => {
  it("parses --input and --output", () => {
    const args = parseGroupArgs(["--input", "a.env", "--output", "out.txt"]);
    expect(args.input).toBe("a.env");
    expect(args.output).toBe("out.txt");
  });

  it("parses --strategy", () => {
    const args = parseGroupArgs(["--strategy", "custom"]);
    expect(args.strategy).toBe("custom");
  });

  it("parses --delimiter", () => {
    const args = parseGroupArgs(["--delimiter", "."]);
    expect(args.delimiter).toBe(".");
  });

  it("parses --group flag into customGroups", () => {
    const args = parseGroupArgs(["--group", "db=DB_HOST,DB_PORT"]);
    expect(args.customGroups["db"]).toEqual(["DB_HOST", "DB_PORT"]);
  });

  it("parses --json flag", () => {
    const args = parseGroupArgs(["--json"]);
    expect(args.json).toBe(true);
  });

  it("defaults strategy to prefix", () => {
    const args = parseGroupArgs([]);
    expect(args.strategy).toBe("prefix");
  });
});

describe("runGroupCmd", () => {
  it("exits with error when --input is missing", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit");
    });
    await expect(runGroupCmd([])).rejects.toThrow("exit");
    exitSpy.mockRestore();
  });

  it("writes grouped output to file", async () => {
    const envFile = writeTmp(tmpDir, "test.env", "DB_HOST=localhost\nDB_PORT=5432\nAPP_NAME=test\n");
    const outFile = path.join(tmpDir, "grouped.txt");
    await runGroupCmd(["--input", envFile, "--output", outFile]);
    const content = fs.readFileSync(outFile, "utf-8");
    expect(content).toContain("[DB]");
    expect(content).toContain("DB_HOST=localhost");
    expect(content).toContain("[APP]");
  });

  it("writes JSON output when --json is set", async () => {
    const envFile = writeTmp(tmpDir, "test.env", "DB_HOST=localhost\nDB_PORT=5432\n");
    const outFile = path.join(tmpDir, "grouped.json");
    await runGroupCmd(["--input", envFile, "--output", outFile, "--json"]);
    const parsed = JSON.parse(fs.readFileSync(outFile, "utf-8"));
    expect(parsed).toHaveProperty("DB");
    expect(parsed.DB).toHaveProperty("DB_HOST", "localhost");
  });
});
