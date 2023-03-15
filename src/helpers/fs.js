
// copy dir
function copydirSync (currentDir, targetDir) {
    recursive("");
    function recursive (dir) {
        let realDir = path.join(currentDir, dir);
        let copyDir = path.join(targetDir, dir);

        if (isDirectory(realDir)) {
            if (!isDirectory(copyDir)) fs.mkdirSync(copyDir);
            for (let i of fs.readdirSync(realDir)) recursive(path.join(dir, i));
        }
        else fs.copyFileSync(realDir, copyDir);
    }
};

// verify is a directory
function isDirectory (dir) {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

module.exports = {
    copydirSync,
    isDirectory,
}