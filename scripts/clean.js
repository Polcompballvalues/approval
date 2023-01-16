import * as fs from "fs";

const distDir = fs.readdirSync("./dist/");

for (const file of distDir) {
    fs.unlinkSync("./dist/" + file);
}

fs.unlinkSync("./index.html")