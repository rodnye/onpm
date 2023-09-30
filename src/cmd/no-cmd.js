
// Command file
// `onpm [flags]`

const {yellow} = require("colors/safe");

const cfg = require("../../config.js");
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
    // Use `onpm --version`
    // Print current ONPM version
    //
    if (argsMap["-v"] || argsMap["--version"]) {
        const pkg = new Json(cfg.DIR + "/package.json");
        console.log(pkg.data.version);
        return process.exit();
    }
    
    
    //
    // Use `onpm --list`
    // Print the cached modules
    //
    if (argsMap["-l"] || argsMap["-ls"] || argsMap["--list"]) {

        const pkg = new Json(cfg.HOME + "/package.json");
        const dep = pkg.data.dependencies || {}; 

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
    helpDir: cfg.DOCS + "/help.txt",
}