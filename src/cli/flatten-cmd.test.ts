import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { parseFlattenArgs, runFlattenCmd } from "./flatten-cmd";

function writeTmp(name: string, content: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "stackdiff-"));
  const file = path.join(dir, name);
  fs.writeFileSync(file, content, "utf-8");
  return file;
}

describe("parseFlattenArgs", () => {
  it("parses required --input flag", () => {
    const args = parseFlattenArgs(["--input", "config.json"]);
    expect(args.input).toBe("config.json");
  });

  it("parses short flags", () => {
    const args = parseFlattenArgs(["-i", "in.json", "-o", "out.env", "-s", "__"]);
    expect(args.input).toBe("in.json");
    expect(args.output).toBe("out.env");
    expect(args.separator).toBe("__");
  });

  it("defaults separator to dot", () => {
    const args = parseFlattenArgs(["--input", "x.json"]);
    expect(args.separator).toBe(".");
  });

  it("sets reverse flag", () => {
    const args = parseFlattenArgs(["--input", "x.json", "--reverse"]);
    expect(args.reverse).toBe(true);
  });

  it("throws when --input is missing", () => {
    expect(() => parseFlattenArgs([])).toThrow("--input is required");
  });
});

describe("runFlattenCmd", () => {
  it("flattens a JSON config and writes output", async () => {
    const input = writeTmp("cfg.json", JSON.stringify({ db: { host: "localhost", port: "5432" } }));
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "stackdiff-out-"));
    const output = path.join(outDir, "out.env");

    await runFlattenCmd({ input, output, separator: ".", reverse: false, format: "env" });

    const content = fs.readFileSync(output, "utf-8");
    expect(content).toContain("db.host=localhost");
    expect(content).toContain("db.port=5432");
  });

  it("prints to stdout when no output specified", async () => {
    const input = writeTmp("cfg.json", JSON.stringify({ app: { name: "stackdiff" } }));
    const spy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);

    await runFlattenCmd({ input, separator: ".", reverse: false, format: "env" });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("throws when input file does not exist", async () => {
    await expect(
      runFlattenCmd({ input: "/nonexistent/path/cfg.json", separator: ".", reverse: false, format: "env" })
    ).rejects.toThrow();
  });

  it("uses custom separator in output keys", async () => {
    const input = writeTmp("cfg.json", JSON.stringify({ db: { host: "localhost" } }));
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "stackdiff-out-"));
    const output = path.join(outDir, "out.env");

    await runFlattenCmd({ input, output, separator: "__", reverse: false, format: "env" });

    const content = fs.readFileSync(output, "utf-8");
    expect(content).toContain("db__host=localhost");
  });
});
