import { generateBoard, Board } from "../model/Board";
import { config } from "../model/Config";

const tileMargin = 85;

export class MainScene extends Phaser.Scene {
    boardTiles: Phaser.GameObjects.Sprite[][];
    boardLetters: Phaser.GameObjects.Text[][];
    resetButton: Phaser.GameObjects.Sprite;
    finishedWord: Phaser.GameObjects.Text;
    finishedWordPoints: Phaser.GameObjects.Text;
    wordConnections: Phaser.GameObjects.Line[];

    scoreDisplay: Phaser.GameObjects.Text;
    score: number;
    totalScoreDisplay: Phaser.GameObjects.Text;
    totalScore: number;

    selectedButton: string;
    buildingWord: boolean;
    currentWord: string[];
    usedWords: { [word: string]: boolean };
    tilesUsed: boolean[][];
    lastTile: Phaser.Math.Vector2;

    usedWordsColumn1: Phaser.GameObjects.Text;
    usedWordsColumn2: Phaser.GameObjects.Text;

    timerText: Phaser.GameObjects.BitmapText;
    timeRemainingMs: number;

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
        this.wordConnections = [];
        this.lastTile = Phaser.Math.Vector2.ZERO.clone();
        this.usedWords = {};
        this.timeRemainingMs = config()["boardTimeLimitMs"];
        this.score = 0;
        this.totalScore = 0;

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

        this.resetButton = this.add.sprite(60, 200, "tile");
        this.configureButton(this.resetButton, "reset");

        // Track a few finished words
        this.finishedWord = this.add.text(490, 102, "", { ...config()["tileStyle"], font: "bold 32px Verdana" });
        this.finishedWordPoints = this.add.text(490, 102, "", { ...config()["tileStyle"], font: "bold 30px Verdana" });

        this.totalScoreDisplay = this.add.text(490, 20, "", { ...config()["tileStyle"], font: "bold 26px Verdana" });
        this.scoreDisplay = this.add.text(490, 55, "", { ...config()["tileStyle"], font: "bold 26px Verdana" });
        this.setScore(0);

        this.usedWordsColumn1 = this.add.text(500, 125, "", { ...config()["tileStyle"], font: "bold 24px Verdana" }).setWordWrapWidth(1);
        this.usedWordsColumn2 = this.add.text(640, 125, "", { ...config()["tileStyle"], font: "bold 24px Verdana" }).setWordWrapWidth(1);
        
        this.timerText = this.add.bitmapText(this.game.renderer.width - 120, 70, "timerFont", "0.0", 48);
        this.timerText.setOrigin(0.5);
        
        this.resetBoard();

