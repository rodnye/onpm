import { program } from "commander";
import { cacheCommand } from "./cmd/cache";
import { installCommand } from "./cmd/install";

program
  .addCommand(installCommand)
  .addCommand(cacheCommand)
  .parse();
