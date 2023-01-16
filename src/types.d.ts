export type Penalty = {
    type: string,
    text: string,
    value: number
}

export type PenaltyMap = {
    [key: string]: Penalty
}

export type PenaltyPair = {
    text: string,
    score: number
}

export type RangePair = {
    selected: number,
    score: number
}

export type CheckPair = {
    selected: boolean,
    score: number
}
