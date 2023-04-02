// onpm i
// onpm install
const path = require("path");
const { yellow, green, red, cyan } = require("colors/safe");
const config = require("../../config.js");

const processArgs = require("../helpers/args.js");
const Json = require("../helpers/json.js");
const Installer = require("../logic/installer.js");

const cmds = ["install", "i"];
const flags = [
    "--help", "-h",
    "--save", "-S",
    "--save-dev",
    "--no-save",
    
    "--production",
];


function exec (argv) {
    const cwd = process.cwd();
    const argsMap = processArgs(argv, flags);
    let modulesNames = argsMap.args.slice(1);
    
    
    const installer = new Installer(cwd);
    const pkg = installer.pkg;
    
    //
    // install modules
    //
    console.log(cyan.bold("Starting..."));
    
    if (!modulesNames[0]) {
        // no defined modules!
        // install all dependencies
        
        if (pkg.error) {
            console.error(red.bold("fatal: ") + pkg.error);
            process.exit();
        }
        
        installer.installDependencies();
        
        if (!argsMap["--production"]) {
            // no production mode!
            installer.installDevDependencies();
        }
    }
    
    else {
        // have modules to install
        let f = "--save";
        if (argsMap["--no-save"]) f = "--no-save";
        if (argsMap["--save-dev"]) f = "--save-dev";
        
        modulesNames.forEach(moduleName => {
            installer.install(moduleName, f);
        });
    }
    
    
    //
    // show results
    //
    let installed = installer.modulesInstalled;
    let copied = installer.modulesCopied;
   
    console.log(
        "\n  Installed " + green(Object.keys(installed).length + "") + " dependencies with " +
        green(Object.keys(copied).length+"") + " modules."
    );
    for (let moduleName in installed) {
        let version = installed[moduleName];
        console.log(yellow("|- ") + moduleName + "@" + version);
    }
}


module.exports = {
    cmds,
    flags,
    exec,
    helpDir: path.join(config.DOCS, "/install.txt"),
};