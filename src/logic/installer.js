
const { copydirSync, isDirectory } = require("../helpers/fs");
const {red, yellow, green, cyan} = require("colors/safe");

const fs = require("fs");
const path = require("path");
const ora = require("ora-classic");

const LoadingTextBar = require("./loading");
const Json = require("../helpers/json");
const parseModuleName = require("../helpers/module-name-parser");
const cfg = require("../../config");

const homeModulesDir = cfg.HOME + "/node_modules"

/**
 * Manager to copy modules from one directory to another 
 * 
 * @param {string} projectDir - project folder 
 */
class Installer {
   
    constructor (projectDir) {
        const modulesDir = projectDir + "/node_modules";
        const packageDir = projectDir + "/package.json";
        
        if (!fs.existsSync(modulesDir)) fs.mkdirSync(modulesDir);
        if (!fs.existsSync(packageDir)) fs.writeFileSync(packageDir, "{}", "utf-8");
        
        this.projectDir = projectDir;
        this.modulesDir = modulesDir;
        this.pkg = new Json(packageDir);
        
        this.modulesCopied = {}; // using "copyModule" method
        this.modulesInstalled = {}; // using "install" method
        
        this.loading = new LoadingTextBar(0);
        this.spinner = ora({
            color: "cyan"
        });
        this.spinner.log = function (log) {
            this.stop();
            console.log(log);
            this.start();
        }
    }
    
    /**
     * Exists module 
     */
    _existsModule (moduleName) {
        const moduleDir = homeModulesDir + "/" + moduleName;
        return fs.existsSync(moduleDir);
    }
    
     
    /** 
     * Copy module 
     * 
     * @param {string} moduleName - name to copy 
     * @param {string} options.version - set version of the module 
     * @param {boolean} options.notBin - disable copy binaries (node executables)
     * @param {boolean} options.handleRecursive - handler copy step of others modules dependencies
     * 
     * @return {boolean} if copied successful or not
     */
    copyModule (moduleName, options = {}) { 
        const handleRecursive = options.handleRecursive || function(){};
        
        // Stop if already exists
        if (this.modulesCopied[moduleName]) return false;
        
        // Stop if not downloaded
        if (!this._existsModule(moduleName)) return false; 
        
        
        const fromDir = homeModulesDir + "/" + moduleName;
        const toDir = this.modulesDir + "/" + moduleName;
        const pkgDir = fromDir + "/package.json";
        
        //
        // Start copy module
        //
        copydirSync(fromDir, toDir);
        
        // Add to modules copied to remember in recursion
        const jsonData = new Json(pkgDir).data;
        this.modulesCopied[moduleName] = "^" + (jsonData.version || options.version || "0.0.0");
        
        //
        // Copy binary files
        //
        if (!options.notBin && jsonData.bin) {
            const binariesDir = this.modulesDir + "/.bin";
            const binaries = {};
            
            if (!fs.existsSync(binariesDir)) fs.mkdirSync(binariesDir);
        
            if (typeof(jsonData.bin) === "string") {
                // Is binary path !
                const binName = jsonData.name.split("/").pop();
                binaries[binName] = jsonData.bin;
            }
            else {
                // Is binary path collection ! 
                Object.assign(binaries, jsonData.bin);
            }
            
            // Start copy of binaries
            for (let binName in binaries) {
                const binDir = path.join(fromDir, binaries[binName]);
                const toBinDir = path.join(binariesDir, binName);
                
                fs.copyFileSync(binDir, toBinDir);
            }
        }
        
        //
        // Copy dependencies for INUSUAL nested node_modules folders
        //
        const nodeModulesDir = fromDir + "/node_modules";
        if (fs.existsSync(nodeModulesDir)) {
            const depList = fs.readdirSync(nodeModulesDir);
            for (let depName of depList) {
                const dir = path.join(nodeModulesDir, depName);
                if (isDirectory(dir)) {
                    const installer = new Installer(dir);
                    installer.modulesDir = this.modulesDir;
                    installer.modulesCopied = this.modulesCopied; 
                    Object.keys(installer.pkg.data.dependencies || {})
                    .forEach(depName => {
                        this.copyModule(depName)
                    }); 
                }
            }
        }
        
        //
        // Copy module dependencies recursively
        // 
        if (jsonData.dependencies) {
            for (const depName in jsonData.dependencies) {
                const version = jsonData.dependencies[depName];
                handleRecursive(depName); 
                this.copyModule(depName, {version});
            }
        }
        
        // Success!
        return true;
    }
    
    /**
     * Install modules from a dependencies map 
     * 
     * @param {string} key - dependencies map name (ex: "devDependencies")
     * @param {boolean} options.ignoreErrors - ignore installation errors
     */
    installAllFrom (key, options = {}) {
        const depList = Object.keys(this.pkg.data[key] || {});
        
        for (let depName of depList) {
            this.install(depName, options);
        } 
    }
    
    /**
     * Copy module to node_modules of project 
     * 
     * @param {string} moduleName - name to install 
     * @param {string} options.saveAs - where save the dependency name in the package.
     */
    install (moduleName, options = {}) {
        
        //
        // Get correct module name correct 
        //
        const moduleNotation = parseModuleName(moduleName);
        let version = moduleNotation.version;
            moduleName = moduleNotation.name;

        
        if (!this._existsModule(moduleName)) {
           
            // Oh no, module not cached! 
            console.error(
                red("\nfatal: ") + moduleName + " module is not available, please download to take it offline" + red("!") +
                yellow("\n\nhint: run `onpm download " + moduleName + "` and retry again")
            );
            return process.exit();
        }
        
        
        let moduleDir = homeModulesDir + "/" + moduleName;
        let pkgDir = moduleDir + "/package.json";
        
        let pkg = new Json(pkgDir);
        let cachePkg = new Json(cfg.HOME + "/package.json");
        
        // No version in module-name
        if (!version) {
            version = 
                cachePkg.data.dependencies[moduleName] ||
                "^" + pkg.data.version;
        }
        
        //
        // Copy or rewrite module
        //
        let fromDir = moduleDir;
        let toDir = this.modulesDir + "/" + moduleName;
        
        
        // progress bar
        const loading = this.loading;
        const spinner = this.spinner;
        
        const depLength = 1 + Object.keys(pkg.data.dependencies || {}).length;
        loading.progress = 0;
        loading.speed = 1 / depLength;
        spinner.text = "";
        spinner.start();
        
        if (moduleName.indexOf("@") === 0) {
            // Is a modules directory!
            let submoduleDir = path.join(toDir, "..");
            if (!fs.existsSync(submoduleDir)) fs.mkdirSync(submoduleDir);
        }
        
        //
        // Start Copy Files
        //
        this.copyModule(moduleName, {
            handleRecursive (name) {
                loading.update(); 
                spinner.prefixText = 
                    "\n" + cyan("install") + " " + moduleName + " module" + 
                    "\n" + loading.toString();
                spinner.text = "copy: " + green(name) + " submodule.";
                spinner.render();
            }
        });
        this.modulesInstalled[moduleName] = version;
        
        spinner.stop();

        //
        // Update package.json 
        //
        let saveAs = options.saveAs;
        if (options.saveAs) {
            if (!this.pkg.data[saveAs]) this.pkg.data[saveAs];
            this.pkg.data[saveAs][moduleName] = version;
            Object.sort(this.pkg.data[saveAs]); 
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