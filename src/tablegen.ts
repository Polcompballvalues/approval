import type {penalty, penaltylist, retpair, rangepair, checkpair} from "./types"

function rangecalc(name:string, range:penalty): rangepair {
    let ret = {} as rangepair
    const elm = <HTMLInputElement> document.getElementById(name)!
    ret.selected = parseInt(elm.value)
    ret.score = range.rangevalues[ret.selected.toString()]
    return ret
}

function checkcalc(name:string, checkbox:penalty): checkpair {
    let ret = {} as checkpair
    const elm = <HTMLInputElement> document.getElementById(name)!
    ret.selected = elm.checked 
    ret.score = ret.selected ? checkbox.value : 0
    return ret
}

function tablegen(row:Array<string>): string {
    let str: string = "|"
    for(const i of row) {
        str += i + "|"
    }
    return str + "\n"
}

function determinate(name:string, penalty:penalty, score:number):retpair {
    switch(penalty.type) {
        case "range": {
            const val:rangepair = rangecalc(name,penalty)
            let ret = {} as retpair
            ret.score = val.score
            ret.text = tablegen([penalty.text,(val.selected.toString() + "/10"),val.score.toString(),(score + ret.score).toString()])
            return ret
        }
        case "checkbox": {
            const val:checkpair = checkcalc(name,penalty)
            let ret = {} as retpair
            if(val.selected) {
                ret.score = val.score
                ret.text = tablegen([penalty.text,"broken",val.score.toString(),(score + ret.score).toString()])
            } else {
                ret.score = 0
                ret.text = ""
            }
            return ret
        }
        default:
            throw new Error("invalid penalty type")
    }
}

async function checkboxes() {
    const penalties: penaltylist = await fetch("./json/penalties.json")
        .then(response => response.json())
    let table: string = tablegen(["Item","Rating","Score Change","Score"]) + tablegen(Array(4).fill(":-"))
    let score: number = 0
    for(const i of Object.keys(penalties)) {
        let ret:retpair = determinate(i,penalties[i],score)
        score += ret.score
        table += ret.text ? ret.text : ""
    }
    const preelm = <HTMLPreElement> document.getElementById("finaltable")
    const pelm = <HTMLParagraphElement> document.getElementById("approvetext")
    preelm.innerHTML = table
    preelm.style.display = "inline-block"
    if(score>=0){
        pelm.innerHTML = "Approve this"
        pelm.style.color = "green"
    } else {
        pelm.innerHTML = "Remove this"
        pelm.style.color = "red"
    }
}

window.onload = () => {
    const elms = <HTMLCollectionOf<HTMLDivElement>> document.getElementsByClassName("checkblock")
    for(const e of elms) {
        const children: any = e.children
        for(const c of children){
            if(c.getAttribute("type") == "checkbox"){
                e.addEventListener("click", () => {
                    c.checked = !c.checked
                })
            }
        }
    }
}


document.getElementById("calcbutton")!.onclick = () => checkboxes()
document.getElementById("finaltable")!.onclick = async () => {
    const elm = <HTMLPreElement> document.getElementById("finaltable")!
    const text: string = elm.innerHTML
    navigator.clipboard.writeText(text)
    const height: number = elm.scrollHeight
    const borheight: string = getComputedStyle(elm).paddingTop
    const width: number = elm.scrollWidth
    const borwidth: string = getComputedStyle(elm).paddingLeft
    elm.style.color = "#F00"
    elm.style.height = (height-2*(parseFloat(borheight))).toFixed()+"px"
    elm.style.width = (width-2*(parseFloat(borwidth))).toFixed(1)+"px"
    elm.innerHTML = "Text copied to clipboard"
    await new Promise(r => setTimeout(r,1500))
    elm.style.color = "#FFF"
    elm.innerHTML = text
    elm.style.height = "auto"
    elm.style.width = "auto"
}
