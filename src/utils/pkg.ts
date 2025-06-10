import path from "path";
import semver from "semver";
import { access, copy, existsSync, readJSON, writeJSON } from "fs-extra";
import { globalStore } from "../logic/config";
import { PackageParseException } from "./error";

const metadataPath = path.join(globalStore, "/metadata.json");
let metadata: IMetadata;

export type IPackageIdentifier = [name: string, version: string];

/**
 * Retrieve metadata from the JSON file.
 */
export const getMetadata = async () => {
  if (!metadata) {
    if (existsSync(metadataPath)) {
      metadata = await readJSON(metadataPath, "utf-8");
    } else {
      metadata = { version: 'v3', packages: {} };
    }
  }

  return metadata;
};

/**
 * Update using a provided updater function.
 */
export const updateMetadata = async (
  updater: (meta: IMetadata) => IMetadata | undefined
) => {
  const updatedMetadata = updater(await getMetadata());

  if (updatedMetadata) {
    await writeJSON(metadataPath, updatedMetadata, { spaces: 2 });
  }
};

/**
 * Read and return the `package.json` file from the specified package path.
 */
export const getPackageJson = async (
  packagePath: string
): Promise<IPackageJSON> => {
  const jsonPath = path.join(packagePath, "/package.json");

  await access(jsonPath);
  return await readJSON(jsonPath, "utf-8");
};

/**
 * Update the `package.json` file using a provided updater function.
 */
export const updatePackageJSON = async (
  packagePath: string,
  updater: (meta: IPackageJSON) => IPackageJSON | undefined
) => {
  const updated = updater(await getPackageJson(packagePath));

  if (updated) {
    await writeJSON(metadataPath, updated, { spaces: 2 });
  }
};

/**
 * Retrieve the dependencies as key-value pairs from the `package.json` file.
 */
export const getDependenciesEntries = async (packagePath: string) => {
  return Object.entries((await getPackageJson(packagePath)).dependencies || {});
};

/**
 * Get the version of the package from its `package.json` file.
 */
export const getPackageVersion = async (packagePath: string) => {
  try {
    const pkgJson = await getPackageJson(packagePath);
    return pkgJson.version;
  } catch {
    return null;
  }
};

/**
 * Find the best matching version of a package that satisfies a target version.
 */
export const getSatisfiesVersion = (
  metadata: IMetadata,
  name: string,
  targetVersion: string
) => {
  // Handle 'latest' specially
  if (targetVersion === "latest") {
    const versions = Object.keys(metadata.packages[name] || {});
    if (versions.length === 0) return null;

    // Find the highest version number
    return versions.reduce((max, current) => {
      return semver.gt(current, max) ? current : max;
    }, "0.0.0");
  }

  // Normal semver processing
  const versions = Object.keys(metadata.packages[name] || {});
  for (const version of versions) {
    if (semver.satisfies(version, targetVersion)) return version;
  }

  return semver.minVersion(targetVersion)?.toString() || null;
};

/**
 * Parse a package name and version from a string or separate parameters.
 */
export const parsePackageIdentifier = (
  input: string,
  version?: string
): [string, string] => {
  if (!input || typeof input !== "string") {
    throw new PackageParseException("Package identifier cannot be empty");
  }

  let name = input;
  let extractedVersion = version;

  // extract version from input string
  if (!extractedVersion) {
    const lastAtPos = input.lastIndexOf("@");

    // scoped packages (@scope/package@version)
    if (input.startsWith("@") && lastAtPos > 0) {
      name = input.substring(0, lastAtPos);
      extractedVersion = input.substring(lastAtPos + 1);
    }
    // regular packages (package@version)
    else if (lastAtPos > 0) {
      name = input.substring(0, lastAtPos);
      extractedVersion = input.substring(lastAtPos + 1);
    }
  }

  if (!isValidPackageName(name)) {
    throw new PackageParseException(`Invalid package name: ${name}`);
  }

  if (!extractedVersion) {
    extractedVersion = "latest";
  }

  // Skip semver validation for 'latest'
  if (extractedVersion !== "latest") {
    const cleanedVersion = semver.validRange(extractedVersion);
    if (!cleanedVersion) {
      throw new PackageParseException(
        `Invalid version or range: ${extractedVersion}`
      );
    }
  }

  return [name, extractedVersion];
};

/**
 * Validate a package name according to npm naming rules.
 */
export const isValidPackageName = (name: string) => {
  if (!name) return false;
  if (name.length > 214) return false;

  // scoped package pattern: @scope/package
  if (name.startsWith("@")) {
    const parts = name.split("/");
    if (parts.length !== 2) return false;
    return (
      /^[@a-z0-9-][a-z0-9-._]*$/.test(parts[0].substring(1)) &&
      /^[a-z0-9-][a-z0-9-._]*$/.test(parts[1])
    );
  }

  return /^[a-z0-9-][a-z0-9-._]*$/.test(name);
};

/**
 * Copy a package directory to a new location, excluding the `node_modules` folder.
 */
export const copyPackage = async (source: string, destination: string) => {
  await copy(source, destination, {
    filter: (src) => !/node_modules$/.exec(src),
  });
};
