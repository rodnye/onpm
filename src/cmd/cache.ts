import { Command } from "commander";
import { cachePackage } from "../logic/cache";
import { getPackageJson } from "../utils/pkg";
import { printError, printList, printStep, printWarning, printSuccess } from "../utils/print";
import chalk from "chalk";
import { exit } from "process";

export const cacheCommand = new Command("cache");

cacheCommand
  .alias("c")
  .argument("[packages...]", "The packages to cache")
  .option("-f, --force", "Force the download")
  .option("-P, --save-prod", "Cache only production dependencies")
  .option("-D, --save-dev", "Cache only dev dependencies")
  .description("Download and cache the dependencies")
  .action(async (packagesInput: string[], options) => {
    let packages: string[];

    if (!packagesInput || packagesInput.length === 0) {
      let json;

      try {
        json = await getPackageJson(process.cwd());
      } catch (_) {
        printError(
          "The package.json doesn't exists, please run " +
            chalk.bgGray.white("npm init") + "."
        );
        return exit(1);
      }
      packages = [];
      if (!options.saveDev) {
        packages.push(...Object.keys(json.dependencies || {}));
      }

      if (!options.saveProd) {
        packages.push(...Object.keys(json.devDependencies || {}));
      }

      if (packages.length === 0) {
        printWarning("No dependencies found to cache.");
        return exit(0);
      }
    } else {
      packages = packagesInput;
    }

    try {
      await printStep(
        "Downloading dependencies...",
        async () => await cachePackage(packages)
      );
    } catch (_) {
      printError("Failed to cache some packages.");
      return exit(1);
    }

    printList(packages, { bullet: "+", color: "blue" });
    printSuccess("Cached " + packages.length + " packages.");
  });
