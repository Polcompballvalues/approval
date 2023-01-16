function rangeCalc(name) {
    const elm = document.getElementById(name);
    const selection = parseInt(elm.value);
    const score = selection - 5;
    return {
        selected: selection,
        score: score
    };
}
function checkboxCalc(name, checkbox) {
    const elm = document.getElementById(name);
    const isSelected = elm.checked;
    return {
        selected: isSelected,
        score: isSelected ? checkbox.value : 0
    };
}
const tablegen = (row) => `|${row.join("|")}|\n`;
function determinate(name, penalty, totalScore) {
    switch (penalty.type) {
        case "range": {
            const val = rangeCalc(name);
            const addedScore = totalScore + val.score;
            const rangeStr = val.selected.toString() + "/10";
            return {
                score: val.score,
                text: tablegen([penalty.text, rangeStr, val.score.toString(), addedScore.toString()])
            };
        }
        case "checkbox": {
            const val = checkboxCalc(name, penalty);
            const addedScore = totalScore + val.score;
            if (val.selected) {
                return {
                    score: val.score,
                    text: tablegen([penalty.text, "broken", val.score.toString(), addedScore.toString()])
                };
            }
            else {
                return null;
            }
        }
        default:
            throw new Error("invalid penalty type");
    }
}
async function checkboxes() {
    const penalties = await fetch("./dist/penalties.json")
        .then(response => response.json());
    let table = tablegen(["Item", "Rating", "Score Change", "Score"]) + tablegen(Array(4).fill(":-"));
    let score = 0;
    let artRules = false;
    for (const i of Object.keys(penalties)) {
        const ret = determinate(i, penalties[i], score);
        if (!ret)
            continue;
        score += ret.score;
        table += ret.text;
        if (i === "artrules" || i === "minorartrules") {
            artRules = true;
        }
    }
    if (artRules) {
        table += "\nArt rules broken: ";
    }
    const tableElm = document.getElementById("final-table");
    tableElm.innerHTML = table;
    tableElm.style.display = "inline-block";
    const approvalLabel = document.getElementById("approve-text");
    approvalLabel.innerHTML = score >= 0 ? "Approve this" : "Remove this";
    approvalLabel.style.color = score >= 0 ? "green" : "red";
    approvalLabel.scrollIntoView();
}
window.onload = () => {
    const setColor = (elm, set) => elm.style.backgroundColor = set ? "rgba(255, 255, 255, 0.5)" : "rgba(204, 0, 0, 0.7)";
    const elms = document.getElementsByClassName("check-block");
    for (const elm of elms) {
        const children = elm.children;
        const box = [...children]
            .filter(x => x.getAttribute("type") === "checkbox")[0];
        const check = () => {
            const isChecked = box.checked;
            box.checked = !isChecked;
            setColor(elm, isChecked);
        };
        [...children, elm].forEach(x => {
            x.onclick = check;
            setColor(elm, !box.checked);
        });
        elm.onmouseenter = () => elm.style.backgroundColor = box.checked ? "rgba(255, 0, 0, 0.9)" : "rgba(255, 255, 255, 0.8)";
        elm.onmouseleave = () => elm.style.backgroundColor = box.checked ? "rgba(204, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.5)";
    }
};
document.getElementById("calc-button").onclick = async () => checkboxes();
const tableElm = document.getElementById("final-table");
tableElm.onclick = async () => {
    const text = tableElm.textContent;
    navigator.clipboard.writeText(text);
    const height = tableElm.scrollHeight;
    const borderHeight = parseFloat(getComputedStyle(tableElm).paddingTop);
    const width = tableElm.scrollWidth;
    const borderWidth = parseFloat(getComputedStyle(tableElm).paddingLeft);
    tableElm.style.color = "#F00";
    tableElm.style.height = (height - (2 * borderHeight)).toFixed(1) + "px";
    tableElm.style.width = (width - (2 * borderWidth)).toFixed(1) + "px";
    tableElm.innerHTML = "Text copied to clipboard";
    await new Promise(r => setTimeout(r, 1500));
    tableElm.style.color = "white";
    tableElm.innerHTML = text;
    tableElm.style.height = "auto";
    tableElm.style.width = "auto";
};
export {};
//# sourceMappingURL=tablegen.js.map