        this.resize(true);
        this.scale.on("resize", this.resize, this);
    }

    updateTimer() {
        this.timerText.setText((this.timeRemainingMs / 1000.0).toFixed(1));
    }

    setScore(score: number) {
        this.score = score;
        this.scoreDisplay.setText("Score: " + this.score);
    }

    setAllTimeScore(score: number) {
        this.totalScore = score;
        this.totalScoreDisplay.setText("Total Score: " + this.totalScore);
    }

    loadBoard(board: Board) {
        for (let i = 0; i < config()["boardSize"]; i++) {
            for (let j = 0; j < config()["boardSize"]; j++) {
                this.boardLetters[i][j].setText(board.rows[i][j]);
            }
        }
    }

    resetBoard() {
        this.loadBoard(generateBoard(config()["boardSize"]));
        this.setAllTimeScore(this.totalScore + this.score);
        this.setScore(0);
        this.usedWords = {};
        this.finishedWord.text = "";
        this.finishedWordPoints.text = "";
        this.usedWordsColumn1.text = "";
        this.usedWordsColumn2.text = "";
        this.timeRemainingMs = config()["boardTimeLimitMs"];
        this.updateTimer();
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
                this.resetBoard();
                break;
        }
    }

    createTile(i: number, j: number) {
        //TODO resizing
        let tile = this.add.sprite((j + 1) * tileMargin + 80, (i + 1) * tileMargin - 10, "tile");
        tile.setData("index", new Phaser.Math.Vector2(i, j));
        tile.setInteractive();
        tile.on('pointerdown', () => {
            this.startWord(i, j);
        });
        this.boardTiles[i].push(tile);
    }

    createTileText(i: number, j: number) {
        //TODO resizing
        let text = this.add.text((j + 1) * tileMargin + 80, (i + 1) * tileMargin - 10, "", config()["tileStyle"]).setOrigin(0.5);
        text.setInteractive();
        text.on('pointerdown', () => {
            this.startWord(i, j);
        });
        text.on('pointerover', () => {
            if (this.buildingWord && ! this.tilesUsed[i][j] && this.tileInRange(i, j)) {
                this.addTileToWord(i, j, false);
            }
        });
        this.boardLetters[i].push(text);
    }

    startWord(i: number, j: number) {
        if (! this.buildingWord) {
            console.log("Clicked tile: " + this.boardLetters[i][j].text);
            this.buildingWord = true;
            this.addTileToWord(i, j, true);
        }
    }

    tileInRange(i: number, j: number) {
        return Math.abs(i - this.lastTile.x) <= 1 && Math.abs(j - this.lastTile.y) <= 1;
    }

    addTileToWord(i: number, j: number, isFirstLetter: boolean) {
        console.log("Adding text " + this.boardLetters[i][j].text);
        if (! isFirstLetter) {
            let lastTilePos = new Phaser.Math.Vector2(this.boardTiles[this.lastTile.x][this.lastTile.y].getCenter().x,
                this.boardTiles[this.lastTile.x][this.lastTile.y].getCenter().y);
            let newTilePos = new Phaser.Math.Vector2(this.boardTiles[i][j].getCenter().x,
                this.boardTiles[i][j].getCenter().y);
            this.wordConnections.push(this.add.line(0, 0, lastTilePos.x, lastTilePos.y,
                newTilePos.x, newTilePos.y, 0x000000, 0.3).setOrigin(0, 0).setLineWidth(3, 1));
        }
        this.currentWord.push(this.boardLetters[i][j].text);
        this.tilesUsed[i][j] = true;
        this.lastTile.x = i;
        this.lastTile.y = j;
        this.boardLetters[i][j].setColor("white");
    }

    finishWord() {
        this.finishedWordPoints.text = "";
        if (this.currentWord.length < 3) {
            this.finishedWord.text = "Word too short!";
        } else {
            let word = "";
            this.currentWord.forEach(tile => {
                word += tile;
            })

            // Check if word is valid
            if (this.cache.json.get("dictionary")[word]) {
                if (word in this.usedWords) {
                    this.finishedWord.text = "Word already used!";
                } else {
                    this.finishedWord.text = word;

                    let length = this.finishedWord.text.length;
                    let score = 0;
                    if (length >= config()["maxPointsLength"]) {
                        score = config()["wordValue"]["MAX"];
                    } else {
                        score = config()["wordValue"][length];
                    }
                    this.setScore(this.score + score);
                    this.usedWords[word] = true;
                    let column = this.usedWordsColumn1;
                    console.log(this.usedWordsColumn1.getBottomCenter());
                    if (this.usedWordsColumn1.getBottomCenter().y > this.game.renderer.height - 30) {
                        column = this.usedWordsColumn2;
                    }
                    column.text += " " + word;
                    this.finishedWordPoints.setText("+" + score);
                    this.finishedWordPoints.x = this.finishedWord.getRightCenter().x + 15;
                }
            } else {
                this.finishedWord.text = "Invalid word!";
            }
        }

        for (let i = 0; i < this.tilesUsed.length; i++) {
            for (let j = 0; j < this.tilesUsed[i].length; j++) {
                this.tilesUsed[i][j] = false;
                this.boardLetters[i][j].setColor("black");
            }
        }
        this.wordConnections.forEach(line => {
            line.destroy();
        })
        this.wordConnections = [];
        this.currentWord = [];
        this.buildingWord = false;
    }

    update(time, delta) {
        if (this.buildingWord && ! this.input.activePointer.isDown) {
            this.finishWord();
        }
        this.timeRemainingMs -= delta;
        if (this.timeRemainingMs <= 0) {
            this.resetBoard();
        } else {
            this.updateTimer();
        }
    }
}