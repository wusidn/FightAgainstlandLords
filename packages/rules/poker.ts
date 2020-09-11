import { v1 } from "uuid";

export enum PokerType {
    Spade = 996,
    Heart,
    Diamond,
    Club,
}

export interface Card {
    type: string;
    name: string;
    value: number;
    uuid: string;
}

const cards = [];
Object.keys(PokerType).forEach(type => {
    ["3", "4", "5", "6", "7", "8", "9", "10", "j", "q", "k", "1", "2"].forEach((name, value) => {
        cards.push({
            type,
            name,
            value,
        });
    });
});

cards.push(
    {
        type: "queen",
        name: "#",
        value: 13,
    },
    {
        type: "king",
        name: "$",
        value: 14,
    }
);

export function gen(): Array<Card> {
    return cards
        .map(card => {
            return {
                ...card,
                uuid: v1(),
            };
        })
        .sort(() => {
            return Math.random() - Math.random();
        });
}
