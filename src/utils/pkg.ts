import path from "path";
import semver from "semver";
import { access, copy, existsSync, readJSON, writeJSON } from "fs-extra";
import { globalStore } from "../logic/config";
import { PackageParseException } from "./error";

const metadataPath = path.join(globalStore, "/metadata.json");
let metadata: IMetadata;

/**
 *
 */
export const getMetadata = async () => {
  if (!metadata) {
    if (existsSync(metadataPath)) {
      metadata = await readJSON(metadataPath, "utf-8");
    } else {
      metadata = { packages: {} };
    }
  }

  return metadata;
};

/**
 *
 */
export const updateMetadata = async (
  updater: (meta: IMetadata) => IMetadata | undefined
) => {
  const updatedMetadata = updater(await getMetadata());

  if (updatedMetadata) {
    await writeJSON(metadataPath, updatedMetadata, { spaces: 2 });
  }
};

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
 *
 */
export const getPackageJson = async (
  packagePath: string
): Promise<IPackageJSON> => {
  const jsonPath = path.join(packagePath, "/package.json");

  await access(jsonPath);
  return await readJSON(jsonPath, "utf-8");
};

/**
 *
 */
export const getDependenciesEntries = async (packagePath: string) => {
  return Object.entries((await getPackageJson(packagePath)).dependencies || {});
};

export const getPackageVersion = async (packagePath: string) => {
  try {
    const pkgJson = await getPackageJson(packagePath);
    return pkgJson.version;
  } catch {
    return null;
  }
};

/**
 * Get best matching version
 */
export const getSatisfiesVersion = (
  metadata: IMetadata,
  name: string,
  targetVersion: string
) => {
  const versions = Object.keys(metadata.packages[name]);
  for (const version of versions) {
    if (semver.satisfies(version, targetVersion)) return version;
  }

  return semver.minVersion(targetVersion)!.toString();
};

export type IPackageIdentifier = {
  name: string;
  version: string;
  full?: string;
};

/**
 * Parse a package name and version from a string or separate parameters
 */
export const parsePackageIdentifier = (
  input: string,
  version?: string
): IPackageIdentifier => {
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

  const cleanedVersion = semver.validRange(extractedVersion);
  if (!cleanedVersion && extractedVersion !== "latest") {
    throw new PackageParseException(
      `Invalid version or range: ${extractedVersion}`
    );
  }

  return {
    name,
    version: extractedVersion,
  };
};

/**
 * Validate package name according to npm naming rules
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
 * Copy package without node_modules
 */
export const copyPackage = async (source: string, destination: string) => {
  await copy(source, destination, {
    filter: (src) => !/node_modules$/.exec(src),
  });
};
