
const fs = require("fs");
const path = require("path");
const packageManager = require("./package-manager.js");
const PATH = "./node_modules";

//// INSTALADOR DE PAQUETES OFFLINE
const Installer = class {
  constructor (projectPath) {
    this.node_modules = path.join(projectPath, "node_modules");
    if (!fs.existsSync(this.node_modules)) fs.mkdirSync(this.node_modules);
    
    this.dir = projectPath;
    this.package = new packageManager(path.join(projectPath, "package.json"));
  }
  
  // instalar npm
  install (name, flags = "") {
    flags = flags.split(" ");
    let modPath = path.join(PATH, name);
    let mod;
    
    if (fs.existsSync(modPath)) {
      mod = fs.readFileSync(path.join(modPath, "package.json"));
      mod = JSON.parse(mod);
    }
    else throw new Error("ERROR: " + name + " module is not available, please install and save in this ./node_modules folder to take it offline");
    
    // copiar modulo
    let from = path.join(PATH, name);
    let to = path.join(this.node_modules, name);
   
    // si el modulo aún no existe
    if (!fs.existsSync(to)) {
      
      // si es un directorio de modulos
      if (/^@/.test(name)) {
        let submoduleDir = path.join(to, "..");
        if (!fs.existsSync(submoduleDir)) fs.mkdirSync(submoduleDir);
      }
      
      fs.cpdirSync(from, to);
      
      // si tiene dependencias continuar recursion
      if (mod.dependencies) {
        for (let dep in mod.dependencies) this.install(dep, "--hide");
      }
      console.log("Complete: Install " + name + " at: " + this.dir);
    }
    
    // guardar en package.json
    if (!flags.includes("--hide")) {
      if (flags.includes("--save")) this.package.addDependency(name, "^" + mod.version);
      if (flags.includes("--save-dev")) this.package.addDevDependency(name, "^" + mod.version);
      this.package.save();
    }
    
  }
  
}

module.exports = Installer;