import { Command } from "commander";
import { cachePackage } from "../logic/cache";
import { getPackageJson } from "../utils/pkg";
import { print, printList, printStep } from "../utils/print";

export const installCommand = new Command("cache");

installCommand
  .alias("c")
  .argument("[packages...]", "The packages to install")
  .option("-f, --force", "Force the download")
  .option("-c, --cache, --only-cache", "Only install from cache")
  .option("-P, --save-prod", "Cache only production dependencies")
  .option("-D, --save-dev", "Cache only dev dependencies")
  .description("Download and cache the dependencies")
  .action(async (packagesInput: string[], options) => {
    let packages: string[];

    if (!packagesInput || packagesInput.length === 0) {
      const json = await getPackageJson(process.cwd());
      packages = [];
      if (!options.saveDev) {
        packages.push(...Object.keys(json.dependencies || {}));
      }

      if (!options.saveProd) {
        packages.push(...Object.keys(json.devDependencies || {}));
      }
    } else {
      packages = packagesInput;
    }

    await printStep(
      "Downloading dependencies...",
      async () => await cachePackage(packages)
    );
    printList(packages, { bullet: "+", color: "blue" });
  });
