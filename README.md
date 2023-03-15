# npm offline
NPM module installer without internet connection.

## Install CLI
Clone the repository to a folder on your system with superuser permissions and then use `npm link`:
```shell
git clone https://github.com/RodnyE/NPM-Offline onpm
cd ./onpm
npm install
npm link
```

With these steps, npm-offline is ready to use.
It will make available the `onpm` command

## Using CLI
### `onpm download`
"NPM Offline" cannot work if you don't have modules downloaded.
Download the ones you need using `onpm download <module>`, for example:
```shell
onpm download express
```
After completing this process, the downloaded modules will be available to 
install them offline as many times as you want in other projects.


### `onpm install`
Similar to the `npm install` command, this is the command to install the modules in your NodeJs project, with the slight difference that it will no longer be from the internet.
Its structure is `onpm install <modules>`:
```shell
cd /MyProject
onpm install express
```

Example if you want to install the `express` and `moment` modules:
```shell
onpm install --save express moment
```

### For more information, execute `onpm -h`