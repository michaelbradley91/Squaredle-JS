import { get_inner_rectangle_with_padding } from "../../logic";
import { OuterScreenNode } from "../../layouts/SquareSceneLayout";
import { blank_text, fit_text, FontSize } from "../../fonts";
import BBCodeText from "phaser3-rex-plugins/plugins/gameobjects/tagtext/bbcodetext/BBCodeText";
import BaseScene, { update_rectangle } from "../BaseScene";
import SquareComponent from "./SquareComponent";

export default class SquareScene extends BaseScene
{
    game_objects!: {
        top_menu_left: Phaser.GameObjects.Rectangle;
        top_menu_right: Phaser.GameObjects.Rectangle;
        progress_bar: Phaser.GameObjects.Rectangle;
        previous_words: Phaser.GameObjects.Rectangle;
        square: Phaser.GameObjects.Rectangle;
        hints_left: Phaser.GameObjects.Rectangle;
        hints_right: Phaser.GameObjects.Rectangle;
        carousel_text: BBCodeText,

        square_component: SquareComponent
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
        this.game_objects.square.visible = false;
        this.game_objects.hints_left.visible = false;
        this.game_objects.hints_right.visible = false;

        this.hide_carousel_objects();
    }

    hide_carousel_objects()
    {
        if (!this.game_objects) return;

        this.game_objects.carousel_text.setVisible(false);
    }

    draw_hints_carousel()
    {
        if (!this.game_objects) return;

        const rectangle = this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsLeft)!;
        const padding = this.game_state.font_sizes[FontSize.TINY] / 2;
        const inner_rectangle = get_inner_rectangle_with_padding(rectangle, padding);
        console.log("Drawing hints carousel in rectangle:", rectangle);
        fit_text(this.game_objects.carousel_text,
            inner_rectangle,
            ["hi ", "[i]hello[/i] ", "greetings ", "salutations ", "howdy ",
                "hi ", "[i]hello[/i] ", "greetings ", "salutations ", "howdy ",
                "hi ", "[i]hello[/i] ", "greetings ", "salutations ", "howdy ",
                "hi ", "[i]hello[/i] ", "greetings ", "salutations ", "howdy ",
                "hi ", "[i]hello[/i] ", "greetings ", "salutations ", "howdy ",
                "hi ", "[i]hello[/i] ", "greetings ", "salutations ", "howdy ",
                "hi ", "[i]hello[/i] ", "greetings ", "salutations ", "howdy ",
                "hi ", "[i]hello[/i] ", "greetings ", "salutations ", "howdy ",
            ]);

        this.game_objects.carousel_text.setVisible(true);
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
        update_rectangle(layout.get_layout_rectangle(OuterScreenNode.Square), this.game_objects.square);
        update_rectangle(layout.get_layout_rectangle(OuterScreenNode.HintsLeft), this.game_objects.hints_left);

        if (layout.get_layout_rectangle(OuterScreenNode.HintsRight))
        {
            update_rectangle(layout.get_layout_rectangle(OuterScreenNode.HintsRight), this.game_objects.hints_right);
        }

        this.game_objects.square_component.draw();
        this.draw_hints_carousel();
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
            square: this.add.rectangle(400, 300, 800, 800, 0xff00ff),
            hints_left: this.add.rectangle(455, 325, 755, 725, 0x00ffff),
            hints_right: this.add.rectangle(455, 325, 755, 725, 0xffffff),
            square_component: new SquareComponent(this, this.game_state),
            carousel_text: blank_text(this)
        };

        this.children.sendToBack(this.game_objects.square);
        this.game_objects.square_component.init();

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
    }
}