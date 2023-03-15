// onpm download
// onpm d
const path = require("path");
const {red} = require("colors/safe");
const config = require("../../config.js");

const processArgs = require("../helpers/args.js");
const Json = require("../helpers/json.js");
const downloadModule = require("../logic/downloader.js");

const cmds = ["download", "d"];
const flags = [
    "--prod",
    "--production"
];




/**
 * exec the command
 */
function exec (argv) {
    const argsMap = processArgs(argv, flags);
    let modulesNames = argsMap.args.slice(1);
    
    
    if (!modulesNames[0]) {
        // no defined modules!
        // use package.json dependencies
        const cwd = process.cwd();
        const pkg = new Json(path.join(cwd, "/package.json"))
        
        if (pkg.error) {
            console.error(red.bold("fatal: ") + pkg.error);
            process.exit();
        }
        
        let depList = Object.keys(pkg.dependencies || {});
        let devDepList = Object.keys(pkg.devDependencies || {});
        
        // add dependencies of package.json
        modulesNames = modulesNames.concat(depList);
        
        if (!argsMap["--production"] || !argsMap["--prod"]) {
            // no production mode!
            // add devDependencies of package.json
            modulesNames = modulesNames.concat(devDepList);
        }
        
    }
    
    let promise = new Promise(response => response());
    
    // download each module
    modulesNames.forEach(moduleName => {
        promise = promise.then(exitCode => {
            return downloadModule(moduleName);
        });
    });
}


module.exports = {
    cmds,
    flags,
    exec,
    helpDir: path.join(config.DOCS, "/download.txt"),
};