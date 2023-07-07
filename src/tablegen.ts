import type { Penalty, PenaltyMap, PenaltyPair, RangePair, CheckPair } from "./types";

const tableElm = <HTMLPreElement>document.getElementById("final-table")!;
const approvalLabel = <HTMLParagraphElement>document.getElementById("approve-text")!;


function rangeCalc(name: string): RangePair {
    const elm = <HTMLInputElement>document.getElementById(name)!;
    const selection: number = parseInt(elm.value);
    const score: number = selection - 5;
    return [
        selection, score
    ];
}

function checkboxCalc(name: string, checkbox: Penalty): CheckPair {
    const elm = <HTMLInputElement>document.getElementById(name)!;
    const isSelected: boolean = elm.checked;
    return [
        isSelected, isSelected ? checkbox.value : 0
    ];
}

const tablegen = (row: string[]): string =>
    `|${row.join("|")}|\n`;

function determinate(name: string, penalty: Penalty, totalScore: number): PenaltyPair | null {
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
            } else {
                return null;
            }
        }
        default:
            throw new Error("invalid penalty type");
    }
}

async function checkboxes(penalties: PenaltyMap): Promise<void> {
    let score: number = 0;
    let artRules: boolean = false;

    let table: string = tablegen(["Item", "Rating", "Score Change", "Score"]) +
        tablegen(Array(4).fill(":-"));

    for (const i of Object.keys(penalties)) {
        const ret = determinate(i, penalties[i], score);
        if (!ret) continue;

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

window.onload = (): void => {
    const setColor = (elm: HTMLDivElement, set: boolean) =>
        elm.style.backgroundColor = set ? "rgba(255, 255, 255, 0.5)" : "rgba(204, 0, 0, 0.7)";

    const elms = <HTMLCollectionOf<HTMLDivElement>>document.getElementsByClassName("check-block");

    for (const elm of elms) {
        const children = <HTMLCollectionOf<HTMLDivElement>>elm.children;

        const box = [...children].filter(
            x => x.getAttribute("type") === "checkbox"
        )[0] as HTMLInputElement;

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

let penalties: PenaltyMap;

window.addEventListener("load", async () => {
    const resp = await fetch("./dist/penalties.json")
    penalties = await resp.json() as PenaltyMap;
})

document.getElementById("calc-button")!
    .addEventListener("click",
        (): Promise<void> => checkboxes(penalties)
    );

document.getElementById("reset-button")!
    .addEventListener("click",
        (): void => {
            tableElm.style.display = "none";
            approvalLabel.textContent = "";

            for (const [pn, penalty] of Object.entries(penalties)) {
                const elm = <HTMLInputElement>document.getElementById(pn)!;

                switch (penalty.type) {
                    case "range":
                        elm.value = "5";
                        break;

                    case "checkbox":
                        elm.checked = false;
                        const parent = <HTMLDivElement>elm.parentNode!;
                        parent.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
                        break;

                    default:
                        throw new Error("Invalid penalty type");
                }
            }
        }
    );

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
