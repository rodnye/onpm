import { program } from "commander";
import { cacheCommand } from "./cmd/cache";
import { installCommand } from "./cmd/install";
import { readFileSync } from "fs";

const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));

program
  .version(packageJson.version)
  .addCommand(installCommand)
  .addCommand(cacheCommand)
  .parse();
