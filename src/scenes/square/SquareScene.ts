import { OuterScreenNode } from "../../layouts/SquareSceneLayout";
import BaseScene, { update_rectangle } from "../BaseScene";
import SquareComponent from "./SquareComponent";
import HintsCarouselComponent from "./HintsCarouselComponent";

export default class SquareScene extends BaseScene
{
    game_objects!: {
        top_menu_left: Phaser.GameObjects.Rectangle;
        top_menu_right: Phaser.GameObjects.Rectangle;
        progress_bar: Phaser.GameObjects.Rectangle;
        previous_words: Phaser.GameObjects.Rectangle;

        square_component: SquareComponent
        hints_carousel_component: HintsCarouselComponent,
    };

    constructor()
    {
        super('square')
    }

    hide_all_objects()
    {
        this.game_objects.top_menu_left.visible = false;
        this.game_objects.top_menu_right.visible = false;
        this.game_objects.progress_bar.visible = false;
        this.game_objects.previous_words.visible = false;
    }

    draw()
    {
        // Start by hiding everything
        this.hide_all_objects();

        // Draw the basic layout
        const layout = this.game_state.layout.square_scene_layout;
        update_rectangle(layout.get_layout_rectangle(OuterScreenNode.TopMenu), this.game_objects.top_menu_left);
        if (!layout.is_vertical())
        {
            update_rectangle(layout.get_layout_rectangle(OuterScreenNode.TopMenuRight), this.game_objects.top_menu_right);
        }
        update_rectangle(layout.get_layout_rectangle(OuterScreenNode.ProgressBar), this.game_objects.progress_bar);
        update_rectangle(layout.get_layout_rectangle(OuterScreenNode.PreviousWords), this.game_objects.previous_words);

        this.game_objects.square_component.draw();
        this.game_objects.hints_carousel_component.draw();
    }

    update_layout()
    {
        this.game_state.layout.square_scene_layout.update_layout({ width: this.game.canvas.width, height: this.game.canvas.height }, this.game_state);
        this.draw();
    }

    init_scene(): void
    {
        this.game_objects = {
            top_menu_left: this.add.rectangle(400, 300, 800, 600, 0xff00000),
            top_menu_right: this.add.rectangle(400, 300, 800, 600, 0x00ff00),
            progress_bar: this.add.rectangle(400, 300, 800, 600, 0x0000ff),
            previous_words: this.add.rectangle(400, 300, 800, 600, 0xffff00),
            square_component: new SquareComponent(this, this.game_state),
            hints_carousel_component: new HintsCarouselComponent(this, this.game_state),
        };

        this.game_objects.square_component.init();
        this.game_objects.hints_carousel_component.init();

        // Listen for events
        this.input.on('pointerdown', this.handle_pointer_down, this);
        this.input.on('pointerup', this.handle_pointer_up, this);
    }

    handle_pointer_down(pointer: Phaser.Input.Pointer)
    {
        this.game_objects.square_component.handle_pointer_down(pointer);
    }

    handle_pointer_up(pointer: Phaser.Input.Pointer)
    {
        this.game_objects.square_component.handle_pointer_up(pointer);
    }

    update(_time: number, _delta: number): void
    {
        this.game_objects.square_component.update();
        this.game_objects.hints_carousel_component.update();
    }
}