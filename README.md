# onpm

[Spanish README](README_es.md)

Offline Npm Manager is a command-line tool that allows you to install and manage NPM modules without an internet connection.

## Getting Started

To install Offline Npm Manager, run the following command:

```sh
npm i -g onpm-cli
```

Once installed, you can use the `onpm` command.

To verify the installation, run:

```sh
onpm --version
```

## Why `onpm`?

This script was primarily created to reduce dependency on an internet connection when installing npm modules. This is especially useful in contexts where internet access is limited or restricted, such as for users in Cuba.

Unlike tools like `pnpm` or `yarn`, which optimize package installation through techniques like symbolic links or shared storage, `onpm` focuses on the ability to operate completely offline. This means you can download and store modules beforehand in a connected environment and then use them in projects without needing internet access. This works with a directory structure similar to `npm` when installing `node_modules`, ensuring compatibility with existing workflows and tools that rely on the standard `node_modules` layout.

## CLI

### 📥 Download and cache

To use Offline Npm Manager, you first need to download the required modules. Use the following command:

```sh
onpm cache [<package-spec> ...] [flags]
```

If no modules are specified, it will download the modules defined in the `package.json` file.

For example:

```sh
onpm cache express
```

After downloading the modules, they will be available for offline installation in other projects.

Flags:

| Flag                      | Description                                           |
|---------------------------|-------------------------------------------------------|
| `-P, --save-prod`         | Download only production dependencies                 |
| `-D, --save-dev`          | Download only development dependencies                |
| `-f, --force`             | Download all modules ignoring if already cached       |

### 💽 Install a module

To install the cached modules in your NodeJs project, use the following command:

```sh
onpm install [<package-spec> ...] [flags]
```

If no modules are specified, it will install the modules defined in the `package.json` file.

For example, to install the `express` and `moment` modules:

```sh
onpm install express moment --save
```

Flags:

| Flag                 | Description                                           |
|----------------------|-------------------------------------------------------|
| `-S, --save`         | Install and add to dependencies in package.json       |
| `-D, --save-dev`     | Install and add to devDependencies in package.json    |
| `--no-save`          | Install without adding to package.json                |
| `-o, --online`       | Install from cache and download missing modules       |

### For more information, run `onpm -h`

## Contributions

Contributions are welcome! If you encounter any issues or have improvements in mind, feel free to open a new issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

##
Created by Rodny Estrada.