
// Command file
// `onpm install`

const cfg = require("../../config");
const { green, red, cyan } = require("colors/safe");

const processArgs = require("../helpers/args"); 
const Installer = require("../logic/installer");


const cmds = ["install", "i"];
const flags = [
    "-h", "--help",
    "-S", "--save", "--save-prod", 
    "-D", "--save-dev",
    "-N", "--no-save", 
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
    let saveProd = argsMap["-S"] || argsMap["--save"] || argsMap["--save-prod"];
    let saveDev = argsMap["-D"] || argsMap["--save-dev"];
    let saveAll = !saveProd && !saveDev;
    
    if (!modulesNames[0]) {
        // No defined modules!
        // Install all dependencies
        
        if (pkg.error) {
            console.error(red.bold("fatal: ") + pkg.error);
            process.exit();
        }
        
        if (saveAll || saveProd) installer.installAllFrom("dependencies"); 
        if (saveAll || saveDev) installer.installAllFrom("devDependencies");
    }
    
    else {
        // Have defined modules to install
        let saveAs = "dependencies"
        if (saveDev) saveAs = "devDependencies";
        if (argsMap["-N"] || argsMap["--no-save"]) saveAs = null;
        
        modulesNames.forEach(moduleName => {
            installer.install(moduleName, {saveAs});
        });
    }
    
    
    //
    // Print end results
    //
    let installed = installer.modulesInstalled;
    let copied = installer.modulesCopied;
   
    console.log(
        "\n  Installed " + green.bold(Object.keys(installed).length + "") + " dependencies with " +
        green.bold(Object.keys(copied).length+"") + " modules."
    );
    for (let moduleName in installed) {
        let version = installed[moduleName];
        console.log(cyan.bold("|- ") + moduleName + "@" + version);
    }
    
    console.log("");
}


module.exports = {
    cmds,
    flags,
    exec,
    helpDir: cfg.DOCS + "/install.txt",
};