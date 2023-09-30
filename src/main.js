
const cfg = require("../config");
const fs = require("fs");
const processArgs = require("./helpers/args.js");


// Verify exists cached folder
if (!fs.existsSync(cfg.HOME)) {
    // Create cached module folder
    fs.mkdirSync(cfg.HOME);
    fs.writeFileSync(cfg.HOME + "/README.md", "This directory is for storing downloaded modules so that ONPM can use and copy them.");
    fs.writeFileSync(cfg.HOME + "/package.json", JSON.stringify({
        "name": "onpm-modules-cache",
        "version": "1.0.0",
        "dependencies": {}
      }, null, 2)
    );
}


// Get command arguments 
const argv = process.argv;
const argsMap = processArgs(argv, [], {ignoreFlagsError: true});
const arg0 = argsMap.arg0;

const cmds = [
    require("./cmd/download"),
    require("./cmd/install"),
    require("./cmd/no-cmd"),
];


let cmdFound = false;

for (const cmd of cmds) {
    if (cmd.cmds.includes(arg0)) {

        if (argsMap["-h"] || argsMap["--help"]) {
            let help = fs.readFileSync(cmd.helpDir, "utf-8");
            console.log(help);
            process.exit();
        }
        
        cmd.exec(argv);
        cmdFound = true;
        break;
    }
}

if (!cmdFound) {
    // no exist command!
    console.error(
        "Unknown command: \"" + arg0 + "\"\n\n" +
        "To see a list of supported onpm commands, run: \nonpm --help"
    );
}