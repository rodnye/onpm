const fs = require("fs");
const path = require("path");
const Installer = require("./src/installer.js");

// ruta de modulos
global.PATH = {
  modules: path.join(__dirname, "node_modules"),
}

// fs: copiar directorio recursivamente
fs.cpdirSync = function (currentDir, targetDir) {
  recursive("");
  function recursive (dir) {
    let realDir = path.join(currentDir, dir);
    let copyDir = path.join(targetDir, dir);
    
    if (fs.statSync(realDir).isDirectory()) {
      fs.mkdirSync(copyDir);
      for (let i of fs.readdirSync(realDir)) recursive(path.join(dir, i));
    }
    else fs.writeFileSync(copyDir, fs.readFileSync(realDir));
  }
};


///// REALIZAR TAREA ~task.json
const opt = JSON.parse(fs.readFileSync("~task.json"));
const installer = new Installer(opt.project);

for (let mod of opt.install) installer.install(mod, "--save");
for (let mod of opt.dev) installer.install(mod, "--save-dev");
