#! /usr/bin/env node
const path = require("path");
const fs = require("fs");

const processArgs = require("./helpers/args.js");
const Installer = require("./logic/installer.js");

//
// Arguments 
//
const argv = process.argv;
const argsMap = processArgs(argv, [], {ignoreFlagsError: true});
const arg0 = argsMap.arg0;


const cmds = [
    require("./cmd/download.js"),
    require("./cmd/install.js"),
    require("./cmd/no-cmd.js"),
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