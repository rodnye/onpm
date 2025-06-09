import path from "path"

export const globalStore = path.join(__dirname, '../../cache');
export const installerStore = path.join(globalStore, '/installs');
export const cacheStore = path.join(globalStore, '/packages');