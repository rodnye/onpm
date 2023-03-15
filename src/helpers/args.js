
const {red, yellow} = require("colors/safe");

/** 
 * Process a arguments array
 *
 * @param {process.argv} argv
 * @param {string[]} availableFlags
 * @param option.ignoreFlagsError {boolean} ignore Flags Error
 */
function processArgs (argv, availableFlags, options = {}) {
    
    const data = {
        args: [],
        arg0: null
    };
    
    argv = argv.slice(2);
    while (argv.length) {
        const arg = argv.shift();
        
        if (arg.indexOf("-") === 0) {
            // is an option flag!
            const _split = arg.split("=");
            const flag = _split[0];
            const value = _split[1] || true;
            
            if (!options.ignoreFlagsError && !availableFlags.includes(flag)) {
                // flag not found
                console.error(
                    red.bold("fatal: ") + "Unknown or unexpected option \"" + arg + "\"\n" +
                    yellow("hint: Use -h or --help flag to see the commands and their options")
                );
                process.exit();
            }
            data[flag] = value;
        }
        
        else {
            // is a parameter!
            data.args.push(arg);
        }
    }
    data.arg0 = data.args[0];
    
    
    return data;
}

module.exports = processArgs;