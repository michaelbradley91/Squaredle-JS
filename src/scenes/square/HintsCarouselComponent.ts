/**
 * The hints components manages the hints carousel for the user
 * 
 * #################
 * Hint word layout:
 * #################
 * 
 * The real Squardle lays out text using a grid format. This isn't something we can support with pure BBCode out of the box.
 * Squardle calculates the width of every word in the hint block, then figures out based on the longest word how many words
 * can fit in a line with the right spacing between words.
 * 
 * This then forms a grid with every word of the same length being laid out in this grid.
 * 
 * Unfortunately with Phaser it is very hard to set generic styling for headers line gap etc so we'll have to calculate
 * all this ourselves... pretty painful!
 */

import { OuterScreenNode } from "~/layouts/SquareSceneLayout";
import BaseComponent from "../BaseComponent";
import SquareScene from "./SquareScene";
import { update_rectangle } from "../BaseScene";
import { FONT_HINTS_TITLES, get_line_spacing_for_font_size } from "~/fonts";
import HintsHeaderComponent from "~/ui_components/HintsHeaderComponent";
import HintsWordsComponent from "~/ui_components/HintsWordsComponents";
import HintsBonusWordsFoundComponent from "~/ui_components/HintsBonusWordsFoundComponent";
import HintsBonusWordOfTheDayComponent from "~/ui_components/HintsBonusWordOfTheDayComponent";
import HintsComponent from "~/ui_components/HintsComponent";

export default class HintsCarouselComponent extends BaseComponent<SquareScene>
{
    game_objects!: {
        hints_left: Phaser.GameObjects.Rectangle;
        hints_right: Phaser.GameObjects.Rectangle;
        hints_left_camera: Phaser.Cameras.Scene2D.Camera;
        hints_right_camera: Phaser.Cameras.Scene2D.Camera;
        hints_text: HintsComponent<SquareScene>;
    }

    /**
     * Initialise all the objects needed to display the square
     */
    public init(): void
    {
        this.game_objects = {
            hints_left: this.scene.add.rectangle(455, 325, 755, 725, 0x00ffff),
            hints_right: this.scene.add.rectangle(455, 325, 755, 725, 0xffffff),
            hints_left_camera: this.scene.cameras.add(0, 0, 755, 725),
            hints_right_camera: this.scene.cameras.add(0, 0, 755, 725),
            hints_text: new HintsComponent(this.scene, this.game_state),
        };
    }

    /**
     * Hide everything on the hints carousel
     */
    public hide_hints_carousel_objects(): void
    {
        this.game_objects.hints_left.setVisible(false);
        this.game_objects.hints_right.setVisible(false);
        this.game_objects.hints_left_camera.setVisible(false);
        this.game_objects.hints_right_camera.setVisible(false);
        this.game_objects.hints_text.setVisible(false);
    }

    public draw_hints_carousel(): void
    {
        const left_rectangle = this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsLeft)!;

        /* Focus the camera on the correct rectangles */
        this.game_objects.hints_left_camera.setBounds(left_rectangle.x, left_rectangle.y, left_rectangle.width, left_rectangle.height * 2);
        this.game_objects.hints_left_camera.setScroll(left_rectangle.x, left_rectangle.y);
        this.game_objects.hints_left_camera.setPosition(left_rectangle.x, left_rectangle.y);
        this.game_objects.hints_left_camera.setSize(left_rectangle.width, left_rectangle.height);
        this.game_objects.hints_left_camera.setBackgroundColor(0xff0000);

        const padding = get_line_spacing_for_font_size(this.game_state, FONT_HINTS_TITLES);

        this.game_objects.hints_text.set_bounds(left_rectangle.x, left_rectangle.y, left_rectangle.width, Infinity);
        this.game_objects.hints_text.set_padding(padding, padding, padding, padding);
        this.game_objects.hints_text.update();
        this.game_objects.hints_text.setVisible(true);

        /* And the right hand camera... */
        if (!this.game_state.layout.square_scene_layout.is_vertical())
        {
            const right_rectangle = this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsRight)!;
            this.game_objects.hints_right_camera.setBounds(left_rectangle.x, left_rectangle.y, left_rectangle.width, left_rectangle.height * 2);
            this.game_objects.hints_right_camera.setScroll(left_rectangle.x, left_rectangle.y + left_rectangle.height);
            this.game_objects.hints_right_camera.setPosition(right_rectangle.x, right_rectangle.y);
            this.game_objects.hints_right_camera.setSize(right_rectangle.width, right_rectangle.height);
            this.game_objects.hints_right_camera.setBackgroundColor(0x00ff00);
            this.game_objects.hints_right_camera.setVisible(true);
        }
    }

    public draw(): void
    {
        this.hide_hints_carousel_objects();

        const layout = this.game_state.layout.square_scene_layout;
        update_rectangle(layout.get_layout_rectangle(OuterScreenNode.HintsLeft), this.game_objects.hints_left);

        if (layout.get_layout_rectangle(OuterScreenNode.HintsRight))
        {
            update_rectangle(layout.get_layout_rectangle(OuterScreenNode.HintsRight), this.game_objects.hints_right);
        }

        this.draw_hints_carousel();
    }

    update(): void
    {
        this.draw();
    }
}