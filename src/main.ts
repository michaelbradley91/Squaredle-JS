import Phaser from 'phaser'

import StartScene from './StartScene'
import LevelSelectScene from './LevelSelectScene';
import BuildingScene from './BuildingScene';
import PlayScene from './PlayScene';

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 960,
	height: 540,
	antialias: true,
	physics: {
		default: 'arcade'
	},
	scene: [StartScene],
	pixelArt: false,
	scale: {
		parent: 'app',
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		zoom: 1,
	}
}

const game = new Phaser.Game(config);
export default game
