import Phaser from 'phaser'
import { FONT_FAMILY, HIGHLIGHTED_TEXT_COLOR, START_MENU_FONT_SIZE, TEXT_COLOR } from './constants';
import { GameState, init_game_state } from './logic';
import StartScreen from '../assets/StartScreen.png';

export default class StartScene extends Phaser.Scene {
	start_text: Phaser.GameObjects.Text | undefined;
	quit_text: Phaser.GameObjects.Text | undefined;
	game_state!: GameState;

	constructor() {
		super('start')
	}

	init(data: {game_state: GameState})
	{
		if (!data || !data.game_state)
		{
			this.game_state = init_game_state();
		}
		else
		{
			this.game_state = data.game_state;
		}
	}

	handle_resize(game_size: Phaser.Structs.Size)
	{
		// Update camera viewport to match new size  
    	this.cameras.main.setViewport(0, 0, game_size.width, game_size.height); 

		// Update the position of the menu options based on the new game size
		if (this.start_text)
		{
			this.start_text.setPosition(game_size.width / 2 - 50, game_size.height / 2 - 50);
		}
		if (this.quit_text)
		{
			this.quit_text.setPosition(game_size.width / 2 - 50, game_size.height / 2 + 50);
		}
	}

	preload() {
		// this.load.image("present", "assets/Present.png");
	}

	// Highlight the menu option the user is about to click
	highlight_menu_option(text: Phaser.GameObjects.Text | undefined)
	{
		if (text !== this.start_text)
		{
			this.start_text?.setStyle({
				fontFamily: FONT_FAMILY,
				fontSize: START_MENU_FONT_SIZE,
				color: TEXT_COLOR});
		}
		if (text !== this.quit_text)
		{
			this.quit_text?.setStyle({
				fontFamily: FONT_FAMILY,
				fontSize: START_MENU_FONT_SIZE,
				color: TEXT_COLOR});
		}
		text?.setStyle({
			fontFamily: FONT_FAMILY,
			fontSize: START_MENU_FONT_SIZE,
			color: HIGHLIGHTED_TEXT_COLOR});
	}

	is_highlighted(text: Phaser.GameObjects.Text | undefined): boolean
	{
		if (text === this.start_text)
		{
			return this.start_text?.style.color == HIGHLIGHTED_TEXT_COLOR;
		}
		if (text === this.quit_text)
		{
			return this.quit_text?.style.color == HIGHLIGHTED_TEXT_COLOR;
		}
		return false;
	}

	create() {
		this.start_text = this.add.text(197, 184, 'Start', {
			fontFamily: FONT_FAMILY,
			fontSize: START_MENU_FONT_SIZE,
			color: HIGHLIGHTED_TEXT_COLOR
		}).setInteractive();

		this.quit_text = this.add.text(198, 306, 'Quit', {
			fontFamily: FONT_FAMILY,
			fontSize: START_MENU_FONT_SIZE,
			color: TEXT_COLOR
		}).setInteractive();
		
		// Set up the menu events
		this.start_text.on('pointerup', () => {
			if (this.is_highlighted(this.start_text))
			{
				this.start_game();
			}
		}, this);
		this.start_text.on('pointerdown', () => {
			this.highlight_menu_option(this.start_text);
		}, this);

		this.quit_text.on('pointerup', () => {
			if (this.is_highlighted(this.quit_text))
			{
				this.quit_game();
			}
		}, this);
		this.quit_text.on('pointerdown', () => {
			this.highlight_menu_option(this.quit_text);
		}, this);

		// Listen for resize events  
		this.scale.on('resize', this.handle_resize, this);  
	
		// Trigger initial resize to set positions  
		this.handle_resize(this.scale.gameSize);  
	}

	update(time: number, delta: number): void {
		// Update logic if needed
	}

	start_game()
	{
		// this.scene.start("level-select", {game_state: this.game_state});
		// TODO
		console.log("Starting game - but no levels yet!");
		this.game.destroy(true, false);
		window.close();
	}

	quit_game()
	{
		// Quit the entire game!
		this.game.destroy(true, false);
		window.close();
	}
}
