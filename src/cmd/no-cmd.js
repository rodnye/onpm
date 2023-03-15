// onpm --flags

const path = require("path");
const {yellow} = require("colors/safe");

const config = require("../../config.js");
const processArgs = require("../helpers/args.js");
const Json = require("../helpers/json.js");

const cmds = [undefined];
const flags = [
    "-v", "--version",
    "-l", "-ls", "--list"
];

function exec (argv) {
    const argsMap = processArgs(argv, flags);
    
    //
    // show version
    //
    if (argsMap["-v"] || argsMap["--version"]) {
        const pkg = new Json(
            path.join(config.DIR, "/package.json")
        );
        console.log(pkg.data.version);
        process.exit();
    }
    
    
    const pkg = new Json(
        path.join(config.CACHE, "/package.json")
    );
    const dep = pkg.data.dependencies || {};
    
    //
    // show cache modules
    //
    if (argsMap["-l"] || argsMap["-ls"] || argsMap["--list"]) {
        console.log("Cached and installed dependencies:")
        for (let depName in dep) {
            let depVersion = dep[depName].replace("^", "");
            console.log(yellow("|- ") + depName + "@" + depVersion);
        }
        process.exit();
    }
}

module.exports = {
    cmds,
    flags,
    exec,
    helpDir: path.join(config.DOCS, "/help.txt"),
}