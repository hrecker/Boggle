import { generateBoard, Board } from "../model/Board";
import { config } from "../model/Config";

export class MainScene extends Phaser.Scene {
    boardRows: Phaser.GameObjects.Text[][];
    downLastUpdate: boolean;

    constructor() {
        super({
            key: "MainScene"
        });
    }

    /** Adjust any UI elements that need to change position based on the canvas size */
    resize(force?: boolean) {
        if (! this.scene.isActive() && force !== true) {
            return;
        }
        //TODO
    }

    create() {
        this.downLastUpdate = false;

        this.boardRows = [];
        for (let i = 0; i < config()["boardSize"]; i++) {
            this.boardRows.push([]);
            for (let j = 0; j < config()["boardSize"]; j++) {
                this.boardRows[i].push(this.add.text((j + 1) * 25, (i + 1) * 25, ""));
            }
        }

        this.loadBoard(generateBoard(config()["boardSize"]));

        this.resize(true);
        this.scale.on("resize", this.resize, this);
    }

    loadBoard(board: Board) {
        console.log("New board");
        console.log(board.rows);
        for (let i = 0; i < config()["boardSize"]; i++) {
            for (let j = 0; j < config()["boardSize"]; j++) {
                this.boardRows[i][j].setText(board.rows[i][j]);
            }
        }
    }

    update() {
        if (this.input.activePointer.isDown && ! this.downLastUpdate) {
            this.loadBoard(generateBoard(config()["boardSize"]));
        }
        this.downLastUpdate = this.input.activePointer.isDown;
    }
}