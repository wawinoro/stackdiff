import * as fs from "fs";
import * as path from "path";

export interface ArchiveEntry {
  filename: string;
  timestamp: string;
  config: Record<string, string>;
}

export interface ArchiveResult {
  archivePath: string;
  entryCount: number;
  sizeBytes: number;
}

export function createArchiveEntry(
  config: Record<string, string>,
  label?: string
): ArchiveEntry {
  const timestamp = new Date().toISOString();
  const filename = label
    ? `${label}-${timestamp}.json`
    : `archive-${timestamp}.json`;
  return { filename, timestamp, config };
}

export function saveArchive(
  entry: ArchiveEntry,
  archiveDir: string
): ArchiveResult {
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }
  const archivePath = path.join(archiveDir, entry.filename);
  const content = JSON.stringify(entry, null, 2);
  fs.writeFileSync(archivePath, content, "utf-8");
  return {
    archivePath,
    entryCount: Object.keys(entry.config).length,
    sizeBytes: Buffer.byteLength(content, "utf-8"),
  };
}

export function loadArchive(archivePath: string): ArchiveEntry {
  const raw = fs.readFileSync(archivePath, "utf-8");
  return JSON.parse(raw) as ArchiveEntry;
}

export function listArchives(archiveDir: string): string[] {
  if (!fs.existsSync(archiveDir)) return [];
  return fs
    .readdirSync(archiveDir)
    .filter((f) => f.endsWith(".json"))
    .sort();
}

export function formatArchiveResult(result: ArchiveResult): string {
  const lines = [
    `Archived to: ${result.archivePath}`,
    `Keys archived: ${result.entryCount}`,
    `Size: ${result.sizeBytes} bytes`,
  ];
  return lines.join("\n");
}
