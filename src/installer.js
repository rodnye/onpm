
const fs = require("fs");
const path = require("path");
const packageManager = require("./package-manager.js");
const PATH = "node_modules";

// obtener lista de modulos disponibles a partir del package-lock.json
const modules = JSON.parse(
  fs.readFileSync(
    path.join(PATH, ".package-lock.json"), "utf-8"
  )
).packages;
   

//// INSTALADOR DE PAQUETES OFFLINE
const Installer = class {
  constructor (proyectPath) {
    this.node_modules = path.join(proyectPath, "node_modules");
    if (!fs.existsSync(this.node_modules)) fs.mkdirSync(this.node_modules);
    
    this.dir = proyectPath;
    this.package = new packageManager(path.join(proyectPath, "package.json"));
  }
  
  // instalar npm
  install (name, flags = "") {
    flags = flags.split(" ");
    let mod = modules["node_modules/" + name];
    if (!mod) return console.error("ERROR: module " + name + " isn't available")
    
    // copiar modulo
    let from = path.join(PATH, name);
    let to = path.join(this.node_modules, name);
   
    if (!fs.existsSync(to)) {
      fs.cpdirSync(from, to);
      
      // si tiene dependencias continuar recursion
      if (mod.dependencies) {
        for (let dep in mod.dependencies) {
          this.install(dep);
        }
      }
      console.log("Complete: Install " + name + " at: " + this.dir);
    }
    
    // guardar en package.json
    if (flags.includes("--save")) this.package.addDependency(name, "^" + mod.version);
    if (flags.includes("--save-dev")) this.package.addDevDependency(name, "^" + mod.version);
    this.package.save();
    
  }
  
}

module.exports = Installer;