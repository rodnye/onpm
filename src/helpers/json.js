
const fs = require("fs");

/**
 * Manipulate json files
 */
class Json {
    constructor (jsonDir) {
       
        this.jsonDir = jsonDir;
        
        try {
            const file = fs.readFileSync(jsonDir);
            this.data = JSON.parse(file);
        }
        catch (error) {
            this.error = error;
            this.data = {}
        }
        
    }
    
    save (spaces = 2) {
        const jsonMap = this.data;
        const json = JSON.stringify(jsonMap, null, spaces);
        
        fs.writeFileSync(this.jsonDir, json);
    }
}

module.exports = Json;