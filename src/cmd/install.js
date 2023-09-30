
// Command file
// `onpm install`

const cfg = require("../../config");
const { yellow, green, red, cyan } = require("colors/safe");

const processArgs = require("../helpers/args"); 
const Installer = require("../logic/installer");


const cmds = ["install", "i"];
const flags = [
    "-h", "--help",
    "-S", "--save", 
    "-D", "--save-dev",
    "-N", "--no-save", 
    "--prod", "--production",
];


function exec (argv) {
    const cwd = process.cwd();
    const argsMap = processArgs(argv, flags);
    let modulesNames = argsMap.args.slice(1);
    
    
    const installer = new Installer(cwd);
    const pkg = installer.pkg;
    
    //
    // Install modules
    //
    console.log(cyan.bold("Starting..."));
    
    if (!modulesNames[0]) {
        // No defined modules!
        // Install all dependencies
        
        if (pkg.error) {
            console.error(red.bold("fatal: ") + pkg.error);
            process.exit();
        }
        
        installer.installDependencies();
        
        if (!argsMap["--production"] || !argsMap["--prod"]) {
            // no production mode!
            installer.installDevDependencies();
        }
    }
    
    else {
        // Have defined modules to install
        let f = "--save";
        if (argsMap["--no-save"] || argsMap["-N"]) f = "--no-save";
        if (argsMap["--save-dev"] || argsMap["-D"]) f = "--save-dev";
        
        modulesNames.forEach(moduleName => {
            installer.install(moduleName, f);
        });
    }
    
    
    //
    // Print end results
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
    helpDir: cfg.DOCS + "/install.txt",
};