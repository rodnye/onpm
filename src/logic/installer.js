const fs = require("fs");
const path = require("path");
const ora = require("ora-classic");
const {red, yellow, green, cyan} = require("colors/safe");

const LoadingTextBar = require("./loading.js");
const Json = require("../helpers/json.js");
const { copydirSync } = require("../helpers/fs.js");
const { MODULES_DIR } = require("../../config.js");


/**
 * Manager to copy modules from one directory to another 
 * 
 * @param {string} dir to project
 */
class Installer {
   
    constructor (projectDir) {
        const modulesDir = path.join(projectDir, "/node_modules");
        const packageDir = path.join(projectDir, "/package.json");
        
        if (!fs.existsSync(modulesDir)) fs.mkdirSync(modulesDir);
        if (!fs.existsSync(packageDir)) fs.writeFileSync(packageDir, "{}", "utf-8");
        
        this.dir = projectDir;
        this.modulesDir = modulesDir;
        this.pkg = new Json(path.join(projectDir, "package.json"));
        
        this.installed = {};
        this.modulesCopied = {};
        this.modulesInstalled = {};
        
        this.loading = new LoadingTextBar(0);
        this.spinner = ora({
            spinner: {
                frames: ["\\", "-", "/"]
            },
            color: "yellow"
        });
        this.spinner.log = function (log) {
            this.stop();
            console.log(log);
            this.start();
        }
    }
    
    /**
     * exists module 
     */
    _existsModule (moduleName) {
        const moduleDir = path.join(MODULES_DIR, moduleName);
        return fs.existsSync(moduleDir);
    }
    
     
    /** 
     * copy module 
     * 
     * @param {string} module name to copy 
     * @param options.version {string} version of the module
     * @param options.recursive {boolean} copy others modules dependencies 
     * 
     * @retun {boolean} if copied successful or not
     */
    _copyModule (moduleName, options = {}) {
        const modulesCopied = this.modulesCopied;
        const onRecursive = options.onRecursive || function(){};
        
        // stop if is copied
        if (modulesCopied[moduleName]) return false;
        
        const fromDir = path.join(MODULES_DIR, moduleName);
        const toDir = path.join(this.modulesDir, moduleName);
        const pkgDir = path.join(fromDir, "package.json");
        
        copydirSync(fromDir, toDir);
        
        // add to modules copied
        const json = new Json(pkgDir).data || {};
        modulesCopied[moduleName] = "^" + (json.version || options.version || "0.0.0");
        
        // copy module dependencies recursively 
        if (options.recursive && json.dependencies) {
            for (const depName in json.dependencies) {
                const version = json.dependencies[depName];
                onRecursive(depName);
                this._copyModule(depName, {version, recursive: true});
            }
        }
        
        return true;
    }
    
    /**
     * copy module to node_modules of project 
     * 
     * @param {string} module name to install 
     * @param {string} a string with options 
     */
    install (moduleName, flags) {
        
        flags = (flags || "").split(" ");
        
        if (!this._existsModule(moduleName)) {
           
            // oh no, module not stored!
            console.error(
                red("ERROR: ") + moduleName + " module is not available, please download to take it offline" + red("!") +
                yellow("\nhint: Use \"onpm download " + moduleName + "\" and retry again...")
            );
            process.exit();
            
        }
        
        
        let moduleDir = path.join(MODULES_DIR, moduleName);
        let pkgDir = path.join(moduleDir, "/package.json");
        
        let pkg = new Json(pkgDir);
        let pkgMap = pkg.data;
        
        
        
        //
        // copy or rewrite module
        //
        let fromDir = moduleDir;
        let toDir = path.join(this.modulesDir, moduleName);
        
        
        // progress bar
        const loading = this.loading;
        const spinner = this.spinner;
        const depLength = 1 + Object.keys(pkgMap.dependencies || {}).length;
        loading.progress = 0;
        loading.speed = 100 / depLength;
        spinner.text = cyan("install") + " " + moduleName + " module.";
        spinner.start();
        
        spinner.log(
            green("\nInstalling ") + moduleName + " module..."
        );
        
        if (moduleName.indexOf("@") === 0) {
            // is a modules directory!
            let submoduleDir = path.join(toDir, "..");
            if (!fs.existsSync(submoduleDir)) fs.mkdirSync(submoduleDir);
        }
        
        // copy files
        this._copyModule(moduleName, {
            recursive: true,
            onRecursive (name) {
                loading.update();
                //console.log("copy " + name)
                spinner.prefixText = loading.toString();
                spinner.text = yellow("copy ") + name + " submodule.";
                spinner.render();
            }
        });
        this.modulesInstalled[moduleName] = pkgMap.version;
       
        spinner.stop();
        console.log(
            green.bold("complete: ") + moduleName
        );

        //
        // update package.json 
        //
        if (!flags.includes("--no-save")) {
            const projectPkg = this.pkg.data;
            
            if (flags.includes("--save") || flags.includes("-S")) {
                if (!projectPkg.dependencies) projectPkg.dependencies = {};
                projectPkg.dependencies[moduleName] = "^" + pkgMap.version;
                Object.sort(projectPkg.dependencies);
            }
            if (flags.includes("--save-dev")) {
                if (!projectPkg.devDependencies) projectPkg.devDependencies = {};
                projectPkg.devDependencies[moduleName] = "^" + pkgMap.version;
                Object.sort(projectPkg.devDependencies);
            }
            this.pkg.save(2);
        }

    }

}


/**
 * reorder object keys
 */
Object.sort = function (object, sortCallback) {
    const keys = Object.keys(object);
    
    keys.sort(sortCallback);
    keys.forEach(key => {
        const value = object[key];
        delete object[key];
        object[key] = value;
    });
}

module.exports = Installer;