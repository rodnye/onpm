
const {
  existsSync, 
  mkdirSync, 
  readFileSync,
  readdirSync,
  copyFileSync,
  statSync,
} = require("fs");

const path = require("path");
const packageManager = require("./package-manager.js");
const PATH = global.modulesPath;


//// INSTALADOR DE PAQUETES OFFLINE
const Installer = class {
  constructor (projectPath) {
    this.node_modules = path.join(projectPath, "node_modules");
    if (!existsSync(this.node_modules)) mkdirSync(this.node_modules);
    
    this.history = {
      modules: [],
      installs: []
    };
    this.dir = projectPath;
    this.package = new packageManager(path.join(projectPath, "package.json"));
  }
  
  // instalar npm
  install (name, flags = "") {
    flags = flags.split(" ");
    let history = this.history;
    let modPath = path.join(PATH, name);
    let mod;
    
    if (existsSync(modPath)) {
      mod = readFileSync(path.join(modPath, "package.json"));
      mod = JSON.parse(mod);
    }
    else {
      console.error(
        "ERROR: ".red + name + " module is not available, please download to take it offline" + "!".red +
        ("\nhint: download module >    $onpm download " + name).yellow
      );
      process.exit();
    }
     
    // copiar modulo
    let from = path.join(PATH, name);
    let to = path.join(this.node_modules, name);
   
    // si el modulo aún no existe
    if (!existsSync(to)) {
      
      // si es un directorio de modulos
      if (/^@/.test(name)) {
        let submoduleDir = path.join(to, "..");
        if (!existsSync(submoduleDir)) mkdirSync(submoduleDir);
      }
      
      cpdirSync(from, to);
      
      // si tiene dependencias continuar recursion
      if (mod.dependencies) {
        for (let dep in mod.dependencies) this.install(dep, "--hide");
      }
      console.log("complete: ".green + "install " + name);
      history.modules.push(name);
    }
    
    // guardar en package.json
    if (!flags.includes("--hide")) {
      if (flags.includes("--save")) this.package.addDependency(name, "^" + mod.version);
      if (flags.includes("--save-dev")) this.package.addDevDependency(name, "^" + mod.version);
      this.package.save();
      history.installs.push(name + "@" + mod.version);
    }
    
  }
  
}

// fs: copiar directorio recursivamente
function cpdirSync (currentDir, targetDir) {
  recursive("");
  function recursive (dir) {
    let realDir = path.join(currentDir, dir);
    let copyDir = path.join(targetDir, dir);

    if (statSync(realDir).isDirectory()) {
      mkdirSync(copyDir);
      for (let i of readdirSync(realDir)) recursive(path.join(dir, i));
    } else copyFileSync(realDir, copyDir);
  }
};

module.exports = Installer;