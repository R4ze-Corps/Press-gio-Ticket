import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";

const STORAGE_PATH = join(process.cwd(), "data", "farms.json");

type FarmEntry = {
  messageId: string;
  channelId: string;
};

type FarmStore = {
  [userId: string]: FarmEntry;
};

let cache: FarmStore | null = null;

function ensureDir() {
  const dir = dirname(STORAGE_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function load(): FarmStore {
  if (cache) return cache;
  try {
    cache = JSON.parse(readFileSync(STORAGE_PATH, "utf-8"));
  } catch {
    cache = {};
  }
  return cache!;
}

export function getFarmEntry(userId: string): FarmEntry | undefined {
  return load()[userId];
}

export function setFarmEntry(userId: string, entry: FarmEntry): void {
  load()[userId] = entry;
  ensureDir();
  writeFileSync(STORAGE_PATH, JSON.stringify(cache, null, 2));
}
