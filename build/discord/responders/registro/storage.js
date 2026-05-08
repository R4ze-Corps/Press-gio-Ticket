import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
const STORAGE_PATH = join(process.cwd(), "data", "farms.json");
let cache = null;
function ensureDir() {
    const dir = dirname(STORAGE_PATH);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
}
function load() {
    if (cache)
        return cache;
    try {
        cache = JSON.parse(readFileSync(STORAGE_PATH, "utf-8"));
    }
    catch {
        cache = {};
    }
    return cache;
}
export function getFarmEntry(userId) {
    return load()[userId];
}
export function setFarmEntry(userId, entry) {
    load()[userId] = entry;
    ensureDir();
    writeFileSync(STORAGE_PATH, JSON.stringify(cache, null, 2));
}
