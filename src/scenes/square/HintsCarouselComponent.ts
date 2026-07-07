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
import { SCROLL_PARAMETERS_DEFAULTS, ScrollManager } from "~/scroll";

export default class HintsCarouselComponent extends BaseComponent<SquareScene>
{
    game_objects!: {
        hints_left: Phaser.GameObjects.Rectangle;
        hints_right: Phaser.GameObjects.Rectangle;
        hints_left_camera: Phaser.Cameras.Scene2D.Camera;
        hints_right_camera: Phaser.Cameras.Scene2D.Camera;
        hints_text: HintsComponent<SquareScene>;
    }

    hints_scroll_left!: ScrollManager;
    hints_scroll_right!: ScrollManager;

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

        let left_rectangle = this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsLeft);
        if (!left_rectangle)
        {
            left_rectangle = { x: 0, y: 0, width: 0, height: 0 };
        }

        let right_rectangle = this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsRight);
        if (!right_rectangle || this.game_state.layout.square_scene_layout.is_vertical())
        {
            right_rectangle = { x: 0, y: 0, width: 0, height: 0 };
        }

        const scroll_left_parameters = SCROLL_PARAMETERS_DEFAULTS;
        scroll_left_parameters.scroll_direction = "vertical";
        scroll_left_parameters.scroll_bounds = { min: left_rectangle.y, max: left_rectangle.y + left_rectangle.height };
        this.hints_scroll_left = new ScrollManager(scroll_left_parameters);

        const scroll_right_parameters = SCROLL_PARAMETERS_DEFAULTS;
        scroll_right_parameters.scroll_bounds = { min: right_rectangle.y, max: right_rectangle.y + right_rectangle.height };
        this.hints_scroll_right = new ScrollManager(scroll_right_parameters);
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
        this.game_objects.hints_left_camera.setBounds(left_rectangle.x, left_rectangle.y, left_rectangle.width, left_rectangle.height * 100);
        this.game_objects.hints_left_camera.setScroll(left_rectangle.x, this.hints_scroll_left.scroll_state.scroll_position);
        this.game_objects.hints_left_camera.setPosition(left_rectangle.x, left_rectangle.y);
        this.game_objects.hints_left_camera.setSize(left_rectangle.width, left_rectangle.height);
        this.game_objects.hints_left_camera.setBackgroundColor(0xff0000);
        this.game_objects.hints_left_camera.setVisible(true);

        const padding = get_line_spacing_for_font_size(this.game_state, FONT_HINTS_TITLES);

        this.game_objects.hints_text.set_bounds(left_rectangle.x, left_rectangle.y, left_rectangle.width, Infinity);
        this.game_objects.hints_text.set_padding(padding, padding, padding, padding);
        this.game_objects.hints_text.update();
        this.game_objects.hints_text.setVisible(true);

        /* And the right hand camera... */
        if (!this.game_state.layout.square_scene_layout.is_vertical())
        {
            const right_rectangle = this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsRight)!;
            this.game_objects.hints_right_camera.setBounds(left_rectangle.x, left_rectangle.y, left_rectangle.width, left_rectangle.height * 100);
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

    handle_pointer_down(pointer: Phaser.Input.Pointer)
    {
        /* Are we in the left hints area? */
        const left_rectangle = this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsLeft)!;
        if (pointer.x >= left_rectangle.x && pointer.x <= left_rectangle.x + left_rectangle.width &&
            pointer.y >= left_rectangle.y && pointer.y <= left_rectangle.y + left_rectangle.height)
        {
            const touch_point = { x: pointer.x, y: pointer.y, time_milliseconds: this.scene.time.now };
            this.hints_scroll_left.touched(touch_point);
        }

        /* Are we in the right hints area? */
        if (!this.game_state.layout.square_scene_layout.is_vertical())
        {
            const right_rectangle = this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsRight)!;
            if (pointer.x >= right_rectangle.x && pointer.x <= right_rectangle.x + right_rectangle.width &&
                pointer.y >= right_rectangle.y && pointer.y <= right_rectangle.y + right_rectangle.height)
            {
                const touch_point = { x: pointer.x, y: pointer.y, time_milliseconds: this.scene.time.now };
                this.hints_scroll_right.touched(touch_point);
            }
        }
    }

    handle_pointer_up(pointer: Phaser.Input.Pointer)
    {
        /* Update the scroll managers with the current mouse / touch position */
        this.hints_scroll_left.released({ x: pointer.x, y: pointer.y, time_milliseconds: this.scene.time.now });
        this.hints_scroll_right.released({ x: pointer.x, y: pointer.y, time_milliseconds: this.scene.time.now });
    }

    handle_resize()
    {
        /* Ensure scrolling corrects for the new size */
        this.hints_scroll_left.scroll_parameters.scroll_bounds = {
            min: this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsLeft)!.y,
            max: this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsLeft)!.y + this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsLeft)!.height
        };

        this.hints_scroll_left.update_parameters(this.hints_scroll_left.scroll_parameters);

        if (this.game_state.layout.square_scene_layout.is_vertical())
        {
            this.hints_scroll_right.scroll_parameters.scroll_bounds = { min: 0, max: 0 };
            this.hints_scroll_right.update_parameters(this.hints_scroll_right.scroll_parameters);
        }
        else
        {
            this.hints_scroll_right.scroll_parameters.scroll_bounds = {
                min: this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsRight)!.y,
                max: this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsRight)!.y + this.game_state.layout.square_scene_layout.get_layout_rectangle(OuterScreenNode.HintsRight)!.height
            };
            this.hints_scroll_right.update_parameters(this.hints_scroll_right.scroll_parameters);
        }
    }

    update(): void
    {
        /* Update the scroll managers with the current mouse / touch position */
        this.hints_scroll_left.pointer_update({ x: this.scene.input.activePointer.x, y: this.scene.input.activePointer.y, time_milliseconds: this.scene.time.now });
        this.hints_scroll_right.pointer_update({ x: this.scene.input.activePointer.x, y: this.scene.input.activePointer.y, time_milliseconds: this.scene.time.now });

        this.hints_scroll_left.update(this.scene.time.now);
        this.hints_scroll_right.update(this.scene.time.now);

        /* Update the hints positions */
        this.draw();
    }
}