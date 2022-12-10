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
```linux
node main.js <path> <modules>
```

Ejemplo si se quiere instalar los modulos `express` y `moment`:
```linux
node main.js /storage/emulated/0/my-repo --save express moment
```

## Parámetros (flags)
| Flag | Descripción |
|----  |----------- |
| `--hide` | Instalar modulos pero no indicarlos en el package.json |
| `--save` | Guardar modulos como dependencias |
| `--save-dev` | Guardar modulos como dependencias de desarrollador |
| `--pkg` | Instalar dependencias a partir del package.json de la ruta |
| `--pkg-dev` | Instalar dependencias de desarrollador a partir del package.json de la ruta |