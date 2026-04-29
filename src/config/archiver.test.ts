import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  createArchiveEntry,
  saveArchive,
  loadArchive,
  listArchives,
  formatArchiveResult,
} from "./archiver";

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "archiver-test-"));
}

describe("createArchiveEntry", () => {
  it("includes timestamp and config", () => {
    const config = { KEY: "value" };
    const entry = createArchiveEntry(config, "staging");
    expect(entry.config).toEqual(config);
    expect(entry.filename).toContain("staging");
    expect(entry.timestamp).toBeTruthy();
  });

  it("uses default filename when no label given", () => {
    const entry = createArchiveEntry({ A: "1" });
    expect(entry.filename).toContain("archive-");
  });
});

describe("saveArchive and loadArchive", () => {
  it("round-trips an entry", () => {
    const dir = makeTmpDir();
    const config = { DB_HOST: "localhost", PORT: "5432" };
    const entry = createArchiveEntry(config, "test");
    const result = saveArchive(entry, dir);
    expect(result.entryCount).toBe(2);
    expect(result.sizeBytes).toBeGreaterThan(0);
    const loaded = loadArchive(result.archivePath);
    expect(loaded.config).toEqual(config);
    expect(loaded.timestamp).toBe(entry.timestamp);
  });

  it("creates archive directory if missing", () => {
    const dir = path.join(makeTmpDir(), "nested", "archives");
    const entry = createArchiveEntry({ X: "1" }, "x");
    saveArchive(entry, dir);
    expect(fs.existsSync(dir)).toBe(true);
  });
});

describe("listArchives", () => {
  it("returns empty array for missing dir", () => {
    expect(listArchives("/nonexistent/path")).toEqual([]);
  });

  it("lists saved archives sorted", () => {
    const dir = makeTmpDir();
    saveArchive(createArchiveEntry({ A: "1" }, "alpha"), dir);
    saveArchive(createArchiveEntry({ B: "2" }, "beta"), dir);
    const list = listArchives(dir);
    expect(list.length).toBe(2);
    expect(list[0] < list[1]).toBe(true);
  });
});

describe("formatArchiveResult", () => {
  it("formats result summary", () => {
    const result = { archivePath: "/tmp/test.json", entryCount: 5, sizeBytes: 128 };
    const output = formatArchiveResult(result);
    expect(output).toContain("/tmp/test.json");
    expect(output).toContain("5");
    expect(output).toContain("128");
  });
});
