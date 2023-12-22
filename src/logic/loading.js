
const {gray, bgGray, white, bgWhite} = require("colors/safe")

/**
* Class representing a loading text bar
*/
class LoadingTextBar {
    /**
    * Create a loading text bar
    * @param {number} speed - The speed of the progress
    */
    constructor (speed) {
        this.speed = speed || 0; // The speed of the progress, defaults to 0
        this.progress = 0; // The progress of the loading bar in fraction 0 to 1
    }
    
    /**
    * Update the progress of the loading bar
    */
    update () {
        this.progress += this.speed; // Increment the progress by the speed
    }
   
    /**
    * Convert the loading bar to a string representation
    * @returns {string} The string representation of the loading bar
    */
    toString () {
        let bars = Math.floor(this.progress * 15);

        let string = "";
        for (let i = 0; i < 15; i++) {
            if (i <= bars) string += bgWhite(white("#")); // For filled bars
            else string += bgGray(gray(".")); // For empty bars
        }
        return "[" + string + "]"; // Return the string representation with colors
    }
}

module.exports = LoadingTextBar;