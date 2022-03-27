const fs = require("fs");
const path = require("path");

module.exports = class Loader {
  static recursiveReadDirSync(dir, allowedExtensions = [".js"]) {
    const filePaths = [];
    const readCommands = (dir) => {
      const files = fs.readdirSync(path.join(process.cwd(), dir));
      files.forEach((file) => {
        const stat = fs.lstatSync(path.join(process.cwd(), dir, file));
        if (stat.isDirectory()) {
          readCommands(path.join(dir, file));
        } else {
          const extension = path.extname(file);
          if (!allowedExtensions.includes(extension)) return;
          const filePath = path.join(process.cwd(), dir, file);
          filePaths.push(filePath);
        }
      });
    };
    readCommands(dir);
    return filePaths;
  }
};
