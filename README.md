# NPM Offline
Instalador de modulos NPM sin conexión a internet.

## Instalar CLI
Clone este repositorio, y luego utilice `npm link`:
```shell
$git clone https://github.com/RodnyE/NPM-Offline
$cd ./NPM-Offline
$npm link
```

Con estos tres pasos ya npm-offline está listo para usar.  
Pondrá a su disposición el comando `onpm`

## Uso de CLI
### `onpm download`
"NPM Offline" no puede trabajar si no tiene modulos descargados.
Descargue los que usted necesite utilizando `onpm download <module>`, por ejemplo:
```shell
$onpm download express
```
Luego de realizado este proceso, ya los modulos descargados estarán disponibles para instalarlos sin conexión cuantas veces quiera en otros proyectos.


### onpm install
Similar al comando `npm install`, este es el comando para instalar los modulos en su proyecto de NodeJs, con la ligera diferencia que ya no será desde internet.  
Su estructura es `onpm install <modules>`:
```shell
$cd /MiProyecto
$onpm install express
```

Ejemplo si se quiere instalar los modulos `express` y `moment`:
```shell
$onpm install --save express moment
```

## Opciones (flags)
| Flag | Descripción |
|----  |----------- |
| `--hide` o `--no-save` | Instalar modulos pero no indicarlos en el package.json |
| `--save` | Guardar modulos como dependencias |
| `--save-dev` | Guardar modulos como dependencias de desarrollador |
| `--pkg` | Instalar dependencias a partir del package.json de la ruta |
| `--pkg-dev` | Instalar dependencias de desarrollador a partir del package.json de la ruta |