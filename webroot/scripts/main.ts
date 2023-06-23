import 'phaser';

import { LoadingScene } from "./scenes/LoadingScene";
import { MainScene } from './scenes/MainScene';

var config: Phaser.Types.Core.GameConfig = {
    scale: {
        parent: "game-div",
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    // NOTE - With hardware acceleration disabled in Chrome, WEBGL causes enormous CPU usage on my desktop.
    type: Phaser.WEBGL,
    scene: [
        LoadingScene,
        MainScene
    ]
};

new Phaser.Game(config);
