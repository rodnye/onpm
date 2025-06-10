import { homedir } from "os";
import path from "path"

export const globalStore = path.join(homedir(), '.onpm-cache/v3');
export const installerStore = path.join(globalStore, '/installs');
export const cacheStore = path.join(globalStore, '/packages');