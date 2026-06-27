import Phaser from 'phaser'
import RoundRectanglePlugin from 'phaser4-rex-plugins/plugins/roundrectangle-plugin.js';
import BBCodeTextPlugin from 'phaser4-rex-plugins/plugins/bbcodetext-plugin.js';
import CheckboxPlugin from 'phaser4-rex-plugins/plugins/checkbox-plugin.js';
import StartScene from './StartScene'
import SquareScene from './scenes/square/SquareScene';

const config: Phaser.Types.Core.GameConfig = {
	// Canvas renderer is much more performant for the GPU
	type: Phaser.CANVAS,
	parent: 'app',
	width: 800,
	height: 600,
	scene: [SquareScene, StartScene],
	pixelArt: false,
	render: {
		clearBeforeRender: true,
	},
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
			},
			{
				key: 'rexCheckboxPlugin',
				plugin: CheckboxPlugin,
				start: true
			},
		]
	},
	scale: {
		mode: Phaser.Scale.RESIZE, // Key: Enable resize mode  
		autoCenter: Phaser.Scale.CENTER_BOTH, // Center canvas in parent  
		width: window.innerWidth,  // Initial width = window width  
		height: window.innerHeight, // Initial height = window height
	},
	// Significantly improves performance
	fps: {
		target: 60,
		forceSetTimeOut: true,
	}
}

const game = new Phaser.Game(config);
export default game
