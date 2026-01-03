import Phaser from 'phaser'
import { FONT_FAMILY, HIGHLIGHTED_TEXT_COLOR, START_MENU_FONT_SIZE, TEXT_COLOR } from './constants';
import { GameState, init_game_state } from './logic';
import StartScreen from '../assets/StartScreen.png';

export default class StartScene extends Phaser.Scene {
	start_text: Phaser.GameObjects.Text | undefined;
	quit_text: Phaser.GameObjects.Text | undefined;
	game_state!: GameState;
	is_persistent: string = "no"
	storage_estimate: {usage: number, quota: number} = {usage: 0, quota: 0};

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
		this.quit_text?.setText('Quit' + window.history.length);
		// Update camera viewport to match new size  
    	this.cameras.main.setViewport(0, 0, game_size.width, game_size.height); 

		// Update the position of the menu options based on the new game size
		if (this.start_text)
		{
			this.start_text.setPosition((game_size.width - this.start_text.width) / 2, game_size.height / 2- 50);
		}
		if (this.quit_text)
		{
			this.quit_text.setPosition((game_size.width - this.quit_text.width) / 2, game_size.height / 2 + 50);
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

	get_storage_estimate() {
		if (navigator.storage && navigator.storage.estimate) {
			navigator.storage.estimate()
				.then(estimate => {
					console.log(`Using ${estimate.usage} out of ${estimate.quota} bytes.`);
					this.storage_estimate = {usage: estimate.usage || 0, quota: estimate.quota || 0};
				})
				.catch(err => {
					console.error('Error getting storage estimate:', err);
				});
		}
	}

	request_persistence() {
        if (navigator.storage && navigator.storage.persist) {
            navigator.storage.persist()
                .then(granted => {
                    if (granted) {
                        console.log('✅ Persistent storage granted.');
						this.is_persistent = "yes";
						this.get_storage_estimate();
                    } else {
                        console.warn('❌ Persistent storage denied.');
						this.is_persistent = "no";
                    }
                })
                .catch(err => {
                    console.error('Error requesting persistence:', err);
					this.is_persistent = "error";
                });
        }
    }

	create() {
		navigator.storage.persisted()
                .then(isPersisted => {
                    if (isPersisted) {
                        console.log('✅ Storage is already persistent.');
						this.is_persistent = "yes";
						this.get_storage_estimate();
                    } else {
                        console.log('⚠️ Storage is not persistent. Requesting permission...');
                        this.request_persistence();
                    }
                })
                .catch(err => {
                    console.error('Error checking persistence:', err);
					this.is_persistent = "error";
                });

		this.start_text = this.add.text(0, 0, 'Start', {
			fontFamily: FONT_FAMILY,
			fontSize: START_MENU_FONT_SIZE,
			color: HIGHLIGHTED_TEXT_COLOR
		}).setInteractive();

		this.quit_text = this.add.text(0, 0, 'Quit' + window.history.length, {
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
		this.start_text?.setText(`Start (${this.is_persistent}) ${this.storage_estimate?.usage} / ${this.storage_estimate?.quota}`);
		this.start_text?.setPosition((this.game.canvas.width - this.start_text.width) / 2, this.game.canvas.height / 2- 50);
		this.quit_text?.setPosition((this.game.canvas.width - this.quit_text.width) / 2, this.game.canvas.height / 2 + 50);
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
