# NPM Offline
Instalador de modulos NPM sin conexión a internet. 
Requiere que los módulos esten disponibles en la carpeta `./node_modules` de este repositorio para poder instalarlos offline a otros proyectos locales.

## Añadir modulos
"NPM Offline" no puede trabajar si no tiene modulos instalados.
Instale los que usted necesite utilizando `npm install <module>`:
```
cd /path/folder/npm-offline
npm install fs-extras
npm install express
...
```
Luego de realizado este proceso, ya estos modulos estarán disponibles para instalarlos sin conexión cuantas veces quiera en otros proyectos.


## Instalar modulos offline
Primero se debe configurar el archivo `~task.json`.
Por ejemplo: 
```javascript
{
  "project": "/storage/emulated/0/my-repo",
 
  "install": [
    "express", 
    "body-parser",
    "moment"
  ],
  
  "dev": [
    "gulp", "gulp-concat"
  ]
}
```

- `project`: ubicación donde instalar módulos.
- `install`: módulos a instalar, serán guardados en las dependencias del `package.json`.
- `dev`: igual que `install`, pero será guardado en las dependecias de desarrollador.

Luego de rellenado el archivo se puede proceder a iniciarlo:
```
node main.js
```