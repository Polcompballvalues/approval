const tableElm = document.getElementById("final-table");
const approvalLabel = document.getElementById("approve-text");
function rangeCalc(name) {
    const elm = document.getElementById(name);
    const selection = parseInt(elm.value);
    const score = selection - 5;
    return [
        selection, score
    ];
}
function checkboxCalc(name, checkbox) {
    const elm = document.getElementById(name);
    const isSelected = elm.checked;
    return [
        isSelected, isSelected ? checkbox.value : 0
    ];
}
const tablegen = (row) => `|${row.join("|")}|\n`;
function determinate(name, penalty, totalScore) {
    switch (penalty.type) {
        case "range": {
            const [selected, score] = rangeCalc(name);
            const addedScore = totalScore + score;
            const rangeStr = selected.toString() + "/10";
            const text = tablegen([
                penalty.text, rangeStr,
                score.toString(), addedScore.toString()
            ]);
            return [text, score];
        }
        case "checkbox": {
            const [selected, score] = checkboxCalc(name, penalty);
            const addedScore = totalScore + score;
            if (selected) {
                const text = tablegen([
                    penalty.text, "broken",
                    score.toString(), addedScore.toString()
                ]);
                return [text, score];
            }
            else {
                return null;
            }
        }
        default:
            throw new Error("invalid penalty type");
    }
}
async function checkboxes(penalties) {
    let score = 0;
    let artRules = false;
    let table = tablegen(["Item", "Rating", "Score Change", "Score"]) +
        tablegen(Array(4).fill(":-"));
    for (const i of Object.keys(penalties)) {
        const ret = determinate(i, penalties[i], score);
        if (!ret)
            continue;
        table += ret[0];
        score += ret[1];
        if (i === "artrules" || i === "minorartrules") {
            artRules = true;
        }
    }
    if (artRules) {
        table += "\nArt rules broken: ";
    }
    tableElm.innerHTML = table;
    tableElm.style.display = "inline-block";
    approvalLabel.textContent = score >= 0 ? "Approve this" : "Remove this";
    approvalLabel.style.color = score >= 0 ? "green" : "red";
    approvalLabel.scrollIntoView();
}
window.onload = () => {
    const setColor = (elm, set) => elm.style.backgroundColor = set ? "rgba(255, 255, 255, 0.5)" : "rgba(204, 0, 0, 0.7)";
    const elms = document.getElementsByClassName("check-block");
    for (const elm of elms) {
        const children = elm.children;
        const box = [...children].filter(x => x.getAttribute("type") === "checkbox")[0];
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
let penalties;
window.addEventListener("load", async () => {
    const resp = await fetch("./dist/penalties.json");
    penalties = await resp.json();
});
document.getElementById("calc-button")
    .addEventListener("click", () => checkboxes(penalties));
document.getElementById("reset-button")
    .addEventListener("click", () => {
    tableElm.style.display = "none";
    approvalLabel.textContent = "";
    for (const [pn, penalty] of Object.entries(penalties)) {
        const elm = document.getElementById(pn);
        switch (penalty.type) {
            case "range":
                elm.value = "5";
                break;
            case "checkbox":
                elm.checked = false;
                const parent = elm.parentNode;
                parent.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
                break;
            default:
                throw new Error("Invalid penalty type");
        }
    }
});
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