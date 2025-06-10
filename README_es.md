# onpm

[Lea este README en inglés](README.md)

Offline Npm Manager es una herramienta de línea de comandos que te permite instalar y gestionar módulos de NPM sin conexión a internet.

## Primeros pasos

Para instalar Offline Npm Manager, ejecuta el siguiente comando:

```sh
npm i -g onpm-cli
```

Una vez instalado, puedes usar el comando `onpm`.

Para verificar la instalación, ejecuta:

```sh
onpm --version
```

## ¿Por qué `onpm`?

Este script fue creado principalmente para reducir la dependencia de una conexión a internet al instalar módulos de npm. Esto es especialmente útil en contextos donde el acceso a internet es limitado o restringido, como para usuarios en Cuba.

A diferencia de herramientas como `pnpm` o `yarn`, que optimizan la instalación de paquetes mediante técnicas como enlaces simbólicos o almacenamiento compartido, `onpm` se centra en la capacidad de operar completamente sin conexión. Esto significa que puedes descargar y almacenar módulos previamente en un entorno conectado y luego usarlos en proyectos sin necesidad de acceso a internet. Esto funciona con `npm` en segundo plano para descargar las dependencias, asegurando compatibilidad con flujos de trabajo y herramientas existentes que dependen del diseño estándar de `node_modules`.

## CLI

### 📥 Descargar y almacenar en caché

Para usar Offline Npm Manager, primero necesitas descargar los módulos requeridos. Usa el siguiente comando:

```sh
onpm cache [<package-spec> ...] [flags]
```

Si no se especifican módulos, descargará los módulos definidos en el archivo `package.json`.

Por ejemplo:

```sh
onpm cache express
```

Después de descargar los módulos, estarán disponibles para instalación sin conexión en otros proyectos.

Flags:

| Flag                      | Descripción                                           |
|---------------------------|-------------------------------------------------------|
| `-P, --save-prod`         | Descargar solo dependencias de producción             |
| `-D, --save-dev`          | Descargar solo dependencias de desarrollo             |
| `-f, --force`             | Descargar todos los módulos ignorando si ya están almacenados |

### 💽 Instalar un módulo

Para instalar los módulos almacenados en caché en tu proyecto NodeJs, usa el siguiente comando:

```sh
onpm install [<package-spec> ...] [flags]
```

Si no se especifican módulos, instalará los módulos definidos en el archivo `package.json`.

Por ejemplo, para instalar los módulos `express` y `moment`:

```sh
onpm install express moment --save
```

Flags:

| Flag                 | Descripción                                           |
|----------------------|-------------------------------------------------------|
| `-S, --save`         | Instalar y añadir a las dependencias en package.json  |
| `-D, --save-dev`     | Instalar y añadir a las devDependencies en package.json |
| `--no-save`          | Instalar sin añadir a package.json                    |
| `-o, --online`       | Instalar desde caché y descargar módulos faltantes    |

### Para más información, ejecuta `onpm -h`

## Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras algún problema o tienes mejoras en mente, no dudes en abrir un nuevo issue o enviar un pull request.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

##
Creado por Rodny Estrada.
