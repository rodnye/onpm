import path from "path";
import { pathExists } from "fs-extra";
import { cacheStore } from "./config";
import {
  getPackageVersion,
  getMetadata,
  parsePackageIdentifier,
  getSatisfiesVersion,
  copyPackage,
  updatePackageJSON,
} from "../utils/pkg";
import type { IPackageIdentifier } from "../utils/pkg";
import { InstallsException } from "../utils/error";
import { sortRecord } from "../utils/object";

interface InstallOptions {
  force?: boolean;
}

interface TopInstallOptions {
  force?: boolean;
  destination?: string;
  saveIn?: "dev" | "none" | "default";
}

/**
 * Top level installation from cache
 */
export const installFromCache = async (
  packageNames: string[],
  options?: TopInstallOptions
) => {
  const {
    force = false,
    destination = process.cwd(),
    saveIn = "default",
  } = options || {};

  const requests: IPackageIdentifier[] = [];
  const requestsWithError = [];
  for (const packageName of packageNames) {
    const parsed = parsePackageIdentifier(packageName);
    const request = {
      name: parsed.name,
      version: parsed.version,
    };

    if (
      !getSatisfiesVersion(await getMetadata(), parsed.name, parsed.version)
    ) {
      requestsWithError.push(request);
    }

    requests.push(request);
  }

  if (requestsWithError.length) {
    throw new InstallsException(requestsWithError);
  }

  for (const { name, version } of requests) {
    await recursiveInstallFromCache(name, version, process.cwd(), undefined, {
      force,
    });
  }

  if (saveIn != "none")
    updatePackageJSON(destination, (pkg) => {
      const depTarget = saveIn == "dev" ? "devDependencies" : "dependencies";
      for (const { name, version } of requests) {
        if (!pkg[depTarget]) pkg[depTarget] = {};
        pkg[depTarget][name] = version;
      }

      sortRecord(pkg[depTarget]!);

      return pkg;
    });
};

/**
 * Recursive installation from cache
 */
export const recursiveInstallFromCache = async (
  packageName: string,
  targetVersion?: string,
  destination: string = process.cwd(),
  parentPath: string = "",
  options: InstallOptions = {}
) => {
  const metadata = await getMetadata();
  const { name, version } = parsePackageIdentifier(packageName, targetVersion);

  if (!metadata.packages[name]) {
    throw new Error(`Package ${name} not found in cache`);
  }

  const satisfiesVersion = getSatisfiesVersion(metadata, name, version);
  const cachedPackagePath = path.join(cacheStore, name, satisfiesVersion);
  let installPath: string;

  if (parentPath) {
    installPath = path.join(parentPath, "node_modules", name);
  } else {
    installPath = path.join(destination, "node_modules", name);
  }

  if (!(await pathExists(cachedPackagePath))) {
    throw new Error(
      `Cached package ${name}@${satisfiesVersion} not found at expected location`
    );
  }

  if ((await pathExists(installPath)) && !options.force) {
    const installedVersion = await getPackageVersion(installPath);

    if (installedVersion !== satisfiesVersion) {
      // version conflict - install in nested node_modules
      const conflictPath = path.join(installPath, "node_modules", name);

      await copyPackage(cachedPackagePath, conflictPath);
      const { dependencies } = metadata.packages[name][satisfiesVersion];
      for (const [depName, depVersion] of Object.entries(dependencies)) {
        await recursiveInstallFromCache(
          depName,
          depVersion,
          destination,
          conflictPath,
          options
        );
      }

      return true;
    } else {
      return false;
    }
  }

  await copyPackage(cachedPackagePath, installPath);
  const { dependencies } = metadata.packages[name][satisfiesVersion];
  for (const [depName, depVersion] of Object.entries(dependencies)) {
    await recursiveInstallFromCache(
      depName,
      depVersion,
      destination,
      installPath,
      options
    );
  }

  return true;
};
