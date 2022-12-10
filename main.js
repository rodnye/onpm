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


///// REALIZAR TAREA
const args = process.argv.slice(2);
const modulos = [];

const task = {
  project: args[0],
  packageDependencies: false,
  packageDevDependencies: false,
  
  dependencies: [],
  saveType: "--save"
};

// obtener modulos a instalar
for (let i = 1; i < args.length; i++) {
  let arg = args[i];
  if (arg.indexOf("-") !== 0) {
    task.dependencies.push(arg);
  }
}

// opciones
if (args.includes("--hide")) task.saveType = "--hide";
if (args.includes("--save")) task.saveType = "--save";
if (args.includes("--save-dev")) task.saveType = "--save-dev";
if (args.includes("--pkg")) task.packageDependencies = true;
if (args.includes("--pkg-dev")) task.packageDevDependencies = true;

const installer = new Installer(task.project);

// instalar desde package.json
if (task.packageDependencies || task.packageDevDependencies) {
  let pkg = JSON.parse(
    fs.readFileSync(path.join(task.project, "package.json"))
  );
  
  if (task.packageDependencies) {
    for (let dependency in pkg.dependencies) {
      installer.install(dependency, "--save");
    }
  }
  
  if (task.packageDevDependencies) {
    for (let dependency in pkg.devDependencies) {
      installer.install(dependency, "--save-dev");
    }
  }
}

// instalar modulos definidos
for (let dependency of task.dependencies) 
  installer.install(dependency, task.saveType);
