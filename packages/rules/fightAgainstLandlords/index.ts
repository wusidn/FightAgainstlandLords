import { Card } from "../poker";

interface Compare {
    rule: string;
    source: Array<Card>;
    A?: number;
    B?: number;
    C?: number;
    D?: number;
    "+"?: number;
}

export const rules = {
    A: {
        value: (src: Compare): number => {
            return src.A as number;
        },
    },
    AA: {
        value: (src: Compare): number => {
            return src.A as number;
        },
    },
    "AAA+": {
        value: (src: Compare): number => {
            return src.A as number;
        },
    },
    "AAAB+": {
        value: (src: Compare): number => {
            return src.A as number;
        },
    },
    "AAABB+": {
        value: (src: Compare): number => {
            return src.A as number;
        },
    },
    AAAA: {
        value: (src: Compare): number => {
            return (src.A as number) * 4;
        },
    },
    AAAABC: {
        value: (src: Compare): number => {
            return src.A as number;
        },
    },
    AAAABB: {
        value: (src: Compare): number => {
            return src.A as number;
        },
    },
    AAAABBCC: {
        value: (src: Compare): number => {
            return src.A as number;
        },
    },
    "ABCDE+": {},
    AABBCC: {},
    AB: {},
};
