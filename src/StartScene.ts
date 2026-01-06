import Phaser from 'phaser'
import { FONT_FAMILY, HIGHLIGHTED_TEXT_COLOR, START_MENU_FONT_SIZE, TEXT_COLOR } from './constants';
import { GameState, init_game_state } from './logic';
import Yoga, { Node } from 'yoga-layout';


const SCREEN_NODE_INDEX = 0;
const START_NODE_INDEX = 0;
const QUIT_NODE_INDEX = 1;


export default class StartScene extends Phaser.Scene 
{
	start_text: Phaser.GameObjects.Text | undefined;
	quit_text: Phaser.GameObjects.Text | undefined;
	game_state!: GameState;
	is_persistent: string = "no"
	storage_estimate: { usage: number, quota: number } = { usage: 0, quota: 0 };

	// Layout logic
	layout_nodes: { screen: Node, start: Node, quit: Node } | undefined;

	constructor() 
	{
		super('start')
	}

	update_layout()
	{
		// Build the layout tree if it doesn't exist yet
		if (!this.game_state.layout.start_scene_root_node)
		{
			const node = Yoga.Node.create();
			this.game_state.layout.start_scene_root_node = node;

			// The screen node is the outer container holding the menu options
			const screen_node = Yoga.Node.create();
			screen_node.setWidth("100%");
			screen_node.setHeight("100%");
			screen_node.setDisplay(Yoga.DISPLAY_FLEX);
			screen_node.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
			screen_node.setJustifyContent(Yoga.JUSTIFY_CENTER);
			screen_node.setAlignItems(Yoga.ALIGN_CENTER);

			node.insertChild(screen_node, SCREEN_NODE_INDEX);

			const start_node = Yoga.Node.create();
			start_node.setHeight(this.start_text?.height || 50);
			start_node.setWidth(this.start_text?.width || 50);
			start_node.setMargin(Yoga.EDGE_ALL, 10);
			screen_node.insertChild(start_node, START_NODE_INDEX);

			const quit_node = Yoga.Node.create();
			quit_node.setHeight(this.quit_text?.height || 50);
			quit_node.setWidth(this.quit_text?.width || 50);
			quit_node.setMargin(Yoga.EDGE_ALL, 10);
			screen_node.insertChild(quit_node, QUIT_NODE_INDEX);
		}

		// For ease of use later, remember the layout nodes
		if (!this.layout_nodes)
		{
			const screen_node = this.game_state.layout.start_scene_root_node.getChild(SCREEN_NODE_INDEX);
			const start_node = screen_node.getChild(START_NODE_INDEX);
			const quit_node = screen_node.getChild(QUIT_NODE_INDEX);
			this.layout_nodes = { screen: screen_node, start: start_node, quit: quit_node };
		}

		// Recompute the layout for the current canvas size
		this.game_state.layout.start_scene_root_node.setWidth(this.game.canvas.width);
		this.game_state.layout.start_scene_root_node.setHeight(this.game.canvas.height);

		this.layout_nodes.start.setWidth(this.start_text?.width || 50);
		this.layout_nodes.start.setHeight(this.start_text?.height || 50);

		this.layout_nodes.quit.setWidth(this.quit_text?.width || 50);
		this.layout_nodes.quit.setHeight(this.quit_text?.height || 50);

		this.game_state.layout.start_scene_root_node.calculateLayout(this.game.canvas.width, this.game.canvas.height, Yoga.DIRECTION_LTR);

		// Apply the layout to the menu options
		this.start_text?.setPosition(this.layout_nodes.start.getComputedLeft(), this.layout_nodes.start.getComputedTop());
		this.quit_text?.setPosition(this.layout_nodes.quit.getComputedLeft(), this.layout_nodes.quit.getComputedTop());
	}

	init(data: { game_state: GameState })
	{
		if (!data || !data.game_state)
		{
			this.game_state = init_game_state();
		}
		else
		{
			this.game_state = data.game_state;
		}

		// Set up the Yoga tree for the start scene
		this.update_layout();
	}

	handle_resize(game_size: Phaser.Structs.Size)
	{
		this.quit_text?.setText('Quit' + window.history.length);
		// Update camera viewport to match new size  
		this.cameras.main.setViewport(0, 0, game_size.width, game_size.height);

		this.update_layout();
	}

	preload() 
	{
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
				color: TEXT_COLOR
			});
		}
		if (text !== this.quit_text)
		{
			this.quit_text?.setStyle({
				fontFamily: FONT_FAMILY,
				fontSize: START_MENU_FONT_SIZE,
				color: TEXT_COLOR
			});
		}
		text?.setStyle({
			fontFamily: FONT_FAMILY,
			fontSize: START_MENU_FONT_SIZE,
			color: HIGHLIGHTED_TEXT_COLOR
		});
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

	get_storage_estimate() 
	{
		if (navigator.storage && navigator.storage.estimate) 
		{
			navigator.storage.estimate()
				.then(estimate => 
				{
					console.log(`Using ${estimate.usage} out of ${estimate.quota} bytes.`);
					this.storage_estimate = { usage: estimate.usage || 0, quota: estimate.quota || 0 };
				})
				.catch(err => 
				{
					console.error('Error getting storage estimate:', err);
				});
		}
	}

	request_persistence() 
	{
		if (navigator.storage && navigator.storage.persist) 
		{
			navigator.storage.persist()
				.then(granted => 
				{
					if (granted) 
					{
						console.log('✅ Persistent storage granted.');
						this.is_persistent = "yes";
						this.get_storage_estimate();
					}
					else 
					{
						console.warn('❌ Persistent storage denied.');
						this.is_persistent = "no";
					}
				})
				.catch(err => 
				{
					console.error('Error requesting persistence:', err);
					this.is_persistent = "error";
				});
		}
	}

	create() 
	{
		navigator.storage.persisted()
			.then(isPersisted => 
			{
				if (isPersisted) 
				{
					console.log('✅ Storage is already persistent.');
					this.is_persistent = "yes";
					this.get_storage_estimate();
				}
				else 
				{
					console.log('⚠️ Storage is not persistent. Requesting permission...');
					this.request_persistence();
				}
			})
			.catch(err => 
			{
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
		this.start_text.on('pointerup', () => 
		{
			if (this.is_highlighted(this.start_text))
			{
				this.start_game();
			}
		}, this);
		this.start_text.on('pointerdown', () => 
		{
			this.highlight_menu_option(this.start_text);
		}, this);

		this.quit_text.on('pointerup', () => 
		{
			if (this.is_highlighted(this.quit_text))
			{
				this.quit_game();
			}
		}, this);
		this.quit_text.on('pointerdown', () => 
		{
			this.highlight_menu_option(this.quit_text);
		}, this);

		// Listen for resize events  
		this.scale.on('resize', this.handle_resize, this);

		// Trigger initial resize to set positions  
		this.handle_resize(this.scale.gameSize);
	}

	update(time: number, delta: number): void 
	{
		// Update logic if needed
		this.start_text?.setText(`Start (${this.is_persistent}) ${this.storage_estimate?.usage} / ${this.storage_estimate?.quota}`);
		this.update_layout();
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
