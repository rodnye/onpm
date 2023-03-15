/**
 * create and update a loading bar in console 
 * [#######.....] 
 */
const {yellow} = require("colors/safe");

class LoadingTextBar {
    constructor (speed) {
        this.speed = speed || 0;
        this.progress = 0;
    }
    
    update () {
        this.progress += this.speed;
    }
   
   
    toString () {
        let bars = Math.floor(this.progress / 100 * 15);

        let string = "";
        for (let i = 0; i < 15; i++) {
            if (i <= bars) string += "#";
            else string += ".";
        }
        return "[" + yellow(string) + "]";
    }
}

module.exports = LoadingTextBar;