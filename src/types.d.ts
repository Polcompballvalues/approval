export type PenaltyType = "range" | "checkbox";

export type Penalty = {
    type: PenaltyType,
    text: string,
    value: number
};

export type PenaltyMap = Record<string, Penalty>;

export type PenaltyPair = [
    text: string,
    score: number
];

export type RangePair = [
    selected: number,
    score: number
];

export type CheckPair = [
    selected: boolean,
    score: number
];
