
const chld = require("child_process");
const {cyan, green, red, yellow} = require("colors/safe");
const ora = require("ora-classic");
const cfg = require("../../config");


/** 
 * download all modules in a single process
 */
function downloadModulesGroup (modulesNames) {
    return new Promise((response) => {
        const spinner = ora({
            color: "cyan",
            text: "Downloading modules: " + modulesNames.join(", "),
        });

        spinner.start();

        // execute npm command on cache folder
        let npm = chld.spawn(
            "npm", (["install", "--save"]).concat(modulesNames),
            { cwd: cfg.HOME }
        );

        npm.stdout.on("data", data => {
            spinner.stop();
            console.log(Buffer.from(data).toString());
            spinner.start();
        });

        npm.stderr.on('data', data => {
            spinner.stop();
            console.error(red.bold("stderr: ") + data);
            spinner.start();
        });

        npm.on('close', code => {
            spinner.stop();
            if(code === 0) {
                console.log(green("complete: ") + "* " + modulesNames.join("\n* ") + "\n");
            }
            else console.log(red("\nchild process exited with code " + code));
            response(code);
        });
    });
}

/** 
 * download and cache a module 
 * 
 * @param {string} module name
 * @return {Promise}
 */
function downloadModule (moduleName) {
    return new Promise (response => {
        const spinner = ora({
            color: "cyan",
            text: "Downloading " + cyan.bold(moduleName) + " module...",
        });
        
        spinner.start();
        
        // execute npm command on cache folder
        let npm = chld.spawn(
            "npm", ["install", "--save", moduleName],
            {cwd: cfg.HOME}
        );
    
        npm.stdout.on("data", data => {
            spinner.stop();
            console.log(Buffer.from(data).toString());
            spinner.start();
        });

        npm.stderr.on('data', data => {
            spinner.stop();
            console.error(red.bold("stderr: ") + data);
            spinner.start();
        });
        
        npm.on('close', code => {
            spinner.stop();
            if (code === 0) {
                console.log(green("complete: ") + moduleName + "\n");
            }
            else console.log(red("\nchild process exited with code " + code));
            response(code);
        });
    });
    
}

module.exports = {
    downloadModule, 
    downloadModulesGroup,
}