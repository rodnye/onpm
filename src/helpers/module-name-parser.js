
/**
 * Parse the module name notation
 * 
 * @param {string} input - a module name notation
 * @return {{name: string, version: string}}
 */
function parseModuleName (input) {
    
    let nameSplit = input.split("@");
    let name;
    let version;
        
    if (nameSplit[0]) {
        // For syntax `module@version`...
        name = nameSplit[0];
        version = nameSplit[1];
    }
    else {
        // For syntax `@folder/module@version`
        name = "@" + nameSplit[1];
        version = nameSplit[2];
    }

    return {
        name,
        version,
    }
}

module.exports = parseModuleName;