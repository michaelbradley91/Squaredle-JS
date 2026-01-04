import Phaser from 'phaser'

import StartScene from './StartScene'
import SquareScene from './SquareScene';

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 800,
	height: 600,
	scene: [SquareScene, StartScene],
	scale: {  
        mode: Phaser.Scale.RESIZE, // Key: Enable resize mode  
        autoCenter: Phaser.Scale.CENTER_BOTH, // Center canvas in parent  
        width: window.innerWidth,  // Initial width = window width  
        height: window.innerHeight // Initial height = window height  
    }
}

const game = new Phaser.Game(config);
export default game
