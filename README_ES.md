# onpm

El Administrador de Npm sin conexión es una herramienta de línea de comandos que te permite instalar y administrar módulos de NPM sin conexión a internet.

## Configuración

Para instalar el Administrador de Npm sin conexión, ejecuta el siguiente comando:

```sh
npm i -g onpm@github:rodnye/onpm
```

Una vez instalado, puedes utilizar el comando `onpm`.

Para verificar la instalación, ejecuta:

```sh
onpm --version
```

## CLI

### download

Para utilizar el Administrador de Npm sin conexión, primero necesitas descargar los módulos requeridos. Utiliza el siguiente comando:

```sh
onpm download [<package-spec> ...] [flags]
```

Si no se especifican módulos, se descargarán los módulos especificados en el archivo `package.json`.

Por ejemplo:

```sh
onpm download express
```

Después de descargar los módulos, estarán disponibles para su instalación sin conexión en otros proyectos.

Flags:

| Flag                      | Descripción                                           |
|---------------------------|-------------------------------------------------------|
| `--prod, --production`    | Descargar solo dependencias de package.json            |
| `-f, --fast`              | Descargar todos los módulos rápidamente en un solo proceso |

### install

Para instalar los módulos descargados en tu proyecto de NodeJs, utiliza el siguiente comando:

```sh
onpm install [<package-spec> ...] [flags]
```

Si no se especifican módulos, se instalarán los módulos especificados en el archivo `package.json`.

Por ejemplo, para instalar los módulos `express` y `moment`:

```sh
onpm install express moment --save
```

Flags:

| Flag                 | Descripción                                           |
|----------------------|-------------------------------------------------------|
| `-S, --save`         | Instalar y agregar a las dependencias del package.json |
| `-D, --save-dev`         | Instalar y agregar a las devDependencies del package.json |
| `-N, --no-save`          | Instalar sin agregar a package.json                   |
| `--prod, --production`| Instalar solo dependencias de package.json             |

### Para obtener más información, ejecuta `onpm -h`

## Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras algún problema o tienes mejoras en mente, no dudes en abrir un nuevo issue o enviar un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para obtener más detalles.

##
Creado por Rodny Estrada.