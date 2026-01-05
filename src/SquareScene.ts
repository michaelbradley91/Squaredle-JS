import Yoga, { Node } from "yoga-layout";
import { GameState, init_game_state } from "./logic";
import { OuterScreenNode } from "./layouts/SquareSceneLayout";


export default class SquareScene extends Phaser.Scene
{
    game_objects: {
        top_menu_left: Phaser.GameObjects.Rectangle;
        top_menu_right: Phaser.GameObjects.Rectangle;
        progress_bar: Phaser.GameObjects.Rectangle;
        previous_words: Phaser.GameObjects.Rectangle;
        square: Phaser.GameObjects.Rectangle;
        hints_left: Phaser.GameObjects.Rectangle;
        hints_right: Phaser.GameObjects.Rectangle;
    } | undefined = undefined

    game_state!: GameState;

    constructor()
    {
        super('square')
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
        // Update camera viewport to match new size  
        this.cameras.main.setViewport(0, 0, game_size.width, game_size.height);

        // Update the layout
        this.update_layout();
    }

    preload()
    {
        // this.load.image("present", "assets/Present.png");
    }

    update_rectangle(coords: { x: number, y: number, width: number, height: number }, rectangle: Phaser.GameObjects.Rectangle)
    {
        rectangle.setPosition(coords.x + (coords.width / 2), coords.y + (coords.height / 2));
        rectangle.setSize(coords.width, coords.height);
        rectangle.setVisible(true);
    }

    hide_all_rectangles()
    {
        if (!this.game_objects) return;

        this.game_objects.top_menu_left.visible = false;
        this.game_objects.top_menu_right.visible = false;
        this.game_objects.progress_bar.visible = false;
        this.game_objects.previous_words.visible = false;
        this.game_objects.square.visible = false;
        this.game_objects.hints_left.visible = false;
        this.game_objects.hints_right.visible = false;
    }

    draw()
    {
        if (!this.game_objects || !this.game_state.layout.square_scene_layout) return;

        this.hide_all_rectangles();

        const layout = this.game_state.layout.square_scene_layout;
        this.update_rectangle(layout.get_layout_rectangle(OuterScreenNode.TopMenu), this.game_objects.top_menu_left);
        if (layout.is_vertical())
        {
            this.update_rectangle(layout.get_layout_rectangle(OuterScreenNode.TopMenuRight), this.game_objects.top_menu_right);
        }
        this.update_rectangle(layout.get_layout_rectangle(OuterScreenNode.ProgressBar), this.game_objects.progress_bar);
        this.update_rectangle(layout.get_layout_rectangle(OuterScreenNode.PreviousWords), this.game_objects.previous_words);
        this.update_rectangle(layout.get_layout_rectangle(OuterScreenNode.Square), this.game_objects.square);
        this.update_rectangle(layout.get_layout_rectangle(OuterScreenNode.HintsLeft), this.game_objects.hints_left);

        if (layout.get_layout_rectangle(OuterScreenNode.HintsRight))
        {
            this.update_rectangle(layout.get_layout_rectangle(OuterScreenNode.HintsRight), this.game_objects.hints_right);
        }
    }

    update_layout()
    {
        this.game_state.layout.square_scene_layout.update_layout({ width: this.game.canvas.width, height: this.game.canvas.height });
        this.draw();
    }

    create()
    {
        this.game_objects = {
            top_menu_left: this.add.rectangle(400, 300, 800, 600, 0xff00000),
            top_menu_right: this.add.rectangle(400, 300, 800, 600, 0x00ff00),
            progress_bar: this.add.rectangle(400, 300, 800, 600, 0x0000ff),
            previous_words: this.add.rectangle(400, 300, 800, 600, 0xffff00),
            square: this.add.rectangle(400, 300, 800, 800, 0xff00ff),
            hints_left: this.add.rectangle(455, 325, 755, 725, 0x00ffff),
            hints_right: this.add.rectangle(455, 325, 755, 725, 0xffffff)
        }

        // Listen for resize events  
        this.scale.on('resize', this.handle_resize, this);

        // TODO: create the square here

        // Trigger initial resize to set positions  
        this.handle_resize(this.scale.gameSize);
    }

    update(_time: number, _delta: number): void
    {
        // update logic here
    }
}