import { Command } from "commander";
import { cachePackage } from "../logic/cache";
import {
  getMetadata,
  getPackageJson,
  getSatisfiesVersion,
  parsePackageIdentifier,
} from "../utils/pkg";
import {
  print,
  printError,
  printList,
  printStep,
  printWarning,
  printSuccess,
} from "../utils/print";
import { installFromCache } from "../logic/install";
import { isNil } from "../utils/object";
import chalk from "chalk";
import { exit } from "process";

type InstallCommandOptions = {
  // with packages arguments
  save?: boolean;
  saveDev?: boolean;
  noSave?: boolean;

  // without packages arguments
  production?: boolean;

  // both
  online?: boolean;
};

export const installCommand = new Command("install");

installCommand
  .alias("i")
  .argument(
    "[packages...]",
    "The packages to install (if omits this, install from package.json)"
  )
  .option(
    "-o, --online",
    "Install from cache and if a package doesn't exists, download and continue"
  )
  .option("-S, --save", "Save packages on dependencies (enabled by default)")
  .option("-D, --save-dev", "Save packages on devDependencies")
  .option("--no-save", "No save packages in package.json")
  .option("--production", "Install only production dependencies")
  .description("Install the dependencies from cache")
  .action(async (packagesInput: string[], options: InstallCommandOptions) => {
    let packages: [string, string][];

    //
    // NO PACKAGE INPUTS
    //
    if (!packagesInput || packagesInput.length === 0) {
      // validate flags in this context
      if (
        !isNil(options.noSave) ||
        !isNil(options.save) ||
        !isNil(options.saveDev)
      ) {
        printError(
          `Only ${chalk.bgGray.white("--online")} and ${chalk.bgGray.white("--production")} is permited if not have package arguments.`
        );
        return exit(1);
      }

      let json;

      try {
        json = await getPackageJson(process.cwd());
      } catch (_) {
        printError(
          "The package.json doesn't exists, please run " +
            chalk.bgGray.white("npm init")
        );
        return exit(1);
      }
      packages = [...Object.entries(json.dependencies || {})];

      if (!options.production) {
        packages.push(...Object.entries(json.devDependencies || {}));
      }
    }
    //
    // USER DEFINE PACKAGE INPUTS
    //
    else {
      // validate flags
      if (!isNil(options.production)) {
        printError(
          `The ${chalk.bgGray.white("--production")} flag isn't permited if have package arguments.`
        );
        return exit(1);
      }

      // set packages from user input
      try {
        packages = packagesInput.map((input) => parsePackageIdentifier(input));
      } catch (e) {
        printError(e instanceof Error ? e.message : "Failed");
        return exit(1);
      }
    }

    // get not exists packages
    const notExistsPackages: [string, string][] = [];
    for (const [name, version] of Array.from(packages)) {
      if (!getSatisfiesVersion(await getMetadata(), name, version)) {
        notExistsPackages.push([name, version]);
      }
    }

    if (notExistsPackages.length) {
      if (!options.online) {
        printWarning("The following packages do not exist in cache:");
        printList(
          notExistsPackages.map(([name, version]) => name + "@" + version),
          { color: "magenta", bullet: "-" }
        );
        printWarning(
          `Please, use ${chalk.bgGray.white("--online")} flag if you want to download and install at the same time.`
        );
        return exit(1);
      }

      printList(
        notExistsPackages.map(([name, version]) => name + "  @" + version),
        { color: "blue" }
      );
      print(`Found ${chalk.blue(notExistsPackages.length)} packages uncached.`);

      try {
        await printStep(
          "Downloading dependencies...",
          async () =>
            // TODO: remove this .map method and adapt cachePackage to accept these entries
            await cachePackage(
              packages.map(([name, version]) => name + "@" + version)
            )
        );
        printSuccess("All packages were saved in cache.");
      } catch (_) {
        return exit(1);
      }
    }

    // all is ok! now copy the modules:
    await printStep(
      "Installing dependencies...",
      async () =>
        await installFromCache(packages, {
          saveIn: options.noSave ? "none" : options.saveDev ? "dev" : "default",
        })
    );
    printList(
      packages.map(([name, version]) => name + "  @" + version),
      { bullet: "+", color: "blue" }
    );
    printSuccess("Installed " + packages.length + " packages.");
  });
