import { generateBoard, Board } from "../model/Board";
import { config } from "../model/Config";

const tileMargin = 85;

export class MainScene extends Phaser.Scene {
    boardTiles: Phaser.GameObjects.Sprite[][];
    boardLetters: Phaser.GameObjects.Text[][];
    resetButton: Phaser.GameObjects.Sprite;

    selectedButton: string;

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
        this.cameras.main.setBackgroundColor(0x963C3C);

        this.boardLetters = [];
        this.boardTiles = [];
        for (let i = 0; i < config()["boardSize"]; i++) {
            this.boardLetters.push([]);
            this.boardTiles.push([]);
            for (let j = 0; j < config()["boardSize"]; j++) {
                //TODO resizing
                this.boardTiles[i].push(this.add.sprite((j + 1) * tileMargin + 200, (i + 1) * tileMargin - 10, "tile"));
                this.boardLetters[i].push(this.add.text((j + 1) * tileMargin + 200, (i + 1) * tileMargin - 10, "", config()["tileStyle"]).setOrigin(0.5));
            }
        }

        this.resetButton = this.add.sprite(80, 200, "tile");
        this.configureButton(this.resetButton, "reset");

        this.loadBoard(generateBoard(config()["boardSize"]));

        this.resize(true);
        this.scale.on("resize", this.resize, this);
    }

    loadBoard(board: Board) {
        for (let i = 0; i < config()["boardSize"]; i++) {
            for (let j = 0; j < config()["boardSize"]; j++) {
                this.boardLetters[i][j].setText(board.rows[i][j]);
            }
        }
    }

    configureButton(button: Phaser.GameObjects.Image, buttonName: string/*, defaultTexture: string, downTexture: string*/) {
        button.setInteractive();
        button.on('pointerout', () => {
            //button.setTexture(defaultTexture); 
            this.selectedButton = null;
        });
        button.on('pointerdown', () => {
            //button.setTexture(downTexture);
            this.selectedButton = buttonName;
            //playSound(this, ButtonClick);
        });
        button.on('pointerup', () => {
            if (this.selectedButton === buttonName) {
                this.handleButtonClick(buttonName);
            }
            //button.setTexture(defaultTexture);
            this.selectedButton = null;
        });
    }

    handleButtonClick(buttonName) {
        switch (buttonName) {
            case "reset":
                this.loadBoard(generateBoard(config()["boardSize"]));
                break;
        }
    }
}