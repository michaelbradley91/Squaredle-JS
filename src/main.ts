import Phaser from 'phaser'
import RoundRectanglePlugin from 'phaser3-rex-plugins/plugins/roundrectangle-plugin.js';
import BBCodeTextPlugin from 'phaser3-rex-plugins/plugins/bbcodetext-plugin.js';
import StartScene from './StartScene'
import SquareScene from './SquareScene';

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 800,
	height: 600,
	scene: [SquareScene, StartScene],
	pixelArt: false,
	plugins: {
		global: [
			{
				key: 'rexRoundRectanglePlugin',
				plugin: RoundRectanglePlugin,
				start: true
			},
			{
				key: 'rexBBCodeTextPlugin',
				plugin: BBCodeTextPlugin,
				start: true
			}
		]
	},
	scale: {
		mode: Phaser.Scale.RESIZE, // Key: Enable resize mode  
		autoCenter: Phaser.Scale.CENTER_BOTH, // Center canvas in parent  
		width: window.innerWidth,  // Initial width = window width  
		height: window.innerHeight, // Initial height = window height
	},
	autoRound: true,
	antialias: true,
}

const game = new Phaser.Game(config);
export default game
