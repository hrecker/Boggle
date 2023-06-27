import { generateBoard, Board } from "../model/Board";
import { config } from "../model/Config";

const tileMargin = 85;

export class MainScene extends Phaser.Scene {
    boardTiles: Phaser.GameObjects.Sprite[][];
    boardLetters: Phaser.GameObjects.Text[][];
    resetButton: Phaser.GameObjects.Sprite;
    finishedWord: Phaser.GameObjects.Text;

    selectedButton: string;
    buildingWord: boolean;
    currentWord: string[];
    tilesUsed: boolean[][];
    lastTile: Phaser.Math.Vector2;

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
        this.buildingWord = false;
        this.currentWord = [];
        this.lastTile = Phaser.Math.Vector2.ZERO.clone();

        this.tilesUsed = [];
        this.boardLetters = [];
        this.boardTiles = [];
        for (let i = 0; i < config()["boardSize"]; i++) {
            this.boardLetters.push([]);
            this.boardTiles.push([]);
            this.tilesUsed.push([]);
            for (let j = 0; j < config()["boardSize"]; j++) {
                this.createTile(i, j);
                this.createTileText(i, j);
                this.tilesUsed[i].push(false);
            }
        }

        this.resetButton = this.add.sprite(80, 200, "tile");
        this.configureButton(this.resetButton, "reset");

        // Track a few finished words
        this.finishedWord = this.add.text(520, 190, "", { ...config()["tileStyle"], font: "bold 26px Verdana" });

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

    createTile(i: number, j: number) {
        //TODO resizing
        let tile = this.add.sprite((j + 1) * tileMargin + 120, (i + 1) * tileMargin - 10, "tile");
        tile.setData("index", new Phaser.Math.Vector2(i, j));
        tile.setInteractive();
        tile.on('pointerdown', () => {
            this.startWord(i, j);
        });
        this.boardTiles[i].push(tile);
    }

    createTileText(i: number, j: number) {
        //TODO resizing
        let text = this.add.text((j + 1) * tileMargin + 120, (i + 1) * tileMargin - 10, "", config()["tileStyle"]).setOrigin(0.5);
        text.setInteractive();
        text.on('pointerdown', () => {
            this.startWord(i, j);
        });
        text.on('pointerover', () => {
            if (this.buildingWord && ! this.tilesUsed[i][j] && this.tileInRange(i, j)) {
                this.addTileToWord(i, j);
            }
        });
        this.boardLetters[i].push(text);
    }

    startWord(i: number, j: number) {
        if (! this.buildingWord) {
            console.log("Clicked tile: " + this.boardLetters[i][j].text);
            this.buildingWord = true;
            this.addTileToWord(i, j);
        }
    }

    tileInRange(i: number, j: number) {
        return Math.abs(i - this.lastTile.x) <= 1 && Math.abs(j - this.lastTile.y) <= 1;
    }

    addTileToWord(i: number, j: number) {
        console.log("Adding text " + this.boardLetters[i][j].text);
        this.currentWord.push(this.boardLetters[i][j].text);
        this.tilesUsed[i][j] = true;
        this.lastTile.x = i;
        this.lastTile.y = j;
        this.boardLetters[i][j].setColor("white");
    }

    finishWord() {
        console.log("Finished word: " + this.currentWord);
        for (let i = 0; i < this.tilesUsed.length; i++) {
            for (let j = 0; j < this.tilesUsed[i].length; j++) {
                this.tilesUsed[i][j] = false;
                this.boardLetters[i][j].setColor("black");
            }
        }
        let word = "";
        this.currentWord.forEach(tile => {
            word += tile;
        })
        this.finishedWord.text = word;
        this.buildingWord = false;
        this.currentWord = [];
    }

    update() {
        if (this.buildingWord && ! this.input.activePointer.isDown) {
            this.finishWord();
        }
    }
}