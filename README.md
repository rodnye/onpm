# onpm

Offline Npm Manager is a command line tool that allows you to install and manage NPM modules without an internet connection.

## Get Started

To install Offline Npm Manager, run the following command:

```sh
npm i -g onpm-cli
```

Once installed, you can use the `onpm` command.

To verify the installation, run:

```sh
onpm --version
```

## CLI

### 📥 Download and save in cache

To use Offline Npm Manager, you need to download the required modules first. Use the following command:

```sh
onpm download [<package-spec> ...] [flags]
```

If no modules are specified, it will download the modules specified in the `package.json` file.

For example:

```sh
onpm download express
```

After downloading the modules, they will be available for offline installation in other projects.

Flags:

| Flag                      | Description                                           |
|---------------------------|-------------------------------------------------------|
| `--prod, --production`    | Download only package.json dependencies               |
| `-f`, `--force`           | Download all modules ignoring if already downloaded   |
| `--fast`                  | Download all modules quickly in a single process      |

### 💽 Install a module

To install the downloaded modules in your NodeJs project, use the following command:

```sh
onpm install [<package-spec> ...] [flags]
```

If no modules are specified, it will install the modules specified in the `package.json` file.

For example, to install the `express` and `moment` modules:

```sh
onpm install express moment --save
```

Flags:

| Flag                 | Description                                           |
|----------------------|-------------------------------------------------------|
| `-S, --save`         | Install and add to package.json dependencies          |
| `-D, --save-dev`     | Install and add to package.json devDependencies       |
| `-N, --no-save`      | Install without adding to package.json                |               |

### For more information, execute `onpm -h`

## Contributions

Contributions are welcome! If you encounter any issues or have improvements in mind, feel free to open a new issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

##
Created by Rodny Estrada.