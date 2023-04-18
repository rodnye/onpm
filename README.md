# offline npm manager
NPM module installer without internet connection.

## Setup
```sh
npm i -g onpm@github:RodnyE/onpm
```
onpm is ready to use.
It will make available the `onpm` command.

To check if everything went well, run:
```sh
onpm --version
```

## CLI
### download
```sh
onpm download [<package-spec> ...] [flags]
```
"NPM Offline" cannot work if you don't have modules downloaded.  
  
For example:
```sh
onpm download express
```
After completing this process, the downloaded modules will be available to 
install them offline as many times as you want in other projects.
If you do not specify any modules, the ones specified in the `package.json` 
will be downloaded to the cache.


Flags:
| flag | desc |
|-- |-- |
| `--prod, --production` | Download only package.json dependencies |

### install
```sh
onpm install [<package-spec> ...] [flags]
```
Similar to the `npm install` command, this is the command to install the 
modules in your NodeJs project, with the slight difference that it will 
no longer be from the internet.
If you do not specify any modules, the ones specified in the `package.json` 
will be installed.


Example if you want to install the `express` and `moment` modules:
```sh
onpm install express moment --save
```

Flags:
| flag | desc |
|-- |-- |
| `-S, --save` | installs and add to package.json dependencies    |
| `--save-dev` | installs and add to package.json devDependencies |
| `--no-save`  | installs but doesn't add them to package.json    |
| `--prod, --production` | installs only package.json dependencies |

### For more information, execute `onpm -h`