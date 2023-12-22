
const {red, yellow} = require("colors/safe");

/** 
 * Process a arguments array
 *
 * @param {process.argv} _argv
 * @param {string[]} availableFlags
 * @param {boolean} options.ignoreFlagsError - ignore Flags Error
 */
function processArgs (argv, availableFlags, options = {}) {
    
    // Output object
    const data = {
        args: [],
        arg0: null,
        "": [],
    };
    
    // Remove unnecesary default params
    argv = argv.slice(2);
    
    // Loop params
    let currentFlag = "";
    while (argv.length) {
        const arg = argv.shift();
        
        if (arg.indexOf("-") === 0) {
            // Is an option flag! 
            const flag = arg;
            data[flag] = [];
            currentFlag = arg;

            if (!options.ignoreFlagsError && !availableFlags.includes(flag)) {
                // Flag not found
                console.error(
                    red.bold("fatal: ") + "Unknown or unexpected option \"" + arg + "\"\n" +
                    yellow("hint: Use -h or --help flag to see the commands and their options")
                );
                process.exit();
            }


        }
        else {
            // Is a parameter or value !
            data.args.push(arg);
            data[currentFlag].push(arg);
        }
    }
    
    // Set initial param
    data.arg0 = data.args[0];
    
    
    return data;
}

module.exports = processArgs;