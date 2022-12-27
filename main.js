#! /usr/bin/env node
const path = require("path");
const colors = require("colors");
const { readFileSync } = require("fs");
const { exec, spawn } = require("child_process");

global.modulesPath = path.join(__dirname, "node_modules");
const Installer = require("./src/installer.js");

/*
 * Filtrar argumentos
 */

const opt = {args: []};
const args = process.argv.slice(2);
const available = [
  "--save",
  "--save-dev",
  "--hide",
  "--no-save"
];
while (args.length) {
  let arg = args.shift();

  if (arg.indexOf("-") === 0) {
    // es una --opcion
    if (available.includes(arg)) opt[arg] = true;
    else {
      console.error("fatal: ".red + "Unknown or unexpected option " + arg);
      process.exit();
    }
  } else {
    // es un parámetro
    opt.args.push(arg);
  }
}
opt.arg0 = opt.args[0];

/*
 * Si se desean descargar los modulos
 */
if (opt.arg0 === "download") {
  console.log("npm");
  let npm = spawn(
    "npm", ["install", "--save"].concat(opt.args)
  );
  npm.stdout.on("data", data => {
    console.log(data)
  });

  npm.stderr.on('data', data => {
    console.error(`stderr: ${data}`);
  });

  npm.on('close', code => {
    console.log(`child process exited with code ${code}`);
  });
} 

else if (opt.arg0 === "install") {
/*
 * Realizar instalación a partir de modulos
 */
  console.log("Starting...".cyan);
  
  const task = {
    path: process.cwd(), 
    dependencies: opt.args.slice(1),

    saveType:
      opt["--save"] ? "--save":
      opt["--save-dev"] ? "--save-dev":
      opt["--hide"] || opt["--no-save"] ? "--hide":
      "--save" // default
  };


  const installer = new Installer(task.path);

  // instalar desde package.json
  if (opt["--pkg"] || opt["--pkg-dev"]) {
    let pkgJSON = JSON.parse(
      readFileSync(path.join(task.path, "package.json"))
    );

    if (opt["--pkg"]) {
      for (let dependency in pkgJSON.dependencies) {
        installer.install(dependency, "--save");
      }
    }

    if (opt["--pkg-dev"]) {
      for (let dependency in pkgJSON.devDependencies) {
        installer.install(dependency, "--save-dev");
      }
    }
  }

  // instalar modulos definidos
  for (let dependency of task.dependencies)
    installer.install(dependency, task.saveType);
  
  // finalizar
  let history = installer.history;
  console.log(
    "\n  Installed " + (history.installs.length+"").green + " dependencies with " +
    (history.modules.length+"").green + " modules."
  );
  for (let mod of history.installs) console.log("|- ".yellow + mod)
}