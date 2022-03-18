function rangecalc(name, range) {
    let ret = {};
    const elm = document.getElementById(name);
    ret.selected = parseInt(elm.value);
    ret.score = range.rangevalues[ret.selected.toString()];
    return ret;
}
function checkcalc(name, checkbox) {
    let ret = {};
    const elm = document.getElementById(name);
    ret.selected = elm.checked;
    ret.score = ret.selected ? checkbox.value : 0;
    return ret;
}
function tablegen(row) {
    let str = "|";
    for (const i of row) {
        str += i + "|";
    }
    return str + "\n";
}
function determinate(name, penalty, score) {
    switch (penalty.type) {
        case "range": {
            const val = rangecalc(name, penalty);
            let ret = {};
            ret.score = val.score;
            ret.text = tablegen([penalty.text, (val.selected.toString() + "/10"), val.score.toString(), (score + ret.score).toString()]);
            return ret;
        }
        case "checkbox": {
            const val = checkcalc(name, penalty);
            let ret = {};
            if (val.selected) {
                ret.score = val.score;
                ret.text = tablegen([penalty.text, "broken", val.score.toString(), (score + ret.score).toString()]);
            }
            else {
                ret.score = 0;
                ret.text = "";
            }
            return ret;
        }
        default:
            throw new Error("invalid penalty type");
    }
}
async function checkboxes() {
    const penalties = await fetch("./json/penalties.json")
        .then(response => response.json());
    let table = tablegen(["Item", "Rating", "Score Change", "Score"]) + tablegen(Array(4).fill(":-"));
    let score = 0;
    for (const i of Object.keys(penalties)) {
        let ret = determinate(i, penalties[i], score);
        score += ret.score;
        table += ret.text;
        if (i == "artrules" && ret.score) {
            table += "\nart rules broken: ";
        }
    }
    const preelm = document.getElementById("finaltable");
    const pelm = document.getElementById("approvetext");
    preelm.innerHTML = table;
    preelm.style.display = "inline-block";
    if (score >= 0) {
        pelm.innerHTML = "Approve this";
        pelm.style.color = "green";
    }
    else {
        pelm.innerHTML = "Remove this";
        pelm.style.color = "red";
    }
}
window.onload = () => {
    const elms = document.getElementsByClassName("checkblock");
    for (const e of elms) {
        const children = e.children;
        for (const c of children) {
            if (c.getAttribute("type") == "checkbox") {
                const box = c;
                e.addEventListener("click", () => {
                    box.checked = !box.checked;
                });
            }
        }
    }
};
document.getElementById("calcbutton").onclick = () => checkboxes();
document.getElementById("finaltable").onclick = async () => {
    const elm = document.getElementById("finaltable");
    const text = elm.innerHTML;
    navigator.clipboard.writeText(text);
    const height = elm.scrollHeight;
    const borheight = getComputedStyle(elm).paddingTop;
    const width = elm.scrollWidth;
    const borwidth = getComputedStyle(elm).paddingLeft;
    elm.style.color = "#F00";
    elm.style.height = (height - 2 * (parseFloat(borheight))).toFixed(1) + "px";
    elm.style.width = (width - 2 * (parseFloat(borwidth))).toFixed(1) + "px";
    elm.innerHTML = "Text copied to clipboard";
    await new Promise(r => setTimeout(r, 1500));
    elm.style.color = "#FFF";
    elm.innerHTML = text;
    elm.style.height = "auto";
    elm.style.width = "auto";
};
export {};
//# sourceMappingURL=tablegen.js.map