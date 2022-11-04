const fs = require("fs");


/// Gestionar package.json
const PackageManager = class {
  constructor (dir) {
    this.dir = dir;
    this.load();
  }
  
  // añadir dependencia
  addDependency (name, version, isDev) {
    let type = isDev ? "devDependencies" : "dependencies";
    let json = this.json;
  
    if (!json[type]) json[type] = {};
    json[type][name] = version;
  }
  
  // añadir dependencia de desarrollador
  addDevDependency (name, version) {
    this.addDependency(name, version, true);
  }
  
  // tomar valor del package.json
  load () {
    let file = fs.readFileSync(this.dir);
    let json = JSON.parse(file);
    this.json = json;
  }
  
  // guardar valor del package.json
  save () {
    let file = JSON.stringify(this.json, null, 2);
    let dir = this.dir;
    fs.writeFileSync(dir, file);
  }
};

module.exports = PackageManager;