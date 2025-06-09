import path from "path";
import semver from "semver";
import { cacheStore, installerStore } from "./config";
import { execa } from "execa";
import { InstallsException } from "../utils/error";
import {
  copyPackage,
  getDependenciesEntries,
  getMetadata,
  getPackageJson,
  getSatisfiesVersion,
  parsePackageIdentifier,
  updateMetadata,
} from "../utils/pkg";
import { pathExists, mkdirp, remove, mkdirSync } from "fs-extra";

/**
 *
 */
export const cachePackage = async (inputs: string[]) => {
  const { name, version } = parsePackageIdentifier(inputs[0]);

  for (const input of inputs) {
    // validate inputs
    parsePackageIdentifier(input);
  }

  //
  // Step 1: Install the package with NPM in a temporary directory
  //
  const installationPath = path.join(installerStore, name + "-" + version);

  mkdirSync(installationPath, { recursive: true });
  await execa("npm", ["init", "-y"], {
    cwd: installationPath,
    stdio: "ignore",
  });
  const { failed } = await execa("npm", ["install", ...inputs], {
    cwd: installationPath,
    stdio: "ignore",
  });

  if (failed) {
    throw new InstallsException(
      [],
      new Error("The package installation is failed")
    );
  }

  //
  // Step 2: Save in cache directory
  //
  const metadata = await getMetadata();
  await savePackageFromTemp(
    [installationPath],
    null,
    null,
    await getDependenciesEntries(installationPath),
    metadata
  );
  await updateMetadata(() => metadata);
  await remove(installationPath);

  return true;
};

const savePackageFromTemp = async (
  tempPaths: string[],
  parentName: string | null,
  parentVersion: string | null,
  dependencies: [string, string][],
  metadata: IMetadata
) => {
  for (const [name, requestedVersion] of dependencies) {
    const currentPath = await getPackagePathFromTemps(tempPaths, name);

    if (!currentPath)
      throw new InstallsException(
        [{ name, version: requestedVersion }],
        new Error(
          `The package ${name}@${requestedVersion} not installed yet, the npm installation is corrupted`
        )
      );

    if (!metadata.packages[name]) {
      metadata.packages[name] = {};
      await mkdirp(path.join(cacheStore, name));
    }

    const { version: packageVersion } = await getPackageJson(currentPath);
    const satisfiedVersion = getSatisfiesVersion(
      metadata,
      name,
      requestedVersion
    );
    let version = semver.gte(satisfiedVersion, packageVersion)
      ? satisfiedVersion
      : packageVersion;

    if (!metadata.packages[name][version]) {
      const targetPath = path.join(cacheStore, name, version);
      const currentDependencies = await getDependenciesEntries(currentPath);

      await copyPackage(currentPath, targetPath);

      metadata.packages[name][version] = {
        dependencies: Object.fromEntries(currentDependencies),
        dependants: [],
      };

      // recursive
      await savePackageFromTemp(
        [...tempPaths, currentPath],
        name,
        version,
        currentDependencies,
        metadata
      );
    }

    // add parent package with dependant of currentPackage
    if (parentName) {
      const parentFullName = parentName + "@" + parentVersion;
      if (
        !metadata.packages[name][version].dependants.includes(parentFullName)
      ) {
        metadata.packages[name][version].dependants.push(parentFullName);
      }
    } else {
      if (
        !metadata.packages[name][version].dependants.includes('@')
      ) {
        metadata.packages[name][version].dependants.push('@');
      }
    }
  }
};

/**
 * Este metodo retorna cual utilizar, priorizando la existencia del interno debido a que es el que tiene la version resuelta correcta
 */
const getPackagePathFromTemps = async (
  tempPaths: string[],
  packageName: string
) => {
  for (let i = tempPaths.length - 1; i >= 0; i--) {
    const tempPath = tempPaths[i];

    if (await pathExists(path.join(tempPath, "/node_modules", packageName))) {
      return path.join(tempPath, "/node_modules", packageName);
    }
  }

  return null;
};
