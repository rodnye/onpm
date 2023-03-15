
const chld = require("child_process");
const {cyan, red, yellow} = require("colors/safe");
const ora = require("ora-classic");
const config = require("../../config");

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
            {cwd: config.CACHE}
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
            console.log("\nchild process " + yellow("exited") + " with code " + code);
            response(code);
        });
    });
    
}

module.exports = downloadModule;