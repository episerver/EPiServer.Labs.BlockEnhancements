const fs = require("fs");
const path = require("path");

const baseDir = process.argv[2];
const fileName = process.argv[3];

const dist = path.resolve(__dirname, baseDir);
fs.closeSync(fs.openSync(`${dist}\\${fileName}`, 'w'));
