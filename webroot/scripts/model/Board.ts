import { shuffleArray } from "../util/Util";

//TODO For now only have dice implemented for a 4x4 board
let DICE = [
    ["R", "I", "F", "O", "B", "X"],
    ["I", "F", "E", "H", "E", "Y"],
    ["D", "E", "N", "O", "W", "S"],
    ["U", "T", "O", "K", "N", "D"],
    ["H", "M", "S", "R", "A", "O"],
    ["L", "U", "P", "E", "T", "S"],
    ["A", "C", "I", "T", "O", "A"],
    ["Y", "L", "G", "K", "U", "E"],
    ["QU", "B", "M", "J", "O", "A"],
    ["E", "H", "I", "S", "P", "N"],
    ["V", "E", "T", "I", "G", "N"],
    ["B", "A", "L", "I", "Y", "T"],
    ["E", "Z", "A", "V", "N", "D"],
    ["R", "A", "L", "E", "S", "C"],
    ["U", "W", "I", "L", "R", "G"],
    ["P", "A", "C", "E", "M", "D"],
];

export type Board = {
    rows: string[][]
}

export function generateBoard(boardSize: number): Board {
    let rows: string[][] = [];
    shuffleArray(DICE);
    for (let i = 0; i < boardSize; i++) {
        rows.push([]);
        for (let j = 0; j < boardSize; j++) {
            let diceFaceIndex = Math.floor(Math.random() * 6);
            console.log("Dice: " + DICE[i * 4 + j]);
            rows[i].push(DICE[i * 4 + j][diceFaceIndex]);
        }
    }
    return {
        rows: rows
    };
}
