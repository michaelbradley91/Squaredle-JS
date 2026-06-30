/**
 * A basic checkbox component
 */

import Checkbox from "phaser4-rex-plugins/plugins/gameobjects/shape/checkbox/CheckboxShape";
import BaseUIComponent from "./base-ui-component";
import { CHECKBOX_BORDER_COLOR, CHECKBOX_CLEARED_COLOR, CHECKBOX_FILL_COLOR, CHECKBOX_TICK_COLOR, colour_to_hex } from "~/colours";
import { GameState } from "~/logic";

export default class CheckboxComponent<S extends Phaser.Scene> extends BaseUIComponent<S>
{
    public checkbox: Checkbox;
    public fill_color: number = colour_to_hex(CHECKBOX_FILL_COLOR);
    public border_color: number = colour_to_hex(CHECKBOX_BORDER_COLOR);
    public cleared_color: number = colour_to_hex(CHECKBOX_CLEARED_COLOR);
    public tick_color: number = colour_to_hex(CHECKBOX_TICK_COLOR);
    public valign: "top" | "middle" | "bottom" = "top";
    public halign: "left" | "center" | "right" = "left";

    public constructor(scene: S, game_state: GameState)
    {
        super(scene, game_state);
        this.bounds.width = 50;
        this.bounds.height = 50;
        this.checkbox = new Checkbox(scene, 0, 0, 50, 50, colour_to_hex(CHECKBOX_FILL_COLOR), {
            x: 0, y: 0, width: 50, height: 50
        });
        this.checkbox.setVisible(false);
        scene.add.existing(this.checkbox);
    }

    public update(): void
    {
        /* Work out the corresponding size of the square */
        const square_width = this.bounds.width - this.padding.left - this.padding.right;
        const square_height = this.bounds.height - this.padding.top - this.padding.bottom;
        const square_size = Math.min(square_width, square_height);

        let x = this.bounds.x + this.padding.left;
        let y = this.bounds.y + this.padding.top;
        if (this.halign === "center")
        {
            x = this.bounds.x + (this.bounds.width - square_size) / 2;
        }
        if (this.halign === "right")
        {
            x = this.bounds.x + this.bounds.width - square_size - this.padding.right;
        }
        if (this.valign === "middle")
        {
            y = this.bounds.y + (this.bounds.height - square_size) / 2;
        }
        if (this.valign === "bottom")
        {
            y = this.bounds.y + this.bounds.height - square_size - this.padding.bottom;
        }
        // The box is centred, confusingly, so adjust the position further
        x += square_size / 2;
        y += square_size / 2;

        this.checkbox.setPosition(x, y);
        this.checkbox.setSize(square_size, square_size);
        this.checkbox.setBoxFillStyle(this.fill_color);
        this.checkbox.setUncheckedBoxFillStyle(this.cleared_color);
        this.checkbox.setBoxStrokeStyle(2, this.border_color);
        this.checkbox.setUncheckedBoxStrokeStyle(2, this.border_color);
        this.checkbox.setCheckerStyle(this.tick_color);
    }

    public set_alignment(valign: "top" | "middle" | "bottom" = "middle", halign: "left" | "center" | "right" = "center")
    {
        this.valign = valign;
        this.halign = halign;
    }

    public set_style(fill_color: number = colour_to_hex(CHECKBOX_FILL_COLOR),
        border_color: number = colour_to_hex(CHECKBOX_BORDER_COLOR),
        cleared_color: number = colour_to_hex(CHECKBOX_CLEARED_COLOR),
        tick_color: number = colour_to_hex(CHECKBOX_TICK_COLOR))
    {
        this.fill_color = fill_color;
        this.border_color = border_color;
        this.cleared_color = cleared_color;
        this.tick_color = tick_color;
    }

    public get_size(): { width: number; height: number; }
    {
        /* The checkbox fills the bounds up to the square size constrained by padding */
        const square_width = this.checkbox.width;
        const square_height = this.checkbox.height;

        /* Return the size of the square */
        return {
            width: square_width + this.padding.left + this.padding.right,
            height: square_height + this.padding.top + this.padding.bottom
        };
    }
    public show(): void
    {
        this.checkbox.setVisible(true);
    }
    public hide(): void
    {
        this.checkbox.setVisible(false);
    }

    public destroy(): void
    {
        this.hide();
        this.checkbox.destroy();
    }
}
