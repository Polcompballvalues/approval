export type penalty = {
    type: string,
    text: string,
    value: number,
    rangevalues: {
        [key: string]: number
    }
}

export type penaltylist = {
    [key: string]: penalty
}

export type retpair = {
    text: string,
    score: number
}

export type rangepair = {
    selected: number,
    score: number
}

export type checkpair = {
    selected: boolean,
    score: number
}