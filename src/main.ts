import { program } from "commander";
import { cacheCommand } from "./cmd/cache";
import { readFileSync } from "fs";

program
  .addCommand(cacheCommand)
  .parse();
