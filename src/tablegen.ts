import type { Penalty, PenaltyMap, PenaltyPair, RangePair, CheckPair } from "./types";

function rangeCalc(name: string): RangePair {
    const elm = <HTMLInputElement>document.getElementById(name)!;
    const selection: number = parseInt(elm.value);
    const score: number = selection - 5;
    return {
        selected: selection,
        score: score
    };
}

function checkboxCalc(name: string, checkbox: Penalty): CheckPair {
    const elm = <HTMLInputElement>document.getElementById(name)!;
    const isSelected: boolean = elm.checked;
    return {
        selected: isSelected,
        score: isSelected ? checkbox.value : 0
    };
}

const tablegen = (row: Array<string>): string =>
    `|${row.join("|")}|\n`;

function determinate(name: string, penalty: Penalty, totalScore: number): PenaltyPair | null {
    switch (penalty.type) {
        case "range": {
            const val: RangePair = rangeCalc(name);
            const addedScore = totalScore + val.score;
            const rangeStr = val.selected.toString() + "/10";

            return {
                score: val.score,
                text: tablegen([penalty.text, rangeStr, val.score.toString(), addedScore.toString()])
            };
        }
        case "checkbox": {
            const val: CheckPair = checkboxCalc(name, penalty);
            const addedScore = totalScore + val.score;

            if (val.selected) {
                return {
                    score: val.score,
                    text: tablegen([penalty.text, "broken", val.score.toString(), addedScore.toString()])
                };
            } else {
                return null;
            }

        }
        default:
            throw new Error("invalid penalty type");
    }
}

async function checkboxes(): Promise<void> {
    const penalties: PenaltyMap = await fetch("./dist/penalties.json")
        .then(response => response.json());

    let table: string = tablegen(["Item", "Rating", "Score Change", "Score"]) + tablegen(Array(4).fill(":-"));
    let score: number = 0;
    let artRules: boolean = false;

    for (const i of Object.keys(penalties)) {
        const ret: PenaltyPair | null = determinate(i, penalties[i], score);
        if (!ret) continue;

        score += ret.score;
        table += ret.text;

        if (i === "artrules" || i === "minorartrules") {
            artRules = true;
        }
    }
    if (artRules) {
        table += "\nArt rules broken: ";
    }

    const tableElm = <HTMLPreElement>document.getElementById("final-table")!;
    tableElm.innerHTML = table;
    tableElm.style.display = "inline-block";

    const approvalLabel = <HTMLParagraphElement>document.getElementById("approve-text")!;
    approvalLabel.innerHTML = score >= 0 ? "Approve this" : "Remove this";
    approvalLabel.style.color = score >= 0 ? "green" : "red";

    approvalLabel.scrollIntoView();
}

window.onload = (): void => {
    const setColor = (elm: HTMLDivElement, set: boolean) => 
        elm.style.backgroundColor = set ? "rgba(255, 255, 255, 0.5)" : "rgba(204, 0, 0, 0.7)";
    const elms = <HTMLCollectionOf<HTMLDivElement>>document.getElementsByClassName("check-block");
    for (const elm of elms) {
        const children = <HTMLCollectionOf<HTMLDivElement>>elm.children;
        const box = <HTMLInputElement>[...children]
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
        elm.onmouseenter = () => 
            elm.style.backgroundColor = box.checked ? "rgba(255, 0, 0, 0.9)" : "rgba(255, 255, 255, 0.8)";
        elm.onmouseleave = () =>
            elm.style.backgroundColor = box.checked ? "rgba(204, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.5)";
    }
}


document.getElementById("calc-button")!.onclick = async (): Promise<void> => checkboxes()

const tableElm = <HTMLPreElement>document.getElementById("final-table")!;
tableElm.onclick = async (): Promise<void> => {
    const text: string = tableElm.textContent!;
    navigator.clipboard.writeText(text);

    const height: number = tableElm.scrollHeight;
    const borderHeight: number = parseFloat(getComputedStyle(tableElm).paddingTop);
    const width: number = tableElm.scrollWidth;
    const borderWidth: number = parseFloat(getComputedStyle(tableElm).paddingLeft);

    tableElm.style.color = "#F00";
    tableElm.style.height = (height - (2 * borderHeight)).toFixed(1) + "px";
    tableElm.style.width = (width - (2 * borderWidth)).toFixed(1) + "px";
    tableElm.innerHTML = "Text copied to clipboard";

    await new Promise(r => setTimeout(r, 1500));

    tableElm.style.color = "white";
    tableElm.innerHTML = text;
    tableElm.style.height = "auto";
    tableElm.style.width = "auto";
}
