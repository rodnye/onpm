
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
 * @param {boolean} options.hiddenConsole - show or remove console log
 */
class Installer {
   
    constructor (projectDir, options) {
        const modulesDir = projectDir + "/node_modules";
        const packageDir = projectDir + "/package.json";
        
        if (!fs.existsSync(modulesDir)) fs.mkdirSync(modulesDir);
        if (!fs.existsSync(packageDir)) fs.writeFileSync(packageDir, "{}", "utf-8");
        
        this._options = options || {};
        this.dir = projectDir;
        this.modulesDir = modulesDir;
        this.pkg = new Json(packageDir);
        
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
     * @param {boolean} options.recursive - enable copy others modules dependencies
     * @param {boolean} options.notBin - disable copy binaries (node executables)
     * @param {boolean} options.handleRecursive - handler copy step of others modules dependencies
     * 
     * @return {boolean} if copied successful or not
     */
    _copyModule (moduleName, options = {}) {
        const modulesCopied = this.modulesCopied;
        const handleRecursive = options.handleRecursive || function(){};
        
        // Stop if already exists
        if (modulesCopied[moduleName]) return false;
        
        const fromDir = homeModulesDir + "/" + moduleName;
        const toDir = this.modulesDir + "/" + moduleName;
        const pkgDir = fromDir + "/package.json";
        
        //
        // Start copy module
        //
        copydirSync(fromDir, toDir);
        
        // Add to modules copied to remember in recursion
        const jsonData = new Json(pkgDir).data;
        modulesCopied[moduleName] = "^" + (jsonData.version || options.version || "0.0.0");
        
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
                    const installer = new Installer(dir, {hiddenConsole: true});
                    installer.modulesDir = this.modulesDir;
                    installer.modulesCopied = this.modulesCopied;
                    installer.modulesInstalled = this.modulesInstalled;
                    installer.installDependencies();
                }
            }
        }
        
        //
        // Copy module dependencies recursively
        // 
        if (options.recursive && jsonData.dependencies) {
            for (const depName in jsonData.dependencies) {
                const version = jsonData.dependencies[depName];
                handleRecursive(depName);
                this._copyModule(depName, {version, recursive: true});
            }
        }
        
        // Success!
        return true;
    }
    
    /**
     * Install all dependencies
     */
    installAll () {
        this.installDependencies();
        this.installDevDependencies();
    }
    
    /**
     * Install dependencies from package.json
     */
    installDependencies () {
        const depList = Object.keys(this.pkg.data.dependencies || {});
        
        for (let depName of depList) {
            this.install(depName, "--no-save");
        }
    }
    
    /**
     * Install dev dependencies from package.json
     */
    installDevDependencies () {
        const depList = Object.keys(this.pkg.data.devDependencies || {});
        
        for (let depName of depList) {
            this.install(depName, "--no-save");
        }
    }
    
    /**
     * copy module to node_modules of project 
     * 
     * @param {string} moduleName - name to install 
     * @param {string} flags - string with options 
     */
    install (moduleName, flags) {
        flags = (flags || "").split(" ");
        const _hiddenConsole = this._options.hiddenConsole;
        
        //
        // Get correct module name correct 
        //
        const moduleNotation = parseModuleName(moduleName);
        let version = moduleNotation.version;
            moduleName = moduleNotation.name;

        
        if (!this._existsModule(moduleName)) {
           
            // Oh no, module not cached!
            console.error(
                red("ERROR: ") + moduleName + " module is not available, please download to take it offline" + red("!") +
                yellow("\nhint: Use \"onpm download " + moduleName + "\" and retry again...")
            );
            return process.exit();
        }
        
        
        let moduleDir = homeModulesDir + moduleName;
        let pkgDir = moduleDir + "/package.json";
        
        let pkg = new Json(pkgDir);
        let pkgData = pkg.data;
        let cachePkgData = new Json(cfg.HOME + "/package.json").data;
        
        // No version in module-name
        if (!version) {
            version = 
                cachePkgData.dependencies[moduleName] ||
                "^" + pkgData.version;
        }
       
        
        //
        // Copy or rewrite module
        //
        let fromDir = moduleDir;
        let toDir = this.modulesDir + "/" + moduleName;
        
        
        // progress bar
        const loading = this.loading;
        const spinner = this.spinner;
        
        if (!_hiddenConsole) {
            const depLength = 1 + Object.keys(pkgData.dependencies || {}).length;
            loading.progress = 0;
            loading.speed = 100 / depLength;
            spinner.text = cyan("install") + " " + moduleName + " module.";
            spinner.start();
            
            spinner.log(
                green("\nInstalling ") + moduleName + " module..."
            );
        }
        
        if (moduleName.indexOf("@") === 0) {
            // Is a modules directory!
            let submoduleDir = path.join(toDir, "..");
            if (!fs.existsSync(submoduleDir)) fs.mkdirSync(submoduleDir);
        }
        
        //
        // Start Copy Files
        //
        this._copyModule(moduleName, {
            recursive: true,
            handleRecursive: _hiddenConsole ? null : name => {
                loading.update(); 
                spinner.prefixText = loading.toString();
                spinner.text = yellow("copy ") + name + " submodule.";
                spinner.render();
            }
        });
        this.modulesInstalled[moduleName] = pkgData.version;
        
        if (!_hiddenConsole) {
            spinner.stop();
            console.log(
                green.bold("complete: ") + moduleName
            );
        }

        //
        // Update package.json 
        //
        if (!flags.includes("--no-save")) {
            const projectPkg = this.pkg.data;
                
            if (flags.includes("--save") || flags.includes("-S")) {
                if (!projectPkg.dependencies) projectPkg.dependencies = {};
                projectPkg.dependencies[moduleName] = version;
                Object.sort(projectPkg.dependencies);
            }
            if (flags.includes("--save-dev")) {
                if (!projectPkg.devDependencies) projectPkg.devDependencies = {};
                projectPkg.devDependencies[moduleName] = version;
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