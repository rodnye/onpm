
// Command file
// `onpm download`

const { HOME } = require("../../config.js");
const processArgs = require("../helpers/args");
const Json = require("../helpers/json");
const {red, cyan} = require("colors/safe");
const {downloadModule, downloadModulesGroup} = require("../logic/downloader");

const cmds = ["download", "d"];
const flags = [
    "--fast",
    "-f", "--force",
    "--prod", "--production",
];


// Execute the command
function exec (argv) {
    const argsMap = processArgs(argv, flags, {});
    let modulesNames = argsMap.args.slice(1);
    
    
    if (!modulesNames[0]) {
        // No defined modules in prompt !!
        // Use package.json dependencies
        const cwd = process.cwd();
        const pkg = new Json(cwd + "/package.json");
        
        // Syntax error or not found
        if (pkg.error) {
            console.error(red.bold("fatal: ") + pkg.error);
            return process.exit();
        }
        
        let depList = Object.keys(pkg.data.dependencies || []);
        let devDepList = Object.keys(pkg.data.devDependencies || []);
        
        // Add dependencies of package.json
        modulesNames = modulesNames.concat(depList);
        
        if (!argsMap["--production"] || !argsMap["--prod"]) {
            // No production mode!
            // Add devDependencies of package.json
            modulesNames = modulesNames.concat(devDepList);
        }
        
    }
    
    // Exclude modules if exists
    let ignoredModules = [];
    if (!args["-f"] && !argsMap["--force"]) {
        let downloadedModules = new Json(HOME + "/package.json");
        downloadedModules = Object.keys(downloadedModules.data.dependencies);
        
        // Remove of already downloaded
        modulesNames = modulesNames.filter((item) => {
            if (downloadedModules.includes(item)) {
                ignoredModules.push(item);
                return false;
            }
        });
    }
    
    // Show ignored modules 
    if (ignoredModules.length) {
        console.log(
            cyan("Already downloaded dependencies:") I 
          + cyan("\n * ") + ignoredModules.join(cyan("\n * ")) 
          + "\n\n"
        );
    }
    
    if (argsMap["--fast"]) {
        //
        // fast mode!
        //
        downloadModulesGroup(modulesNames);
    }
    
    else {
        let promise = new Promise(response => response());
    
        // download each module
        modulesNames.forEach(moduleName => {
            promise = promise.then(exitCode => {
                return downloadModule(moduleName);
            });
        });
    }
}


module.exports = {
    cmds,
    flags,
    exec,
    helpDir: require("../../config").DOCS + "/download.txt",
};