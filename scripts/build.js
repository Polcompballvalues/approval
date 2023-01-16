import * as fs from "fs";
import * as pug from "pug";

function renderPug(fileName, params) {
    const inPath = `./src/${fileName}.pug`;
    const html = pug.renderFile(inPath, params);
    const outPath = `./${fileName}.html`;
    fs.writeFileSync(outPath, html);
}

const penaltiesTxt = fs.readFileSync("./src/penalties.json");
const penalties = JSON.parse(penaltiesTxt);
const params = {
    rangeElm: [],
    penaltyElm: [],
    removalElm: [],
};

for (const [penalty, val] of Object.entries(penalties)) {
    if (val.type === "range") {
        params.rangeElm.push({
            id: penalty,
            dispText: val.text
        });
    } else if (val.type === "checkbox") {
        const elm = {
            id: penalty,
            dispText: val.disptext ?? `${val.text}:`
        };
        if (val.instantremoval) {
            params.removalElm.push(elm);
        } else {
            params.penaltyElm.push(elm);
        }
    }
}

const dir = fs.readdirSync("./src/");

for (const file of dir) {
    const splitFile = file.split(".");
    if (splitFile.pop() === "pug") {
        const fname = splitFile.join(".");
        renderPug(fname, params);
    }
}

fs.writeFileSync("./dist/penalties.json", JSON.stringify(penalties));